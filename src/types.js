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
 * Arguments for the PolyToken Approval event
 */
export type ApprovalEventArgs = {
  _owner: string,
  _spender: string,
  _value: BigNumber,
};

/**
 * Arguments for the PolyToken events
 */
export type PolyTokenEventArgs = TransferEventArgs | ApprovalEventArgs;

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
  active: boolean,
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

/**
 * STOProposal struct from Compliance.sol
 */
export type STOProposal = {
  stoContractAddress: string,
  auditorAddress: string,
  vestingPeriod: BigNumber,
  quorum: BigNumber,
  fee: BigNumber,
};

/**
 * TemplateReputation struct from Compliance.sol
 */
export type TemplateReputation = {
  owner: string,
  totalRaised: BigNumber,
  timesUsed: BigNumber,
  expires: BigNumber,
};

/**
 * Arguments for the Compliance.sol LogTemplateCreated event
 */
export type LogTemplateCreated = {
  creator: string,
  _template: string,
  _offeringType: string,
};

/**
 * Arguments for the Compliance.sol LogNewTemplateProposal event
 */
export type LogNewTemplateProposal = {
  _securityToken: string,
  _template: string,
  _delegate: string,
};

/**
 * Arguments for the Compliance.sol LogNewContractProposal event
 */
export type LogNewContractProposal = {
  _securityToken: string,
  _offeringContract: string,
  _delegate: string,
};

/**
 * Arguments for the Compliance events
 */
export type ComplianceEventArgs =
  | LogTemplateCreated
  | LogNewTemplateProposal
  | LogNewContractProposal;

// SecurityToken types

/**
 * Token details gathered from SecurityToken.sol
 */
export type TokenDetails = {
  templateAddress: string,
  delegateAddress: string,
  merkleRoot: string,
  STO: string,
  KYC: string,
};

/**
 * PolyAllocation struct from SecurityToken.sol
 */
export type PolyAllocation = {
  amount: BigNumber,
  vestingPeriod: BigNumber,
  quorum: number,
  yayVotes: BigNumber,
  yayPercent: BigNumber,
  frozen: boolean,
};

/**
 * Shareholder struct from SecurityToken.sol
 */
export type Shareholder = {
  verifier: string,
  allowed: boolean,
  role: number,
};

/**
 * Arguments for the SecurityToken.sol LogTemplateSet event
 */
export type LogTemplateSet = {
  _delegateAddress: string,
  _template: string,
  _KYC: string,
};

/**
 * Arguments for the SecurityToken.sol LogUpdatedComplianceProof event
 */
export type LogUpdatedComplianceProof = {
  merkleRoot: string,
  _complianceProofHash: string,
};

/**
 * Arguments for the SecurityToken.sol LogSetSTOContract event
 */
export type LogSetSTOContract = {
  _STO: string,
  _STOtemplate: string,
  _auditor: string,
  _startTime: BigNumber,
  _endTime: BigNumber,
};

/**
 * Arguments for the SecurityToken.sol LogNewWhitelistedAddress event
 */
export type LogNewWhitelistedAddress = {
  _KYC: string,
  _shareholder: string,
  _role: CustomerRole,
};

/**
 * Arguments for the SecurityToken.sol LogNewBlacklistedAddress event
 */
export type LogNewBlacklistedAddress = {
  _KYC: string,
  _shareholder: string,
};

/**
 * Arguments for the SecurityToken.sol LogVoteToFreeze event
 */
export type LogVoteToFreeze = {
  _recipient: string,
  _yayPercent: BigNumber,
  quorum: BigNumber,
  _frozen: boolean,
};

/**
 * Arguments for the SecurityToken.sol LogTokenIssued event
 */
export type LogTokenIssued = {
  _contributor: string,
  _stAmount: BigNumber,
  _polyContributed: BigNumber,
  _timestamp: BigNumber,
};

/**
 * Arguments for the SecurityToken events
 */
export type SecurityTokenEventArgs =
  | LogTemplateSet
  | LogUpdatedComplianceProof
  | LogSetSTOContract
  | LogNewWhitelistedAddress
  | LogVoteToFreeze
  | LogTokenIssued;

// SecurityTokenRegistrar types

/**
 * SecurityTokenData struct from SecurityTokenRegistrar.sol
 */
export type SecurityTokenData = {
  totalSupply: BigNumber,
  owner: string,
  ticker: string,
  securityType: number,
};

// SecurityTokenRegistrarEvents

/**
 * Arguments for the SecurityTokenRegistrar.sol LogNewSecurityToken event
 */
export type LogNewSecurityToken = {
  ticker: string,
  securityTokenAddress: string,
  owner: string,
  host: string,
  fee: BigNumber,
  _type: Number,
};

/**
 * Arguments for the SecurityTokenRegistrar.sol LogSecurityToken event
 */
export type LogSecurityToken = {
  securityTokenAddress: string,
};

// STOContract Events

/**
 * Arguments for the STOContract.sol LogBoughtSecurityToken event
 */
export type LogBoughtSecurityToken = {
  _contributor: string,
  _ployContribution: BigNumber,
  _timestamp: BigNumber,
};

export type STOContractEventArgs = LogBoughtSecurityToken;

// Template Events

/**
 * Arguments for the Template.sol DetailsUpdated event
 */
export type DetailsUpdated = {
  previousDetails: string,
  newDetails: string,
  updateDate: BigNumber,
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
