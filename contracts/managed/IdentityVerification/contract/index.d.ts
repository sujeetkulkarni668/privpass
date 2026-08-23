import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  dobUnixSeconds(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  commitmentSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  panRaw(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  aadhaarRaw(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  addressRaw(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  proveAgeOver18(context: __compactRuntime.CircuitContext<PS>,
                 credentialCommitment_0: Uint8Array,
                 nowUnixSeconds_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  provePanValid(context: __compactRuntime.CircuitContext<PS>,
                credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  proveAadhaarVerified(context: __compactRuntime.CircuitContext<PS>,
                       credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  proveResidencyValid(context: __compactRuntime.CircuitContext<PS>,
                      credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  proveIdentityVerified(context: __compactRuntime.CircuitContext<PS>,
                        panCommitment_0: Uint8Array,
                        aadhaarCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  proveAgeOver18(context: __compactRuntime.CircuitContext<PS>,
                 credentialCommitment_0: Uint8Array,
                 nowUnixSeconds_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  provePanValid(context: __compactRuntime.CircuitContext<PS>,
                credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  proveAadhaarVerified(context: __compactRuntime.CircuitContext<PS>,
                       credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  proveResidencyValid(context: __compactRuntime.CircuitContext<PS>,
                      credentialCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  proveIdentityVerified(context: __compactRuntime.CircuitContext<PS>,
                        panCommitment_0: Uint8Array,
                        aadhaarCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
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
