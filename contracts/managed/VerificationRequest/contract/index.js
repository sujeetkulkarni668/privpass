import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

export var ClaimType;
(function (ClaimType) {
  ClaimType[ClaimType['PAN_VALID'] = 0] = 'PAN_VALID';
  ClaimType[ClaimType['AADHAAR_VERIFIED'] = 1] = 'AADHAAR_VERIFIED';
  ClaimType[ClaimType['AGE_OVER_18'] = 2] = 'AGE_OVER_18';
  ClaimType[ClaimType['IDENTITY_VERIFIED'] = 3] = 'IDENTITY_VERIFIED';
  ClaimType[ClaimType['RESIDENCY_VALID'] = 4] = 'RESIDENCY_VALID';
})(ClaimType || (ClaimType = {}));

export var RequestStatus;
(function (RequestStatus) {
  RequestStatus[RequestStatus['PENDING'] = 0] = 'PENDING';
  RequestStatus[RequestStatus['APPROVED'] = 1] = 'APPROVED';
  RequestStatus[RequestStatus['REJECTED'] = 2] = 'REJECTED';
  RequestStatus[RequestStatus['COMPLETED'] = 3] = 'COMPLETED';
  RequestStatus[RequestStatus['EXPIRED'] = 4] = 'EXPIRED';
  RequestStatus[RequestStatus['CANCELLED'] = 5] = 'CANCELLED';
})(RequestStatus || (RequestStatus = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = __compactRuntime.CompactTypeBoolean;

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_3 = new __compactRuntime.CompactTypeEnum(5, 1);

class _RequestRecord_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment()))))))));
  }
  fromValue(value_0) {
    return {
      requester: _descriptor_0.fromValue(value_0),
      panRequested: _descriptor_1.fromValue(value_0),
      aadhaarRequested: _descriptor_1.fromValue(value_0),
      ageRequested: _descriptor_1.fromValue(value_0),
      residencyRequested: _descriptor_1.fromValue(value_0),
      identityRequested: _descriptor_1.fromValue(value_0),
      createdAt: _descriptor_2.fromValue(value_0),
      expiresAt: _descriptor_2.fromValue(value_0),
      status: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.requester).concat(_descriptor_1.toValue(value_0.panRequested).concat(_descriptor_1.toValue(value_0.aadhaarRequested).concat(_descriptor_1.toValue(value_0.ageRequested).concat(_descriptor_1.toValue(value_0.residencyRequested).concat(_descriptor_1.toValue(value_0.identityRequested).concat(_descriptor_2.toValue(value_0.createdAt).concat(_descriptor_2.toValue(value_0.expiresAt).concat(_descriptor_3.toValue(value_0.status)))))))));
  }
}

const _descriptor_4 = new _RequestRecord_0();

class _ClaimResults_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment())))))))));
  }
  fromValue(value_0) {
    return {
      panRequested: _descriptor_1.fromValue(value_0),
      panValid: _descriptor_1.fromValue(value_0),
      aadhaarRequested: _descriptor_1.fromValue(value_0),
      aadhaarVerified: _descriptor_1.fromValue(value_0),
      ageRequested: _descriptor_1.fromValue(value_0),
      ageOver18: _descriptor_1.fromValue(value_0),
      residencyRequested: _descriptor_1.fromValue(value_0),
      residencyValid: _descriptor_1.fromValue(value_0),
      identityRequested: _descriptor_1.fromValue(value_0),
      identityVerified: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.panRequested).concat(_descriptor_1.toValue(value_0.panValid).concat(_descriptor_1.toValue(value_0.aadhaarRequested).concat(_descriptor_1.toValue(value_0.aadhaarVerified).concat(_descriptor_1.toValue(value_0.ageRequested).concat(_descriptor_1.toValue(value_0.ageOver18).concat(_descriptor_1.toValue(value_0.residencyRequested).concat(_descriptor_1.toValue(value_0.residencyValid).concat(_descriptor_1.toValue(value_0.identityRequested).concat(_descriptor_1.toValue(value_0.identityVerified))))))))));
  }
}

const _descriptor_5 = new _ClaimResults_0();

const _descriptor_6 = new __compactRuntime.CompactTypeBytes(128);

const _descriptor_7 = new __compactRuntime.CompactTypeBytes(16);

