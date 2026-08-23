// midnightClient.ts
//
// Adapter between PrivPass's backend and the real Midnight network via the
// official @midnight-ntwrk/midnight-js-* packages. This is the piece that
// replaces "trust the database" with "anchor state changes on-chain and
// read verified results back" for credential registration/revocation and
// verification-request completion.
//
// STATUS: implements the real integration path using the API surface
// documented at https://docs.midnight.network (WalletBuilder, provider
// composition, deployContract/findDeployedContract, callTx.<circuit>()) —
// see the package doc-comments below for exactly which docs/examples each
// piece is based on. It CANNOT be exercised end-to-end in this sandbox:
// there is no network egress here (no indexer/node/proof-server reachable,
// no compiled contracts/managed/* yet). Exact generic types for
// DeployedContract, and exactly how a given compactc version's generated
// bindings expose their Witnesses type, will need small adjustments once
// you run this against a real compile + Preprod endpoint — those spots are
// marked below.
//
// This module is intentionally never imported eagerly at server startup;
// callers ask isMidnightConfigured() first (see routes) so the rest of the
// app keeps working against Postgres alone until Preprod deployment is
// real, exactly like proofService.ts's LOCAL_CHECK/compiled-bindings split.

import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTRACTS_MANAGED_DIR = join(__dirname, "..", "..", "..", "contracts", "managed");

export interface MidnightConfig {
  networkId: string;
  indexerUrl: string;
  indexerWsUrl: string;
  nodeUrl: string;
  proofServerUrl: string;
  zkConfigPath: string;
  walletSeed: string;
  contractAddresses: {
    credentialRegistry: string;
    verificationRequest: string;
    revocationRegistry: string;
  };
  issuerAuth: { secret: string; salt: string };
  adminAuth: { secret: string; salt: string };
}

function readConfig(): MidnightConfig | null {
  const env = process.env;
  const required = [
    "MIDNIGHT_INDEXER_URL",
    "MIDNIGHT_NODE_URL",
    "MIDNIGHT_WALLET_SEED",
    "MIDNIGHT_CONTRACT_ADDRESS_CREDENTIAL_REGISTRY",
    "MIDNIGHT_CONTRACT_ADDRESS_VERIFICATION_REQUEST",
    "MIDNIGHT_ISSUER_SECRET",
    "MIDNIGHT_ISSUER_SALT",
  ];
  if (required.some((key) => !env[key])) return null;

  return {
    networkId: env.MIDNIGHT_NETWORK_ID ?? "undeployed",
    indexerUrl: env.MIDNIGHT_INDEXER_URL!,
    indexerWsUrl: env.MIDNIGHT_INDEXER_WS_URL ?? env.MIDNIGHT_INDEXER_URL!.replace(/^http/, "ws"),
    nodeUrl: env.MIDNIGHT_NODE_URL!,
    proofServerUrl: env.MIDNIGHT_PROOF_SERVER_URL ?? "http://localhost:6300",
    zkConfigPath: env.MIDNIGHT_ZK_CONFIG_PATH ?? CONTRACTS_MANAGED_DIR,
    walletSeed: env.MIDNIGHT_WALLET_SEED!,
    contractAddresses: {
      credentialRegistry: env.MIDNIGHT_CONTRACT_ADDRESS_CREDENTIAL_REGISTRY!,
      verificationRequest: env.MIDNIGHT_CONTRACT_ADDRESS_VERIFICATION_REQUEST!,
      revocationRegistry: env.MIDNIGHT_CONTRACT_ADDRESS_REVOCATION_REGISTRY ?? "",
    },
    issuerAuth: { secret: env.MIDNIGHT_ISSUER_SECRET!, salt: env.MIDNIGHT_ISSUER_SALT! },
    adminAuth: { secret: env.MIDNIGHT_ADMIN_SECRET ?? "", salt: env.MIDNIGHT_ADMIN_SALT ?? "" },
  };
}

