/**
 * wallet.ts — Midnight wallet detection, connection and state management.
 *
 * Uses the official @midnight-ntwrk/dapp-connector-api v4 shape:
 *   - Detection:   window.midnight[key] has { rdns, name, icon, apiVersion, connect }
 *   - Connection:  provider.connect(networkId) → ConnectedAPI
 *   - Address:     connectedApi.getShieldedAddresses() → { shieldedAddress, ... }
 *
 * Also provides a "Session Demo Wallet" (no extension needed) for quick testing.
 */

import type { InitialAPI, ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { setConnectedWalletAddress } from "./api.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DetectedWallet {
  key: string;          // key in window.midnight, or "__demo__"
  name: string;
  icon?: string;
  apiVersion?: string;
  rdns?: string;
  isDemo: boolean;
}

export interface WalletState {
  connected: boolean;
  wallet: DetectedWallet | null;
  address: string | null;        // shielded Bech32m address
  networkId: string | null;
  error: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSION_KEY       = "privpass_wallet";
const DEMO_SEED_KEY     = "privpass_demo_seed";
const DEMO_WALLET_KEY   = "__demo__";

// Connect to preprod (testnet) by default — change to "mainnet" for production
const DEFAULT_NETWORK_ID = "preprod";

// ── Internal state ────────────────────────────────────────────────────────────

let _state: WalletState = {
  connected: false, wallet: null, address: null, networkId: null, error: null,
};

const _listeners = new Set<(s: WalletState) => void>();

function setState(patch: Partial<WalletState>) {
  _state = { ..._state, ...patch };
  // Keep api.ts in sync for X-Wallet-Address header injection
  setConnectedWalletAddress(_state.connected && _state.address ? _state.address : null);
  // Persist to sessionStorage for refresh survival
  if (_state.connected && _state.address) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        wallet: _state.wallet,
        address: _state.address,
        networkId: _state.networkId,
      }));
    } catch { /* quota */ }
  } else {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }
  _listeners.forEach((fn) => fn({ ..._state }));
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getWalletState(): WalletState {
  return { ..._state };
}

export function onWalletStateChange(fn: (s: WalletState) => void): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/**
 * Enumerate all available wallets.
 *
 * Real wallets inject themselves into window.midnight using the DApp Connector
 * API (v4). Each entry has { rdns, name, icon, apiVersion, connect }.
 * We retry for up to 1.5 s because extensions inject asynchronously after
 * the document loads.
 *
 * Session Demo Wallet is always appended last.
 */
