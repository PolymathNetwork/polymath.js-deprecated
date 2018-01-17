// @flow

import BigNumber from 'bignumber.js';
import Filter from 'web3/lib/web3/filter';
import Web3 from 'web3';

/** A Web3 provider */
export type Web3Provider = Web3.Provider;

/** A Web3 filter */
export type Web3Filter = Filter;

// ContractWrapper types

/**
 * Argument values for filtering event logs
 */
export type IndexedFilterValues = {
  [string]: string | BigNumber,
};

/**
 * Callback for event logs
 */
export type EventCallback<LogArgs> = (err: ?Error, log?: Log<LogArgs>) => void;

/**
 * A range of blocks on the blockchain
 */
export type BlockRange = {
  fromBlock?: number | string,
  toBlock?: number | string,
};

/**
 * An event log
 */
export type Log<LogArgs> = {
  args: LogArgs,
  address: string,
  blockHash: ?string,
  blockNumber: ?number,
  data: string,
  event: string,
  logIndex: ?number,
  topics: Array<string>,
  transactionHash: string,
  transactionIndex: ?number,
};

// PolyToken types

/**
 * Arguments for the PolyToken Transfer event
 */
export type TransferEventArgs = {
  _from: string,
  _to: string,
  _value: BigNumber,
};

/**
 * Arguments for the PolyToken Allowance event
 */
export type AllowanceEventArgs = {
  _owner: string,
  _spender: string,
  _value: BigNumber,
};

/**
 * Arguments for the PolyToken events
 */
export type PolyTokenEventArgs = TransferEventArgs | AllowanceEventArgs;

// Customers types

/**
 * An enum of the types of `Customer`
 */
export type CustomerRole = 'investor' | 'issuer' | 'delegate' | 'marketmaker';

/**
 * A user of the Polymath platform
 */
export type Customer = {
  jurisdiction: string,
  accredited: boolean,
  role: CustomerRole,
  verified: boolean,
  expires: BigNumber,
};

/**
 * A KYC provider
 */
export type KYCProvider = {
  name: string,
  joined: BigNumber,
  detailsHash: string,
  verificationFee: BigNumber,
};

/**
 * Arguments for the Customers LogNewProvider event
 */
export type LogNewProviderArgs = {
  providerAddress: string,
  name: string,
  details: string,
};

/**
 * Arguments for the Customers LogCustomerVerified event
 */
export type LogCustomerVerifiedArgs = {
  customer: string,
  provider: string,
  role: CustomerRole,
};

/**
 * Arguments for the Customers events
 */
export type CustomersEventArgs = LogNewProviderArgs | LogCustomerVerifiedArgs;

// Compliance

export type STOProposal = {
  stoContractAddress: string,
  auditorAddress: string,
  vestingPeriod: BigNumber,
  quorum: BigNumber,
  fee: BigNumber,
};

export type LogTemplateCreated = {
  creator: string,
  _template: string,
  _offeringType: string,
};

export type LogNewTemplateProposal = {
  _securityToken: string,
  _template: string,
  _delegate: string,
};

export type LogNewContractProposal = {
  _securityToken: string,
  _offeringContract: string,
  _delegate: string,
};

export type ComplianceEventArgs =
  | LogTemplateCreated
  | LogNewTemplateProposal
  | LogNewContractProposal;

// SecurityToken types

export type LogTemplateSet = {
  _delegateAddress: string,
  _template: string,
  _KYC: string,
};

export type LogUpdatedComplianceProof = {
  merkleRoot: string,
  _complianceProofHash: string,
};

export type LogSetSTOContract = {
  _STO: string,
  _STOtemplate: string,
  _auditor: string,
  _startTime: BigNumber,
  _endTime: BigNumber,
};

export type LogNewWhitelistedAddress = {
  _KYC: string,
  _shareholder: string,
  _role: CustomerRole,
};

export type LogVoteToFreeze = {
  _recipient: string,
  _yayPercent: BigNumber,
  quorum: BigNumber,
  _frozen: boolean,
};

export type LogTokenIssued = {
  _contributor: string,
  _stAmount: BigNumber,
  _polyContributed: BigNumber,
  _timestamp: BigNumber,
};

export type SecurityTokenEventArgs =
  | LogTemplateSet
  | LogUpdatedComplianceProof
  | LogSetSTOContract
  | LogNewWhitelistedAddress
  | LogVoteToFreeze
  | LogTokenIssued;

// SecurityTokenRegistrar types

export type TokenDetails = {
  templateAddress: string,
  delegateAddress: string,
  complianceProof: string,
  STO: string,
  KYC: string,
};

// SecurityTokenRegistrarEvents

export type LogNewSecurityToken = {
  ticker: string,
  securityTokenAddress: string,
  owner: string,
  host: string,
  fee: BigNumber,
  _type: Number,
};

export class PolymathError extends Error {}

export class ContractNotFoundError extends PolymathError {
  constructor(address: ?string) {
    const message: string =
      address != null
        ? `Could not find contract "${address}".`
        : 'Could not find contract.';
    super(message);
    this.name = 'ContractNotFound';
  }
}

const feeErrorMessage = (methodName: ?string, fee: ?BigNumber) => {
  const feePhrase =
    fee != null ? `of ${fee.toFormat()} POLY (in base units)` : 'to be paid';
  const message: string =
    methodName != null
      ? `"${methodName}" requires a fee ${feePhrase}. `
      : `This method requires a fee ${feePhrase}.`;

  return message;
};

export class InsufficientAllowanceError extends PolymathError {
  constructor(methodName: ?string, fee: ?BigNumber) {
    super(
      `${feeErrorMessage(
        methodName,
        fee,
      )} Use the PolyToken "approve" method to approve that payment.`,
    );
    this.name = 'InsufficientAllowance';
  }
}

export class InsufficientBalanceError extends PolymathError {
  constructor(methodName: ?string, fee: ?BigNumber) {
    super(
      `${feeErrorMessage(
        methodName,
        fee,
      )} The account used has insufficient funds.`,
    );
    this.name = 'InsufficientBalance';
  }
}
