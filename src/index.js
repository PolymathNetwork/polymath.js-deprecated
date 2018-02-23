// @flow

import Web3 from 'web3';

// import { ContractNotFoundError } from './types';
import { Compliance, Customers, PolyToken, SecurityTokenRegistrar } from './contract_wrappers';
import type { Web3Provider } from './types';

export * from './contract_wrappers';
export * from './types';

/* eslint-disable import/prefer-default-export, no-param-reassign */
/**
 * The entry point to the Polymath.js library
 * @param web3Provider A web3 provider
 */
export class Polymath {
  _web3: Web3;

  initializedPromise: any;

  polyToken: PolyToken;
  customers: Customers;
  compliance: Compliance;
  securityTokenRegistrar: SecurityTokenRegistrar;

  constructor(web3Provider: Web3Provider) {
    this._web3 = new Web3(web3Provider);

    const initializePromises = [];

    this.polyToken = new PolyToken(this._web3);
    initializePromises.push(this.polyToken.initialize());

    this.customers = new Customers(this._web3, this.polyToken);
    initializePromises.push(this.customers.initialize());

    this.compliance = new Compliance(this._web3);
    initializePromises.push(this.compliance.initialize());

    this.securityTokenRegistrar = new SecurityTokenRegistrar(this._web3);
    initializePromises.push(this.securityTokenRegistrar.initialize());

    this.initializedPromise = Promise.all(initializePromises);
  }
}
/* eslint-enable import/prefer-default-export, no-param-reassign */