/**
 * True once (a) the env vars above are set, AND (b) compiled contract
 * bindings exist in contracts/managed/. Routes should check this before
 * attempting any on-chain call and fall back to a clearly-logged
 * DB-only path otherwise — mirrors proofService.ts's existing pattern.
 */
export function isMidnightConfigured(): boolean {
  return readConfig() !== null && existsSync(CONTRACTS_MANAGED_DIR) &&
    ["CredentialRegistry", "VerificationRequest"].every((name) =>
      existsSync(join(CONTRACTS_MANAGED_DIR, name))
    );
}

let cachedClient: Promise<MidnightClient> | null = null;

export function getMidnightClient(): Promise<MidnightClient> {
  if (!isMidnightConfigured()) {
    throw new Error(
      "Midnight is not configured — set the MIDNIGHT_* env vars in backend/.env " +
        "and compile contracts (yarn workspace @privpass/contracts compile) before calling getMidnightClient()."
    );
  }
  if (!cachedClient) cachedClient = buildClient();
  return cachedClient;
}

interface MidnightClient {
  registerCredential(args: {
    commitment: Uint8Array;
    credentialType: string;
    issuedAt: bigint;
    expiresAt: bigint;
  }): Promise<{ txHash: string }>;
  revokeCredential(commitment: Uint8Array): Promise<{ txHash: string }>;
  statusOf(commitment: Uint8Array, now: bigint): Promise<string>;
  createVerificationRequest(args: {
    requestId: Uint8Array;
    requester: Uint8Array;
    panRequested: boolean;
    aadhaarRequested: boolean;
    ageRequested: boolean;
    residencyRequested: boolean;
    identityRequested: boolean;
    createdAt: bigint;
    expiresAt: bigint;
  }): Promise<{ txHash: string }>;
  completeVerificationRequest(args: {
    requestId: Uint8Array;
    nowUnixSeconds: bigint;
    panCommitment: Uint8Array;
    aadhaarCommitment: Uint8Array;
    ageCommitment: Uint8Array;
    residencyCommitment: Uint8Array;
    identityPanCommitment: Uint8Array;
    identityAadhaarCommitment: Uint8Array;
  }): Promise<{ txHash: string }>;
}

