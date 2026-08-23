import dotenv from 'dotenv';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', 'backend', '.env') });
import crypto from 'node:crypto';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { NetworkId } from '@midnight-ntwrk/zswap';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { ZKConfigProvider, createProverKey, createVerifierKey, createZKIR } from '@midnight-ntwrk/midnight-js-types';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { firstValueFrom, filter } from 'rxjs';

const CONTRACTS_MANAGED_DIR = join(__dirname, '..', 'managed');
const BACKEND_ENV_PATH = join(__dirname, '..', '..', 'backend', '.env');

class MultiContractZkConfigProvider extends ZKConfigProvider<any> {
  constructor(private baseDir: string) {
    super();
  }

  private findAndRead(subDir: string, circuitId: string, ext: string): Buffer {
    const contracts = ['CredentialRegistry', 'VerificationRequest', 'RevocationRegistry', 'IdentityVerification'];
    for (const c of contracts) {
      const filePath = join(this.baseDir, c, subDir, circuitId + ext);
      if (existsSync(filePath)) {
        return readFileSync(filePath);
      }
    }
    throw new Error('Cannot find ' + subDir + '/' + circuitId + ext + ' in ' + this.baseDir);
  }

  async getProverKey(circuitId: string) {
    const buf = this.findAndRead('keys', circuitId, '.prover');
    return createProverKey(buf);
  }

  async getVerifierKey(circuitId: string) {
    const buf = this.findAndRead('keys', circuitId, '.verifier');
    return createVerifierKey(buf);
  }

