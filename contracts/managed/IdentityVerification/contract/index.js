import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = __compactRuntime.CompactTypeBoolean;

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_3 = new __compactRuntime.CompactTypeBytes(16);

const _descriptor_4 = new __compactRuntime.CompactTypeBytes(128);

class _tuple_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_4.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_5 = new _tuple_0();

class _tuple_1 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_2.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_6 = new _tuple_1();

class _tuple_2 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_3.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_7 = new _tuple_2();

class _Either_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_1.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_8 = new _Either_0();

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_10 = new _ContractAddress_0();

const _descriptor_11 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.dobUnixSeconds) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named dobUnixSeconds');
    }
    if (typeof(witnesses_0.commitmentSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named commitmentSalt');
    }
    if (typeof(witnesses_0.panRaw) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named panRaw');
    }
    if (typeof(witnesses_0.aadhaarRaw) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named aadhaarRaw');
    }
    if (typeof(witnesses_0.addressRaw) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named addressRaw');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      proveAgeOver18: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`proveAgeOver18: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credentialCommitment_0 = args_1[1];
        const nowUnixSeconds_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveAgeOver18',
                                     'argument 1 (as invoked from Typescript)',
                                     'IdentityVerification.compact line 33 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(credentialCommitment_0.buffer instanceof ArrayBuffer && credentialCommitment_0.BYTES_PER_ELEMENT === 1 && credentialCommitment_0.length === 32)) {
          __compactRuntime.typeError('proveAgeOver18',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'IdentityVerification.compact line 33 char 1',
                                     'Bytes<32>',
                                     credentialCommitment_0)
        }
        if (!(typeof(nowUnixSeconds_0) === 'bigint' && nowUnixSeconds_0 >= 0n && nowUnixSeconds_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveAgeOver18',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'IdentityVerification.compact line 33 char 1',
                                     'Uint<0..18446744073709551616>',
                                     nowUnixSeconds_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(credentialCommitment_0).concat(_descriptor_2.toValue(nowUnixSeconds_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveAgeOver18_0(context,
                                                partialProofData,
                                                credentialCommitment_0,
                                                nowUnixSeconds_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      provePanValid: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`provePanValid: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credentialCommitment_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('provePanValid',
                                     'argument 1 (as invoked from Typescript)',
                                     'IdentityVerification.compact line 56 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(credentialCommitment_0.buffer instanceof ArrayBuffer && credentialCommitment_0.BYTES_PER_ELEMENT === 1 && credentialCommitment_0.length === 32)) {
          __compactRuntime.typeError('provePanValid',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'IdentityVerification.compact line 56 char 1',
                                     'Bytes<32>',
                                     credentialCommitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(credentialCommitment_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._provePanValid_0(context,
                                               partialProofData,
                                               credentialCommitment_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      proveAadhaarVerified: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`proveAadhaarVerified: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credentialCommitment_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveAadhaarVerified',
                                     'argument 1 (as invoked from Typescript)',
                                     'IdentityVerification.compact line 73 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(credentialCommitment_0.buffer instanceof ArrayBuffer && credentialCommitment_0.BYTES_PER_ELEMENT === 1 && credentialCommitment_0.length === 32)) {
          __compactRuntime.typeError('proveAadhaarVerified',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'IdentityVerification.compact line 73 char 1',
                                     'Bytes<32>',
                                     credentialCommitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(credentialCommitment_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveAadhaarVerified_0(context,
                                                      partialProofData,
                                                      credentialCommitment_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      proveResidencyValid: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`proveResidencyValid: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credentialCommitment_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveResidencyValid',
                                     'argument 1 (as invoked from Typescript)',
                                     'IdentityVerification.compact line 88 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(credentialCommitment_0.buffer instanceof ArrayBuffer && credentialCommitment_0.BYTES_PER_ELEMENT === 1 && credentialCommitment_0.length === 32)) {
          __compactRuntime.typeError('proveResidencyValid',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'IdentityVerification.compact line 88 char 1',
                                     'Bytes<32>',
                                     credentialCommitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(credentialCommitment_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveResidencyValid_0(context,
                                                     partialProofData,
                                                     credentialCommitment_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      proveIdentityVerified: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`proveIdentityVerified: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const panCommitment_0 = args_1[1];
        const aadhaarCommitment_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveIdentityVerified',
                                     'argument 1 (as invoked from Typescript)',
                                     'IdentityVerification.compact line 103 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(panCommitment_0.buffer instanceof ArrayBuffer && panCommitment_0.BYTES_PER_ELEMENT === 1 && panCommitment_0.length === 32)) {
          __compactRuntime.typeError('proveIdentityVerified',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'IdentityVerification.compact line 103 char 1',
                                     'Bytes<32>',
                                     panCommitment_0)
        }
        if (!(aadhaarCommitment_0.buffer instanceof ArrayBuffer && aadhaarCommitment_0.BYTES_PER_ELEMENT === 1 && aadhaarCommitment_0.length === 32)) {
          __compactRuntime.typeError('proveIdentityVerified',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'IdentityVerification.compact line 103 char 1',
                                     'Bytes<32>',
                                     aadhaarCommitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(panCommitment_0).concat(_descriptor_0.toValue(aadhaarCommitment_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveIdentityVerified_0(context,
                                                       partialProofData,
                                                       panCommitment_0,
                                                       aadhaarCommitment_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      proveAgeOver18: this.circuits.proveAgeOver18,
      provePanValid: this.circuits.provePanValid,
      proveAadhaarVerified: this.circuits.proveAadhaarVerified,
      proveResidencyValid: this.circuits.proveResidencyValid,
      proveIdentityVerified: this.circuits.proveIdentityVerified
    };
    this.provableCircuits = {};
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_7, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_5, value_0);
    return result_0;
  }
  _dobUnixSeconds_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.dobUnixSeconds(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('dobUnixSeconds',
                                 'return value',
                                 'IdentityVerification.compact line 23 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _commitmentSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.commitmentSalt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('commitmentSalt',
                                 'return value',
                                 'IdentityVerification.compact line 24 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _panRaw_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.panRaw(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 16)) {
      __compactRuntime.typeError('panRaw',
                                 'return value',
                                 'IdentityVerification.compact line 25 char 1',
                                 'Bytes<16>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_3.toValue(result_0),
      alignment: _descriptor_3.alignment()
    });
    return result_0;
  }
  _aadhaarRaw_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.aadhaarRaw(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 16)) {
      __compactRuntime.typeError('aadhaarRaw',
                                 'return value',
                                 'IdentityVerification.compact line 26 char 1',
                                 'Bytes<16>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_3.toValue(result_0),
      alignment: _descriptor_3.alignment()
    });
    return result_0;
  }
  _addressRaw_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.addressRaw(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 128)) {
      __compactRuntime.typeError('addressRaw',
                                 'return value',
                                 'IdentityVerification.compact line 27 char 1',
                                 'Bytes<128>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_4.toValue(result_0),
      alignment: _descriptor_4.alignment()
    });
    return result_0;
  }
  _proveAgeOver18_0(context,
                    partialProofData,
                    credentialCommitment_0,
                    nowUnixSeconds_0)
  {
    const dob_0 = this._dobUnixSeconds_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_0([dob_0, salt_0]);
    __compactRuntime.assert(this._equal_0(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    const eighteenYears_0 = 568025136n;
    __compactRuntime.assert(nowUnixSeconds_0 >= dob_0,
                            'invalid dob relative to now');
    const age_0 = (__compactRuntime.assert(nowUnixSeconds_0 >= dob_0,
                                           'result of subtraction would be negative'),
                   nowUnixSeconds_0 - dob_0);
    return age_0 >= eighteenYears_0;
  }
  _provePanValid_0(context, partialProofData, credentialCommitment_0) {
    const pan_0 = this._panRaw_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_1([pan_0, salt_0]);
    __compactRuntime.assert(this._equal_1(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    let t_0, t_1;
    const isPan_0 = (t_1 = BigInt(pan_0[0n]), t_1 >= 65n)
                    &&
                    (t_0 = BigInt(pan_0[0n]), t_0 <= 90n);
    return isPan_0;
  }
  _proveAadhaarVerified_0(context, partialProofData, credentialCommitment_0) {
    const aadhaar_0 = this._aadhaarRaw_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_1([aadhaar_0, salt_0]);
    __compactRuntime.assert(this._equal_2(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    let t_0, t_1;
    const isAadhaar_0 = (t_1 = BigInt(aadhaar_0[0n]), t_1 >= 48n)
                        &&
                        (t_0 = BigInt(aadhaar_0[0n]), t_0 <= 57n);
    return isAadhaar_0;
  }
  _proveResidencyValid_0(context, partialProofData, credentialCommitment_0) {
    const address_0 = this._addressRaw_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_2([address_0, salt_0]);
    __compactRuntime.assert(this._equal_3(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    return true;
  }
  _proveIdentityVerified_0(context,
                           partialProofData,
                           panCommitment_0,
                           aadhaarCommitment_0)
  {
    const panOk_0 = this._provePanValid_0(context,
                                          partialProofData,
                                          panCommitment_0);
    const aadhaarOk_0 = this._proveAadhaarVerified_0(context,
                                                     partialProofData,
                                                     aadhaarCommitment_0);
    return panOk_0 && aadhaarOk_0;
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  dobUnixSeconds: (...args) => undefined,
  commitmentSalt: (...args) => undefined,
  panRaw: (...args) => undefined,
  aadhaarRaw: (...args) => undefined,
  addressRaw: (...args) => undefined
});
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
