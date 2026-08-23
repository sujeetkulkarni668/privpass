import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum ClaimType { PAN_VALID = 0,
                        AADHAAR_VERIFIED = 1,
                        AGE_OVER_18 = 2,
                        IDENTITY_VERIFIED = 3,
                        RESIDENCY_VALID = 4
}

export enum RequestStatus { PENDING = 0,
                            APPROVED = 1,
                            REJECTED = 2,
                            COMPLETED = 3,
                            EXPIRED = 4,
                            CANCELLED = 5
}

export type RequestRecord = { requester: Uint8Array;
                              panRequested: boolean;
                              aadhaarRequested: boolean;
                              ageRequested: boolean;
                              residencyRequested: boolean;
                              identityRequested: boolean;
                              createdAt: bigint;
                              expiresAt: bigint;
                              status: RequestStatus
                            };

export type ClaimResults = { panRequested: boolean;
                             panValid: boolean;
                             aadhaarRequested: boolean;
                             aadhaarVerified: boolean;
                             ageRequested: boolean;
                             ageOver18: boolean;
                             residencyRequested: boolean;
                             residencyValid: boolean;
                             identityRequested: boolean;
                             identityVerified: boolean
                           };

export type Witnesses<PS> = {
  requesterSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  requesterSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  dobUnixSeconds(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  commitmentSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  panRaw(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  aadhaarRaw(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  addressRaw(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                requester_0: Uint8Array,
                panRequested_0: boolean,
                aadhaarRequested_0: boolean,
                ageRequested_0: boolean,
                residencyRequested_0: boolean,
                identityRequested_0: boolean,
                createdAt_0: bigint,
                expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  completeRequest(context: __compactRuntime.CircuitContext<PS>,
                  requestId_0: Uint8Array,
                  nowUnixSeconds_0: bigint,
                  panCommitment_0: Uint8Array,
                  aadhaarCommitment_0: Uint8Array,
                  ageCommitment_0: Uint8Array,
                  residencyCommitment_0: Uint8Array,
                  identityPanCommitment_0: Uint8Array,
                  identityAadhaarCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  expireIfDue(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array,
              nowUnixSeconds_0: bigint): __compactRuntime.CircuitResults<PS, RequestStatus>;
}

export type ProvableCircuits<PS> = {
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                requester_0: Uint8Array,
                panRequested_0: boolean,
                aadhaarRequested_0: boolean,
                ageRequested_0: boolean,
                residencyRequested_0: boolean,
                identityRequested_0: boolean,
                createdAt_0: bigint,
                expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  completeRequest(context: __compactRuntime.CircuitContext<PS>,
                  requestId_0: Uint8Array,
                  nowUnixSeconds_0: bigint,
                  panCommitment_0: Uint8Array,
                  aadhaarCommitment_0: Uint8Array,
                  ageCommitment_0: Uint8Array,
                  residencyCommitment_0: Uint8Array,
                  identityPanCommitment_0: Uint8Array,
                  identityAadhaarCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  expireIfDue(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array,
              nowUnixSeconds_0: bigint): __compactRuntime.CircuitResults<PS, RequestStatus>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                requester_0: Uint8Array,
                panRequested_0: boolean,
                aadhaarRequested_0: boolean,
                ageRequested_0: boolean,
                residencyRequested_0: boolean,
                identityRequested_0: boolean,
                createdAt_0: bigint,
                expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cancelRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  completeRequest(context: __compactRuntime.CircuitContext<PS>,
                  requestId_0: Uint8Array,
                  nowUnixSeconds_0: bigint,
                  panCommitment_0: Uint8Array,
                  aadhaarCommitment_0: Uint8Array,
                  ageCommitment_0: Uint8Array,
                  residencyCommitment_0: Uint8Array,
                  identityPanCommitment_0: Uint8Array,
                  identityAadhaarCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  expireIfDue(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array,
              nowUnixSeconds_0: bigint): __compactRuntime.CircuitResults<PS, RequestStatus>;
}

export type Ledger = {
  requests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): RequestRecord;
    [Symbol.iterator](): Iterator<[Uint8Array, RequestRecord]>
  };
  results: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): ClaimResults;
    [Symbol.iterator](): Iterator<[Uint8Array, ClaimResults]>
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
