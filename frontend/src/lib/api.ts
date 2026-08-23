/// <reference types="vite/client" />

const BASE = (import.meta as any).env?.VITE_API_URL
  ? String((import.meta as any).env.VITE_API_URL).replace(/\/$/, "")
  : "/api";

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Surface the backend's error code AND any zod validation details, so
    // callers can show the real reason instead of guessing from the
    // string alone. Previously only `error` was available, which led
    // Register.tsx to collapse every non-"account_exists" failure
    // (rate limits, network errors, validation on other fields, server
    // errors) into a misleading "password too short" message even when
    // the password was perfectly valid.
    const apiError = new Error(body.error ?? `request_failed_${res.status}`) as Error & {
      code?: string;
      details?: unknown;
      status?: number;
    };
    apiError.code = body.error ?? `request_failed_${res.status}`;
    apiError.details = body.details;
    apiError.status = res.status;
    throw apiError;
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  register: (data: { email: string; password: string; displayName: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ accessToken: string; user: { id: string; email: string; displayName: string } }>(
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

  issueCredential: (type: string) =>
    request("/credentials/issue", { method: "POST", body: JSON.stringify({ type }) }),

  revokeCredential: (id: string, reason?: string) =>
    request(`/credentials/${id}/revoke`, { method: "POST", body: JSON.stringify({ reason }) }),

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
    request<{ status: string; claimResults: Record<string, boolean>; proofValid: boolean }>(
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