  async getZKIR(circuitId: string) {
    const buf = this.findAndRead('zkir', circuitId, '.bzkir');
    return createZKIR(buf);
  }
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function main() {
  let rawSeed = process.env.MIDNIGHT_WALLET_SEED;
  if (!rawSeed) {
    console.error('ERROR: MIDNIGHT_WALLET_SEED is required.');
    process.exit(1);
  }

  let seed32 = rawSeed.trim();
  if (seed32.includes(' ')) {
    seed32 = crypto.pbkdf2Sync(seed32.normalize('NFKD'), 'mnemonic', 2048, 32, 'sha512').toString('hex');
  }

  const indexerUrl = process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql';
  const indexerWsUrl = process.env.MIDNIGHT_INDEXER_WS_URL || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';
  const nodeUrl = process.env.MIDNIGHT_NODE_URL || 'https://rpc.preprod.midnight.network';
  const proofServerUrl = process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://localhost:6300';

  console.log('Connecting to Midnight Preprod with proof server at', proofServerUrl);
  setNetworkId('testnet');

  const wallet = await WalletBuilder.buildFromSeed(
    indexerUrl,
    indexerWsUrl,
    proofServerUrl,
    nodeUrl,
    seed32,
    NetworkId.TestNet,
    'warn'
  );
  wallet.start();

  console.log('Waiting for wallet synchronization on Midnight Preprod...');
  const walletState = await firstValueFrom(
    wallet.state().pipe(filter((s: any) => Boolean(s.address)))
  );
  console.log('Wallet ready on Preprod. Address:', walletState.address);

  const walletProvider = {
    getCoinPublicKey() {
      return walletState.coinPublicKey;
    },
    getEncryptionPublicKey() {
      return walletState.encryptionPublicKey;
    },
    async balanceTx(tx: any, ttl?: Date) {
      console.log('Balancing transaction with wallet...');
      const recipe = await wallet.balanceTransaction(tx, []);
      console.log('Generating Zero-Knowledge proofs via local proof server...');
      return await wallet.proveTransaction(recipe);
    },
  };

  const midnightProvider = {
    async submitTx(tx: any) {
      console.log('Submitting finalized transaction to Midnight network...');
      return await wallet.submitTransaction(tx);
    },
  };

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStoragePasswordProvider: () => seed32,
      accountId: 'privpass-deployer',
    }),
    publicDataProvider: indexerPublicDataProvider(indexerUrl, indexerWsUrl),
    proofProvider: (httpClientProofProvider as any)(proofServerUrl),
    zkConfigProvider: new MultiContractZkConfigProvider(CONTRACTS_MANAGED_DIR),
    walletProvider,
    midnightProvider,
  } as const;

  console.log('Loading compiled contract classes from managed/...');
  const CredentialRegistryModule = await import(pathToFileURL(join(CONTRACTS_MANAGED_DIR, 'CredentialRegistry', 'contract', 'index.js')).href as any);
  const VerificationRequestModule = await import(pathToFileURL(join(CONTRACTS_MANAGED_DIR, 'VerificationRequest', 'contract', 'index.js')).href as any);
  const RevocationRegistryModule = await import(pathToFileURL(join(CONTRACTS_MANAGED_DIR, 'RevocationRegistry', 'contract', 'index.js')).href as any);

  const adminSecret = process.env.MIDNIGHT_ADMIN_SECRET || '0000000000000000000000000000000000000000000000000000000000000001';
  const adminSalt = process.env.MIDNIGHT_ADMIN_SALT || '0000000000000000000000000000000000000000000000000000000000000002';
  const issuerSecret = process.env.MIDNIGHT_ISSUER_SECRET || '0000000000000000000000000000000000000000000000000000000000000003';
  const issuerSalt = process.env.MIDNIGHT_ISSUER_SALT || '0000000000000000000000000000000000000000000000000000000000000004';

  console.log('1/3: Deploying RevocationRegistry contract to Midnight Preprod...');
  const revRegCompiled = CompiledContract.make('RevocationRegistry', RevocationRegistryModule.Contract);
  const revRegWithWitnesses = CompiledContract.withWitnesses(revRegCompiled, {
    issuerSecret: () => hexToBytes(issuerSecret),
    issuerSalt: () => hexToBytes(issuerSalt),
  });

  const deployedRevReg = await (deployContract as any)(providers, {
    compiledContract: revRegWithWitnesses,
    privateStateId: 'privpass-deploy-rev-reg',
    initialPrivateState: {},
  });
  const revRegAddress = deployedRevReg.deployTxData.public.contractAddress;
  console.log('>>> RevocationRegistry deployed on Preprod at:', revRegAddress);

  console.log('2/3: Deploying VerificationRequest contract to Midnight Preprod...');
  const verReqCompiled = CompiledContract.make('VerificationRequest', VerificationRequestModule.Contract);
  const verReqWithWitnesses = CompiledContract.withWitnesses(verReqCompiled, {
    requesterSecret: () => hexToBytes('0000000000000000000000000000000000000000000000000000000000000005'),
    requesterSalt: () => hexToBytes('0000000000000000000000000000000000000000000000000000000000000006'),
    dobUnixSeconds: () => 0n,
    commitmentSalt: () => new Uint8Array(32),
    panRaw: () => new Uint8Array(16),
    aadhaarRaw: () => new Uint8Array(16),
    addressRaw: () => new Uint8Array(128),
  });

  const deployedVerReq = await (deployContract as any)(providers, {
    compiledContract: verReqWithWitnesses,
    privateStateId: 'privpass-deploy-ver-req',
    initialPrivateState: {},
  });
  const verReqAddress = deployedVerReq.deployTxData.public.contractAddress;
  console.log('>>> VerificationRequest deployed on Preprod at:', verReqAddress);

  console.log('3/3: Deploying CredentialRegistry contract to Midnight Preprod...');
  const credRegCompiled = CompiledContract.make('CredentialRegistry', CredentialRegistryModule.Contract);
  const credRegWithWitnesses = CompiledContract.withWitnesses(credRegCompiled, {
    issuerSecret: () => hexToBytes(issuerSecret),
    issuerSalt: () => hexToBytes(issuerSalt),
  });

  const deployedCredReg = await (deployContract as any)(providers, {
    compiledContract: credRegWithWitnesses,
    privateStateId: 'privpass-deploy-cred-reg',
    initialPrivateState: {},
  });
  const credRegAddress = deployedCredReg.deployTxData.public.contractAddress;
  console.log('>>> CredentialRegistry deployed on Preprod at:', credRegAddress);

  if (existsSync(BACKEND_ENV_PATH)) {
    let envContent = readFileSync(BACKEND_ENV_PATH, 'utf-8');
    envContent = envContent.replace(/MIDNIGHT_WALLET_SEED=.*/, 'MIDNIGHT_WALLET_SEED=' + seed32);
    envContent = envContent.replace(/MIDNIGHT_CONTRACT_ADDRESS_CREDENTIAL_REGISTRY=.*/, 'MIDNIGHT_CONTRACT_ADDRESS_CREDENTIAL_REGISTRY=' + credRegAddress);
    envContent = envContent.replace(/MIDNIGHT_CONTRACT_ADDRESS_VERIFICATION_REQUEST=.*/, 'MIDNIGHT_CONTRACT_ADDRESS_VERIFICATION_REQUEST=' + verReqAddress);
    envContent = envContent.replace(/MIDNIGHT_CONTRACT_ADDRESS_REVOCATION_REGISTRY=.*/, 'MIDNIGHT_CONTRACT_ADDRESS_REVOCATION_REGISTRY=' + revRegAddress);
    writeFileSync(BACKEND_ENV_PATH, envContent, 'utf-8');
    console.log('Successfully updated backend/.env with deployed Midnight contract addresses!');
  }

  await wallet.close();
  console.log('Deployment to Midnight Preprod completed successfully!');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
