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
