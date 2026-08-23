import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum CredentialType { PAN = 0,
                             AADHAAR = 1,
                             AGE = 2,
                             RESIDENCY = 3,
                             IDENTITY_COMPOSITE = 4
}

export enum CredentialStatus { ISSUED = 0, ACTIVE = 1, EXPIRED = 2, REVOKED = 3
}

export type CredentialRecord = { commitment: Uint8Array;
                                 credentialType: CredentialType;
                                 issuer: Uint8Array;
                                 issuedAt: bigint;
                                 expiresAt: bigint;
                                 status: CredentialStatus
                               };

export type Witnesses<PS> = {
  issuerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  issuerSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  authorizeIssuer(context: __compactRuntime.CircuitContext<PS>,
                  issuerIdentity_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerCredential(context: __compactRuntime.CircuitContext<PS>,
                     commitment_0: Uint8Array,
                     credentialType_0: CredentialType,
                     issuer_0: Uint8Array,
                     issuedAt_0: bigint,
                     expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  statusOf(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array,
           now_0: bigint): __compactRuntime.CircuitResults<PS, CredentialStatus>;
}

export type ProvableCircuits<PS> = {
  authorizeIssuer(context: __compactRuntime.CircuitContext<PS>,
                  issuerIdentity_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerCredential(context: __compactRuntime.CircuitContext<PS>,
                     commitment_0: Uint8Array,
                     credentialType_0: CredentialType,
                     issuer_0: Uint8Array,
                     issuedAt_0: bigint,
                     expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  statusOf(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array,
           now_0: bigint): __compactRuntime.CircuitResults<PS, CredentialStatus>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  authorizeIssuer(context: __compactRuntime.CircuitContext<PS>,
                  issuerIdentity_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  registerCredential(context: __compactRuntime.CircuitContext<PS>,
                     commitment_0: Uint8Array,
                     credentialType_0: CredentialType,
                     issuer_0: Uint8Array,
                     issuedAt_0: bigint,
                     expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  statusOf(context: __compactRuntime.CircuitContext<PS>,
           commitment_0: Uint8Array,
           now_0: bigint): __compactRuntime.CircuitResults<PS, CredentialStatus>;
}

export type Ledger = {
  authorizedIssuers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  credentials: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): CredentialRecord;
    [Symbol.iterator](): Iterator<[Uint8Array, CredentialRecord]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
