// @flow

import contract from 'truffle-contract';
import uuid from 'uuid/v4';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import type {
  BlockRange,
  EventCallback,
  IndexedFilterValues,
  Log,
  Web3Filter,
} from '../types';

/**
 * Base class for contract wrappers
 */
export default class ContractWrapper {
  _web3Wrapper: Web3Wrapper;

  _contractTemplate: any;
  _contractAddress: ?string;
  _contract: any;

  _filters: { [string]: Web3Filter };
  // _filterCallback: { [string]: EventCallback<mixed> };

  isInitialized: boolean;
  isInitializing: boolean;

  /**
   * @hideconstructor
   */
  constructor(
    web3Wrapper: Web3Wrapper,
    artifact: any,
    deployedAddress?: string,
  ) {
    this._web3Wrapper = web3Wrapper;

    this._contractTemplate = contract(artifact);
    this._contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
    this._contractAddress = deployedAddress;

    this._filters = {};

    this.isInitialized = false;
    this.isInitializing = false;
  }

  async initialize() {
    if (this.isInitializing || this.isInitialized) {
      return;
    }

    this.isInitializing = true;
    this._contract =
      this._contractAddress != null
        ? await this._contractTemplate.at(this._contractAddress)
        : await this._contractTemplate.deployed();
    this.isInitializing = false;
    this.isInitialized = true;
  }

  _subscribe<LogArgs>(
    eventName: string,
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<LogArgs>,
  ): string {
    const filter: Web3Filter = this._contract[eventName](indexedFilterValues);
    const subscriptionID = uuid();
    this._filters[subscriptionID] = filter;

    filter.watch(callback);

    return subscriptionID;
  }

  /**
   * Unsubscribes from an event previously subscribed to on this contract.
   * @param  subscriptionID The subscription ID returned from the `subscribe` method
   */
  unsubscribe(subscriptionID: string) {
    // TODO: Error on subscriptionID invalid.

    this._filters[subscriptionID].stopWatching();
    delete this._filters[subscriptionID];
  }

  /**
   * Unsubscribes from all events subscribed to on this contract.
   */
  unsubscribeAll() {
    this._filters.forEach(filter => {
      this.unsubscribe(filter);
    });
  }

  async _getLogs<LogArgs>(
    eventName: string,
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<LogArgs>>> {
    const filterOptions = blockRange != null ? blockRange : {};
    const filter = this._contract[eventName](
      indexedFilterValues,
      filterOptions,
    );

    return new Promise((resolve, reject) => {
      filter.get((err, logs) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(logs);
      });
    });
  }

  _assertInitialized() {
    if (!this.initialized) {
      throw new Error('Contract not yet initialized. Call `initialize` first.');
    }
  }
}