class _tuple_0 {
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

const _descriptor_8 = new _tuple_0();

class _tuple_1 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_6.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_9 = new _tuple_1();

class _tuple_2 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_0.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_10 = new _tuple_2();

class _tuple_3 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_7.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_11 = new _tuple_3();

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

const _descriptor_12 = new _Either_0();

const _descriptor_13 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

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

const _descriptor_14 = new _ContractAddress_0();

const _descriptor_15 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

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
    if (typeof(witnesses_0.requesterSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named requesterSecret');
    }
    if (typeof(witnesses_0.requesterSalt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named requesterSalt');
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
      createRequest: (...args_1) => {
        if (args_1.length !== 10) {
          throw new __compactRuntime.CompactError(`createRequest: expected 10 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const requester_0 = args_1[2];
        const panRequested_0 = args_1[3];
        const aadhaarRequested_0 = args_1[4];
        const ageRequested_0 = args_1[5];
        const residencyRequested_0 = args_1[6];
        const identityRequested_0 = args_1[7];
        const createdAt_0 = args_1[8];
        const expiresAt_0 = args_1[9];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(requester_0.buffer instanceof ArrayBuffer && requester_0.BYTES_PER_ELEMENT === 1 && requester_0.length === 32)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Bytes<32>',
                                     requester_0)
        }
        if (!(typeof(panRequested_0) === 'boolean')) {
          __compactRuntime.typeError('createRequest',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Boolean',
                                     panRequested_0)
        }
        if (!(typeof(aadhaarRequested_0) === 'boolean')) {
          __compactRuntime.typeError('createRequest',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Boolean',
                                     aadhaarRequested_0)
        }
        if (!(typeof(ageRequested_0) === 'boolean')) {
          __compactRuntime.typeError('createRequest',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Boolean',
                                     ageRequested_0)
        }
        if (!(typeof(residencyRequested_0) === 'boolean')) {
          __compactRuntime.typeError('createRequest',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Boolean',
                                     residencyRequested_0)
        }
        if (!(typeof(identityRequested_0) === 'boolean')) {
          __compactRuntime.typeError('createRequest',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Boolean',
                                     identityRequested_0)
        }
        if (!(typeof(createdAt_0) === 'bigint' && createdAt_0 >= 0n && createdAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Uint<0..18446744073709551616>',
                                     createdAt_0)
        }
        if (!(typeof(expiresAt_0) === 'bigint' && expiresAt_0 >= 0n && expiresAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'VerificationRequest.compact line 152 char 1',
                                     'Uint<0..18446744073709551616>',
                                     expiresAt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_0.toValue(requester_0).concat(_descriptor_1.toValue(panRequested_0).concat(_descriptor_1.toValue(aadhaarRequested_0).concat(_descriptor_1.toValue(ageRequested_0).concat(_descriptor_1.toValue(residencyRequested_0).concat(_descriptor_1.toValue(identityRequested_0).concat(_descriptor_2.toValue(createdAt_0).concat(_descriptor_2.toValue(expiresAt_0))))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()))))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createRequest_0(context,
                                               partialProofData,
                                               requestId_0,
                                               requester_0,
                                               panRequested_0,
                                               aadhaarRequested_0,
                                               ageRequested_0,
                                               residencyRequested_0,
                                               identityRequested_0,
                                               createdAt_0,
                                               expiresAt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      cancelRequest: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`cancelRequest: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('cancelRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'VerificationRequest.compact line 186 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('cancelRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'VerificationRequest.compact line 186 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._cancelRequest_0(context,
                                               partialProofData,
                                               requestId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      completeRequest: (...args_1) => {
        if (args_1.length !== 9) {
          throw new __compactRuntime.CompactError(`completeRequest: expected 9 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const nowUnixSeconds_0 = args_1[2];
        const panCommitment_0 = args_1[3];
        const aadhaarCommitment_0 = args_1[4];
        const ageCommitment_0 = args_1[5];
        const residencyCommitment_0 = args_1[6];
        const identityPanCommitment_0 = args_1[7];
        const identityAadhaarCommitment_0 = args_1[8];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(typeof(nowUnixSeconds_0) === 'bigint' && nowUnixSeconds_0 >= 0n && nowUnixSeconds_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Uint<0..18446744073709551616>',
                                     nowUnixSeconds_0)
        }
        if (!(panCommitment_0.buffer instanceof ArrayBuffer && panCommitment_0.BYTES_PER_ELEMENT === 1 && panCommitment_0.length === 32)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Bytes<32>',
                                     panCommitment_0)
        }
        if (!(aadhaarCommitment_0.buffer instanceof ArrayBuffer && aadhaarCommitment_0.BYTES_PER_ELEMENT === 1 && aadhaarCommitment_0.length === 32)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Bytes<32>',
                                     aadhaarCommitment_0)
        }
        if (!(ageCommitment_0.buffer instanceof ArrayBuffer && ageCommitment_0.BYTES_PER_ELEMENT === 1 && ageCommitment_0.length === 32)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Bytes<32>',
                                     ageCommitment_0)
        }
        if (!(residencyCommitment_0.buffer instanceof ArrayBuffer && residencyCommitment_0.BYTES_PER_ELEMENT === 1 && residencyCommitment_0.length === 32)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Bytes<32>',
                                     residencyCommitment_0)
        }
        if (!(identityPanCommitment_0.buffer instanceof ArrayBuffer && identityPanCommitment_0.BYTES_PER_ELEMENT === 1 && identityPanCommitment_0.length === 32)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Bytes<32>',
                                     identityPanCommitment_0)
        }
        if (!(identityAadhaarCommitment_0.buffer instanceof ArrayBuffer && identityAadhaarCommitment_0.BYTES_PER_ELEMENT === 1 && identityAadhaarCommitment_0.length === 32)) {
          __compactRuntime.typeError('completeRequest',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'VerificationRequest.compact line 210 char 1',
                                     'Bytes<32>',
                                     identityAadhaarCommitment_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_2.toValue(nowUnixSeconds_0).concat(_descriptor_0.toValue(panCommitment_0).concat(_descriptor_0.toValue(aadhaarCommitment_0).concat(_descriptor_0.toValue(ageCommitment_0).concat(_descriptor_0.toValue(residencyCommitment_0).concat(_descriptor_0.toValue(identityPanCommitment_0).concat(_descriptor_0.toValue(identityAadhaarCommitment_0)))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._completeRequest_0(context,
                                                 partialProofData,
                                                 requestId_0,
                                                 nowUnixSeconds_0,
                                                 panCommitment_0,
                                                 aadhaarCommitment_0,
                                                 ageCommitment_0,
                                                 residencyCommitment_0,
                                                 identityPanCommitment_0,
                                                 identityAadhaarCommitment_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      expireIfDue: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`expireIfDue: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const nowUnixSeconds_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('expireIfDue',
                                     'argument 1 (as invoked from Typescript)',
                                     'VerificationRequest.compact line 260 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('expireIfDue',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'VerificationRequest.compact line 260 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(typeof(nowUnixSeconds_0) === 'bigint' && nowUnixSeconds_0 >= 0n && nowUnixSeconds_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('expireIfDue',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'VerificationRequest.compact line 260 char 1',
                                     'Uint<0..18446744073709551616>',
                                     nowUnixSeconds_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_2.toValue(nowUnixSeconds_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._expireIfDue_0(context,
                                             partialProofData,
                                             requestId_0,
                                             nowUnixSeconds_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      createRequest: this.circuits.createRequest,
      cancelRequest: this.circuits.cancelRequest,
      completeRequest: this.circuits.completeRequest,
      expireIfDue: this.circuits.expireIfDue
    };
    this.provableCircuits = {
      createRequest: this.circuits.createRequest,
      cancelRequest: this.circuits.cancelRequest,
      completeRequest: this.circuits.completeRequest,
      expireIfDue: this.circuits.expireIfDue
    };
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
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('createRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('cancelRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('completeRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('expireIfDue', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_15.toValue(0n),
                                                                                              alignment: _descriptor_15.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_15.toValue(1n),
                                                                                              alignment: _descriptor_15.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_11, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_8, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_9, value_0);
    return result_0;
  }
  _requesterSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.requesterSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('requesterSecret',
                                 'return value',
                                 'VerificationRequest.compact line 78 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _requesterSalt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.requesterSalt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('requesterSalt',
                                 'return value',
                                 'VerificationRequest.compact line 79 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _dobUnixSeconds_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.dobUnixSeconds(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('dobUnixSeconds',
                                 'return value',
                                 'VerificationRequest.compact line 80 char 1',
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
                                 'VerificationRequest.compact line 81 char 1',
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
                                 'VerificationRequest.compact line 82 char 1',
                                 'Bytes<16>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_7.toValue(result_0),
      alignment: _descriptor_7.alignment()
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
                                 'VerificationRequest.compact line 83 char 1',
                                 'Bytes<16>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_7.toValue(result_0),
      alignment: _descriptor_7.alignment()
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
                                 'VerificationRequest.compact line 84 char 1',
                                 'Bytes<128>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_6.toValue(result_0),
      alignment: _descriptor_6.alignment()
    });
    return result_0;
  }
  _proveAgeOver18Internal_0(context,
                            partialProofData,
                            credentialCommitment_0,
                            nowUnixSeconds_0)
  {
    const dob_0 = this._dobUnixSeconds_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_2([dob_0, salt_0]);
    __compactRuntime.assert(this._equal_0(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    __compactRuntime.assert(nowUnixSeconds_0 >= dob_0, 'invalid dob');
    const age_0 = (__compactRuntime.assert(nowUnixSeconds_0 >= dob_0,
                                           'result of subtraction would be negative'),
                   nowUnixSeconds_0 - dob_0);
    return age_0 >= 568025136n;
  }
  _provePanValidInternal_0(context, partialProofData, credentialCommitment_0) {
    const pan_0 = this._panRaw_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_1([pan_0, salt_0]);
    __compactRuntime.assert(this._equal_1(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    let t_0, t_1;
    return (t_1 = BigInt(pan_0[0n]), t_1 >= 65n)
           &&
           (t_0 = BigInt(pan_0[0n]), t_0 <= 90n);
  }
  _proveAadhaarVerifiedInternal_0(context,
                                  partialProofData,
                                  credentialCommitment_0)
  {
    const aadhaar_0 = this._aadhaarRaw_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_1([aadhaar_0, salt_0]);
    __compactRuntime.assert(this._equal_2(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    let t_0, t_1;
    return (t_1 = BigInt(aadhaar_0[0n]), t_1 >= 48n)
           &&
           (t_0 = BigInt(aadhaar_0[0n]), t_0 <= 57n);
  }
  _proveResidencyValidInternal_0(context,
                                 partialProofData,
                                 credentialCommitment_0)
  {
    const address_0 = this._addressRaw_0(context, partialProofData);
    const salt_0 = this._commitmentSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_3([address_0, salt_0]);
    __compactRuntime.assert(this._equal_3(recomputed_0, credentialCommitment_0),
                            'commitment mismatch');
    return true;
  }
  _proveIdentityVerifiedInternal_0(context,
                                   partialProofData,
                                   panCommitment_0,
                                   aadhaarCommitment_0)
  {
    return this._provePanValidInternal_0(context,
                                         partialProofData,
                                         panCommitment_0)
           &&
           this._proveAadhaarVerifiedInternal_0(context,
                                                partialProofData,
                                                aadhaarCommitment_0);
  }
  _createRequest_0(context,
                   partialProofData,
                   requestId_0,
                   requester_0,
                   panRequested_0,
                   aadhaarRequested_0,
                   ageRequested_0,
                   residencyRequested_0,
                   identityRequested_0,
                   createdAt_0,
                   expiresAt_0)
  {
    const discRequestId_0 = requestId_0;
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_15.toValue(0n),
                                                                                                                   alignment: _descriptor_15.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'request already exists');
    __compactRuntime.assert(panRequested_0 || aadhaarRequested_0
                            ||
                            ageRequested_0
                            ||
                            residencyRequested_0
                            ||
                            identityRequested_0,
                            'at least one claim must be requested');
    __compactRuntime.assert(expiresAt_0 > createdAt_0,
                            'expiry must be after creation');
    const record_0 = { requester: requester_0,
                       panRequested: panRequested_0,
                       aadhaarRequested: aadhaarRequested_0,
                       ageRequested: ageRequested_0,
                       residencyRequested: residencyRequested_0,
                       identityRequested: identityRequested_0,
                       createdAt: createdAt_0,
                       expiresAt: expiresAt_0,
                       status: 0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_15.toValue(0n),
                                                                  alignment: _descriptor_15.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(record_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _cancelRequest_0(context, partialProofData, requestId_0) {
    const discRequestId_0 = requestId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_15.toValue(0n),
                                                                                                                  alignment: _descriptor_15.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'unknown request');
    const record_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_15.toValue(0n),
                                                                                                           alignment: _descriptor_15.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(discRequestId_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(record_0.status === 0,
                            'cannot cancel in current status');
    const secret_0 = this._requesterSecret_0(context, partialProofData);
    const salt_0 = this._requesterSalt_0(context, partialProofData);
    const recomputed_0 = this._persistentHash_0([secret_0, salt_0]);
    __compactRuntime.assert(this._equal_4(recomputed_0, record_0.requester),
                            'only the requesting organization may cancel');
    const tmp_0 = { requester: record_0.requester,
                    panRequested: record_0.panRequested,
                    aadhaarRequested: record_0.aadhaarRequested,
                    ageRequested: record_0.ageRequested,
                    residencyRequested: record_0.residencyRequested,
                    identityRequested: record_0.identityRequested,
                    createdAt: record_0.createdAt,
                    expiresAt: record_0.expiresAt,
                    status: 5 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_15.toValue(0n),
                                                                  alignment: _descriptor_15.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _completeRequest_0(context,
                     partialProofData,
                     requestId_0,
                     nowUnixSeconds_0,
                     panCommitment_0,
                     aadhaarCommitment_0,
                     ageCommitment_0,
                     residencyCommitment_0,
                     identityPanCommitment_0,
                     identityAadhaarCommitment_0)
  {
    const discRequestId_0 = requestId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_15.toValue(0n),
                                                                                                                  alignment: _descriptor_15.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'unknown request');
    const record_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_15.toValue(0n),
                                                                                                           alignment: _descriptor_15.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(discRequestId_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(record_0.status === 0, 'request not pending');
    let t_0;
    __compactRuntime.assert((t_0 = nowUnixSeconds_0, t_0 < record_0.expiresAt),
                            'request expired');
    const panOk_0 = !record_0.panRequested
                    ||
                    this._provePanValidInternal_0(context,
                                                  partialProofData,
                                                  panCommitment_0);
    const aadhaarOk_0 = !record_0.aadhaarRequested
                        ||
                        this._proveAadhaarVerifiedInternal_0(context,
                                                             partialProofData,
                                                             aadhaarCommitment_0);
    const ageOk_0 = !record_0.ageRequested
                    ||
                    this._proveAgeOver18Internal_0(context,
                                                   partialProofData,
                                                   ageCommitment_0,
                                                   nowUnixSeconds_0);
    const residencyOk_0 = !record_0.residencyRequested
                          ||
                          this._proveResidencyValidInternal_0(context,
                                                              partialProofData,
                                                              residencyCommitment_0);
    const identityOk_0 = !record_0.identityRequested
                         ||
                         this._proveIdentityVerifiedInternal_0(context,
                                                               partialProofData,
                                                               identityPanCommitment_0,
                                                               identityAadhaarCommitment_0);
    const claimResults_0 = { panRequested: record_0.panRequested,
                             panValid: record_0.panRequested && panOk_0,
                             aadhaarRequested: record_0.aadhaarRequested,
                             aadhaarVerified:
                               record_0.aadhaarRequested && aadhaarOk_0,
                             ageRequested: record_0.ageRequested,
                             ageOver18: record_0.ageRequested && ageOk_0,
                             residencyRequested: record_0.residencyRequested,
                             residencyValid:
                               record_0.residencyRequested && residencyOk_0,
                             identityRequested: record_0.identityRequested,
                             identityVerified:
                               record_0.identityRequested && identityOk_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_15.toValue(1n),
                                                                  alignment: _descriptor_15.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(claimResults_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_0 = { requester: record_0.requester,
                    panRequested: record_0.panRequested,
                    aadhaarRequested: record_0.aadhaarRequested,
                    ageRequested: record_0.ageRequested,
                    residencyRequested: record_0.residencyRequested,
                    identityRequested: record_0.identityRequested,
                    createdAt: record_0.createdAt,
                    expiresAt: record_0.expiresAt,
                    status: 3 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_15.toValue(0n),
                                                                  alignment: _descriptor_15.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _expireIfDue_0(context, partialProofData, requestId_0, nowUnixSeconds_0) {
    const discRequestId_0 = requestId_0;
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_15.toValue(0n),
                                                                                                                  alignment: _descriptor_15.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'unknown request');
    const record_0 = _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_15.toValue(0n),
                                                                                                           alignment: _descriptor_15.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_0.toValue(discRequestId_0),
                                                                                                           alignment: _descriptor_0.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    const discNow_0 = nowUnixSeconds_0;
    if (record_0.status === 0 && discNow_0 >= record_0.expiresAt) {
      const tmp_0 = { requester: record_0.requester,
                      panRequested: record_0.panRequested,
                      aadhaarRequested: record_0.aadhaarRequested,
                      ageRequested: record_0.ageRequested,
                      residencyRequested: record_0.residencyRequested,
                      identityRequested: record_0.identityRequested,
                      createdAt: record_0.createdAt,
                      expiresAt: record_0.expiresAt,
                      status: 4 };
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_15.toValue(0n),
                                                                    alignment: _descriptor_15.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(discRequestId_0),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_0),
                                                                                                alignment: _descriptor_4.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
      return 4;
    } else {
      return record_0.status;
    }
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
  _equal_4(x0, y0) {
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
    requests: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(0n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(0n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'VerificationRequest.compact line 111 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(0n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'VerificationRequest.compact line 111 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(0n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    results: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(1n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(1n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'VerificationRequest.compact line 112 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(1n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'VerificationRequest.compact line 112 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_15.toValue(1n),
                                                                                                     alignment: _descriptor_15.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_5.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  requesterSecret: (...args) => undefined,
  requesterSalt: (...args) => undefined,
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
