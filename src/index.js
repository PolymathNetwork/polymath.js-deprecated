// @flow

import contract from 'truffle-contract';
import Web3 from 'web3';

// import { ContractNotFoundError } from './types';
import type { Web3Provider } from './types';

/* eslint-disable import/no-unresolved */
// $FlowFixMe
const polyTokenArtifact = require('../../build/contracts/PolyToken.json');
/* eslint-enable import/no-unresolved */

/* eslint-disable import/prefer-default-export, no-param-reassign */
/** Polymath class
 * @param provider The web3 provider
 */
export class Polymath {
  web3: Web3;

  initializedPromise: any;

  polyToken: any;

  constructor(provider: Web3Provider) {
    this.web3 = new Web3(provider);

    const initializePromises = [];

    const polyTokenContract = contract(polyTokenArtifact);
    polyTokenContract.setProvider(provider);

    initializePromises.push(
      polyTokenContract.deployed().then(instance => {
        this.polyToken = instance;
      }),
    );

    this.initializedPromise = Promise.all(initializePromises);
  }
}
/* eslint-enable import/prefer-default-export, no-param-reassign */
