// @flow

import { Web3Wrapper } from '@0xproject/web3-wrapper';

// import { ContractNotFoundError } from './types';
import PolyToken from './contract_wrappers/PolyToken';
import type { Web3Provider } from './types';

export * from './contract_wrappers';
export * from './types';

/* eslint-disable import/prefer-default-export, no-param-reassign */
/**
 * The entry point to the Polymath.js library
 * @param web3Provider A web3 provider
 */
export class Polymath {
  _web3Wrapper: Web3Wrapper;

  initializedPromise: any;

  polyToken: PolyToken;

  constructor(web3Provider: Web3Provider) {
    this._web3Wrapper = new Web3Wrapper(web3Provider);

    const initializePromises = [];

    this.polyToken = new PolyToken(this._web3Wrapper);
    initializePromises.push(this.polyToken.initialize());

    this.initializedPromise = Promise.all(initializePromises);
  }
}
/* eslint-enable import/prefer-default-export, no-param-reassign */