export async function detectWallets(): Promise<DetectedWallet[]> {
  // Retry loop: extensions inject after document ready, timing varies
  let midnightMap: Record<string, InitialAPI> | undefined;

  for (let i = 0; i < 15; i++) {
    const raw = (window as unknown as { midnight?: Record<string, InitialAPI> }).midnight;
    if (raw && typeof raw === "object" && Object.keys(raw).length > 0) {
      midnightMap = raw;
      break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  const detected: DetectedWallet[] = [];

  if (midnightMap) {
    // Collect both enumerable and non-enumerable own keys
    const keys = [
      ...Object.keys(midnightMap),
      ...Object.getOwnPropertyNames(midnightMap),
    ].filter((k, i, a) => a.indexOf(k) === i && !["__proto__", "constructor", "prototype"].includes(k));

    for (const key of keys) {
      const provider = midnightMap[key];
      if (!provider || typeof provider !== "object") continue;
      // v4 DApp Connector API shape: has .connect()
      // (older shape had .enable() — we support both)
      const hasConnect = typeof (provider as any).connect === "function";
      const hasEnable  = typeof (provider as any).enable  === "function";
      if (!hasConnect && !hasEnable) continue;

      detected.push({
        key,
        name:       provider.name       ?? key,
        icon:       provider.icon       || undefined,
        apiVersion: provider.apiVersion || undefined,
        rdns:       provider.rdns       || undefined,
        isDemo: false,
      });
    }
  }

  // Session Demo Wallet — always available, no extension required
  detected.push({
    key: DEMO_WALLET_KEY,
    name: "Session Demo Wallet",
    isDemo: true,
    apiVersion: "demo",
  });

  return detected;
}

/**
 * Connect to the wallet identified by `walletKey`.
 *
 * For real wallets (v4 DApp connector):
 *   1. provider.connect(networkId) → ConnectedAPI
 *   2. connectedApi.getShieldedAddresses() → shielded Bech32m address
 *
 * For Session Demo Wallet: generate an ephemeral address using Web Crypto.
 */
export async function connectWallet(walletKey: string): Promise<WalletState> {
  const wallets = await detectWallets();
  const wallet  = wallets.find((w) => w.key === walletKey);

  if (!wallet) {
    setState({ error: `Wallet "${walletKey}" not found. Refresh and try again.` });
    return getWalletState();
  }

  setState({ error: null });
  return wallet.isDemo ? _connectDemo(wallet) : _connectReal(wallet);
}

// ── Real wallet connection (v4 DApp Connector API) ────────────────────────────

async function _connectReal(wallet: DetectedWallet): Promise<WalletState> {
  const midnightMap = (window as unknown as { midnight?: Record<string, InitialAPI> }).midnight;
  const provider    = midnightMap?.[wallet.key] as (InitialAPI & { enable?: (name: string) => Promise<any> }) | undefined;

  if (!provider) {
    setState({ error: `${wallet.name} is no longer available. Refresh and try again.` });
    return getWalletState();
  }

  try {
    let connectedApi: ConnectedAPI | any;
    let networkId = DEFAULT_NETWORK_ID;

    if (typeof provider.connect === "function") {
      // v4 API: connect(networkId) → ConnectedAPI
      connectedApi = await provider.connect(DEFAULT_NETWORK_ID);
    } else if (typeof provider.enable === "function") {
      // Older API: enable(dappName) → legacy wallet API
      connectedApi = await provider.enable("PrivPass");
    } else {
      throw new Error("Wallet does not expose a connect() or enable() method.");
    }

    // Resolve address — try v4 methods first, then legacy fallbacks
    let address: string | undefined;

    if (typeof connectedApi.getShieldedAddresses === "function") {
      const result = await connectedApi.getShieldedAddresses();
      address = result?.shieldedAddress ?? result?.shieldedCoinPublicKey;
    }

    if (!address && typeof connectedApi.getUnshieldedAddress === "function") {
      const result = await connectedApi.getUnshieldedAddress();
      address = result?.unshieldedAddress;
    }

    // Legacy (pre-v4) fallbacks
    if (!address && typeof connectedApi.state === "function") {
      const s = await connectedApi.state();
      address = s?.address ?? s?.coinPublicKey ?? s?.spendingPublicKey;
      networkId = s?.networkId ?? networkId;
    }

    if (!address) {
      setState({ error: `${wallet.name} connected but returned no address. Make sure your wallet is set up on the Midnight ${DEFAULT_NETWORK_ID} network.` });
      return getWalletState();
    }

    // Subscribe to account/network change events if the wallet supports them
    if (typeof connectedApi.on === "function") {
      connectedApi.on("accountChange", (s: any) => {
        if (s?.address || s?.shieldedAddress) {
          setState({ address: s.shieldedAddress ?? s.address, networkId: s.networkId ?? _state.networkId });
        } else {
          disconnectWallet();
        }
      });
      connectedApi.on("networkChange", (nId: string) => setState({ networkId: nId }));
    }

    setState({ connected: true, wallet, address, networkId, error: null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isRejected = /rejected|denied|cancel/i.test(msg) || (err as any)?.code === 4001;

    setState({
      connected: false,
      error: isRejected
        ? "You rejected the connection. Please approve it in the wallet extension popup."
        : `Connection failed: ${msg}`,
    });
  }

  return getWalletState();
}

// ── Session Demo Wallet ───────────────────────────────────────────────────────

async function _connectDemo(wallet: DetectedWallet): Promise<WalletState> {
  try {
    let seedHex = sessionStorage.getItem(DEMO_SEED_KEY);
    if (!seedHex) {
      const seed = crypto.getRandomValues(new Uint8Array(32));
      seedHex = Array.from(seed).map((b) => b.toString(16).padStart(2, "0")).join("");
      sessionStorage.setItem(DEMO_SEED_KEY, seedHex);
    }

    const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("privpass-demo:" + seedHex));
    const hex     = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    // Bech32m-style Midnight preprod demo address
    const address = `mn_demo_${hex.slice(0, 52)}`;

    setState({ connected: true, wallet, address, networkId: "demo", error: null });
  } catch (err: unknown) {
    setState({ error: `Demo wallet error: ${err instanceof Error ? err.message : String(err)}` });
  }
  return getWalletState();
}

// ── Disconnect ────────────────────────────────────────────────────────────────

export function disconnectWallet(): void {
  try { sessionStorage.removeItem(SESSION_KEY);   } catch {}
  try { sessionStorage.removeItem(DEMO_SEED_KEY); } catch {}
  setState({ connected: false, wallet: null, address: null, networkId: null, error: null });
}

// ── Session restore ───────────────────────────────────────────────────────────

export function restoreWalletSession(): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const { wallet, address, networkId } = JSON.parse(raw);
    if (wallet && address) {
      setState({ connected: true, wallet, address, networkId: networkId ?? "unknown", error: null });
    }
  } catch {}
}

restoreWalletSession();