// Builds the real client. Structured per the official Midnight docs'
// "Deploy the hello world contract" / Counter CLI tutorials and the
// midnight-js-contracts README:
//   providers = { privateStateProvider, publicDataProvider, proofProvider,
//                 zkConfigProvider, walletProvider, midnightProvider }
//   deployContract(providers, { contract, privateStateId, initialPrivateState, initialState })
//   findDeployedContract(providers, { contractAddress, contract, privateStateId, initialPrivateState })
//   deployed.callTx.<circuitName>(...args) — submits a tx, generates the
//   real ZK proof via proofProvider, and returns finalized tx data.
async function buildClient(): Promise<MidnightClient> {
  const config = readConfig();
  if (!config) throw new Error("Midnight not configured");

  // Dynamic imports: these packages (and the compiled contract modules
  // under contracts/managed) only exist once `yarn install` and a real
  // compile have run, so importing them at module load time would break
  // `yarn typecheck`/`yarn build` in this repo before that's done.
  const [
    { deployContract, findDeployedContract },
    { indexerPublicDataProvider },
    { levelPrivateStateProvider },
    { httpClientProofProvider },
    { NodeZkConfigProvider },
    { setNetworkId },
    { WalletBuilder },
  ] = await Promise.all([
    import("@midnight-ntwrk/midnight-js-contracts"),
    import("@midnight-ntwrk/midnight-js-indexer-public-data-provider"),
    import("@midnight-ntwrk/midnight-js-level-private-state-provider"),
    import("@midnight-ntwrk/midnight-js-http-client-proof-provider"),
    import("@midnight-ntwrk/midnight-js-node-zk-config-provider"),
    import("@midnight-ntwrk/midnight-js-network-id"),
    import("@midnight-ntwrk/wallet"),
  ]);

  setNetworkId(config.networkId as any);

  const wallet = await WalletBuilder.buildFromSeed(
    config.indexerUrl,
    config.indexerWsUrl,
    config.proofServerUrl,
    config.nodeUrl,
    config.walletSeed,
    config.networkId as any,
    "info"
  );
  wallet.start();

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStoragePasswordProvider: () => config.walletSeed,
      accountId: "privpass-backend",
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexerUrl, config.indexerWsUrl),
    proofProvider: (httpClientProofProvider as any)(config.proofServerUrl),
    zkConfigProvider: new NodeZkConfigProvider(config.zkConfigPath),
    walletProvider: wallet,
    midnightProvider: wallet,
  } as const;

  // Compiled contract modules — only resolvable after a real compile.
  // TypeScript can't statically resolve these paths pre-compile, hence
  // the `as any` + dynamic import; once contracts/managed exists this
  // should be tightened to real imports of the generated contract classes.
  const { pathToFileURL } = await import("node:url");
  const CredentialRegistryModule = await import(
    pathToFileURL(join(CONTRACTS_MANAGED_DIR, "CredentialRegistry", "contract", "index.js")).href as any
  );
  const VerificationRequestModule = await import(
    pathToFileURL(join(CONTRACTS_MANAGED_DIR, "VerificationRequest", "contract", "index.js")).href as any
  );

  const credentialRegistry = await (findDeployedContract as any)(providers, {
    contractAddress: config.contractAddresses.credentialRegistry,
    contract: new CredentialRegistryModule.Contract({
      issuerSecret: () => hexToBytes(config.issuerAuth.secret),
      issuerSalt: () => hexToBytes(config.issuerAuth.salt),
      adminSecret: () => hexToBytes(config.adminAuth.secret),
      adminSalt: () => hexToBytes(config.adminAuth.salt),
    }),
    privateStateId: "privpass-credential-registry",
    initialPrivateState: {},
  });

  const verificationRequest = await (findDeployedContract as any)(providers, {
    contractAddress: config.contractAddresses.verificationRequest,
    contract: new VerificationRequestModule.Contract({
      requesterSecret: () => hexToBytes(process.env.MIDNIGHT_REQUESTER_SECRET ?? ""),
      requesterSalt: () => hexToBytes(process.env.MIDNIGHT_REQUESTER_SALT ?? ""),
    }),
    privateStateId: "privpass-verification-request",
    initialPrivateState: {},
  });

  return {
    async registerCredential({ commitment, credentialType, issuedAt, expiresAt }) {
      const issuerId = /* persistentHash(issuerSecret, issuerSalt) */ hexToBytes(
        config.issuerAuth.secret
      ); // TODO: compute the real commitment client-side to match the circuit
      const tx = await credentialRegistry.callTx.registerCredential(
        commitment,
        credentialType,
        issuerId,
        issuedAt,
        expiresAt
      );
      return { txHash: tx.public.txHash };
    },
    async revokeCredential(commitment) {
      const tx = await credentialRegistry.callTx.revokeCredential(commitment);
      return { txHash: tx.public.txHash };
    },
    async statusOf(commitment, now) {
      const tx = await credentialRegistry.callTx.statusOf(commitment, now);
      return (tx.public as any)?.result as string;
    },
    async createVerificationRequest(args) {
      const tx = await verificationRequest.callTx.createRequest(
        args.requestId,
        args.requester,
        args.panRequested,
        args.aadhaarRequested,
        args.ageRequested,
        args.residencyRequested,
        args.identityRequested,
        args.createdAt,
        args.expiresAt
      );
      return { txHash: tx.public.txHash };
    },
    async completeVerificationRequest(args) {
      const tx = await verificationRequest.callTx.completeRequest(
        args.requestId,
        args.nowUnixSeconds,
        args.panCommitment,
        args.aadhaarCommitment,
        args.ageCommitment,
        args.residencyCommitment,
        args.identityPanCommitment,
        args.identityAadhaarCommitment
      );
      return { txHash: tx.public.txHash };
    },
  };
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}
