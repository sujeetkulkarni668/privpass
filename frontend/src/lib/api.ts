/// <reference types="vite/client" />

const BASE = (import.meta as any).env?.VITE_API_URL
  ? String((import.meta as any).env.VITE_API_URL).replace(/\/$/, "")
  : "/api";

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Wallet address is set by the wallet connection module (wallet.ts).
// It is included in issuance requests as the X-Wallet-Address header.
let connectedWalletAddress: string | null = null;
export function setConnectedWalletAddress(address: string | null) {
  connectedWalletAddress = address;
}
export function getConnectedWalletAddress(): string | null {
  return connectedWalletAddress;
}

async function request<T>(path: string, init: RequestInit = {}, extraHeaders?: Record<string, string>): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
    ...extraHeaders,
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (connectedWalletAddress) headers["X-Wallet-Address"] = connectedWalletAddress;

  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const apiError = new Error(body.error ?? `request_failed_${res.status}`) as Error & {
      code?: string;
      details?: unknown;
      status?: number;
      message_detail?: string;
    };
    apiError.code = body.error ?? `request_failed_${res.status}`;
    apiError.details = body.details;
    apiError.status = res.status;
    apiError.message_detail = body.message;
    throw apiError;
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  register: (data: { username: string; password: string; displayName: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { username: string; password: string }) =>
    request<{ accessToken: string; user: { id: string; username: string; displayName: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) }
    ),

  listCredentials: () => request<{ credentials: any[] }>("/credentials"),

  listOrganizations: () => request<{ organizations: { id: string; name: string; slug: string; role: string }[] }>("/organizations"),

  createOrganization: (name: string) => request<{ organization: any }>("/organizations", { method: "POST", body: JSON.stringify({ name }) }),

  listCredentialHistory: () => request<{ credentials: any[] }>("/credentials/history"),

  listVerificationHistory: () =>
    request<{
      verifications: {
        id: string;
        organizationName: string;
        claims: string[];
        result: string;
        verifiedAt: string;
        claimResults: Record<string, boolean> | null;
        proofValid: boolean;
      }[];
    }>("/verifications"),

  issueCredential: (type: string, customWitness?: { value?: string; dob?: string; countryCode?: string }) =>
    request("/credentials/issue", { method: "POST", body: JSON.stringify({ type, customWitness }) }),

  revokeCredential: (id: string, reason?: string) =>
    request(`/credentials/${id}/revoke`, { method: "POST", body: JSON.stringify({ reason }) }),

  linkWallet: (walletAddress: string) =>
    request("/auth/wallet", { method: "PUT", body: JSON.stringify({ walletAddress }) }),

  getVerificationRequest: (id: string) =>
    request<{
      id: string;
      organization: { name: string };
      requestedClaims: string[];
      optionalClaims: string[];
      status: string;
      expiresAt: string;
    }>(`/verification-requests/${id}`),

  createVerificationRequest: (data: {
    organizationId: string;
    requestedClaims: string[];
    optionalClaims?: string[];
    expiresInMinutes?: number;
  }) =>
    request<{ id: string; verifyUrl: string; qrDataUrl: string }>("/verification-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  giveConsent: (requestId: string, approvedClaims: string[]) =>
    request(`/verifications/${requestId}/consent`, {
      method: "POST",
      body: JSON.stringify({ approvedClaims }),
    }),

  submitProof: (requestId: string, witnesses: Record<string, { salt: string; rawValue: string }>) =>
    request<{ status: string; claimResults: Record<string, boolean>; proofValid: boolean; nullifier?: string; blockHeight?: number }>(
      `/verifications/${requestId}/prove`,
      { method: "POST", body: JSON.stringify({ witnesses }) }
    ),
};

export const CLAIM_LABELS: Record<string, string> = {
  PAN_VALID: "PAN validity",
  AADHAAR_VERIFIED: "Aadhaar verification",
  AGE_OVER_18: "Age 18 or over",
  IDENTITY_VERIFIED: "Full identity verification",
  RESIDENCY_VALID: "Residency validity",
};

export const CLAIM_WITHHOLDS: Record<string, string> = {
  PAN_VALID: "PAN number",
  AADHAAR_VERIFIED: "Aadhaar number",
  AGE_OVER_18: "Exact date of birth",
  IDENTITY_VERIFIED: "PAN number, Aadhaar number",
  RESIDENCY_VALID: "Full address",
};

export interface IndustryPreset {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  requiredClaims: string[];
  optionalClaims: string[];
  recommendedOrg: string;
}

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: "fintech_kyc",
    name: "Fintech KYC Tier 1",
    tagline: "Essential compliance for banking, loan approvals, and payments.",
    icon: "🏦",
    requiredClaims: ["PAN_VALID", "AGE_OVER_18"],
    optionalClaims: ["RESIDENCY_VALID"],
    recommendedOrg: "Apex Global Finance",
  },
  {
    id: "defi_age_gate",
    name: "DeFi Age & Compliance Gate",
    tagline: "Regulatory age-gating for high-yield vaults and derivative DEXes.",
    icon: "⚡",
    requiredClaims: ["AGE_OVER_18"],
    optionalClaims: ["RESIDENCY_VALID"],
    recommendedOrg: "Hyperion Protocol",
  },
  {
    id: "crypto_exchange",
    name: "Crypto Exchange Onboarding",
    tagline: "Full zero-knowledge identity check without raw biometric storage.",
    icon: "🪙",
    requiredClaims: ["IDENTITY_VERIFIED", "AGE_OVER_18"],
    optionalClaims: ["RESIDENCY_VALID"],
    recommendedOrg: "Midnight Exchange Corp",
  },
  {
    id: "sybil_airdrop",
    name: "Sybil-Resistant Airdrop",
    tagline: "Ensures 1 claim per unique human via on-chain nullifiers.",
    icon: "🛡️",
    requiredClaims: ["AADHAAR_VERIFIED"],
    optionalClaims: [],
    recommendedOrg: "Aura Network DAO",
  },
];
