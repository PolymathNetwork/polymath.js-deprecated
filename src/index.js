// @flow

import contract from 'truffle-contract';
import Web3 from 'web3';

// import { ContractNotFoundError } from './types';
import type { Web3Provider } from './types';

const polyTokenArtifact = require('./artifacts/PolyToken.json');
const customersArtifact = require('./artifacts/Customers.json');
const complianceArtifact = require('./artifacts/Compliance.json');
const securityTokenRegistrarArtifact = require('./artifacts/SecurityTokenRegistrar.json');

/* eslint-disable import/prefer-default-export, no-param-reassign */
/** Polymath class
 * @param provider The web3 provider
 */
export class Polymath {
  web3: Web3;

  initializedPromise: any;

  polyToken: any;
  customers: any;
  compliance: any;
  securityTokenRegistrar: any;

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

    const customersContract = contract(customersArtifact);
    customersContract.setProvider(provider);
    initializePromises.push(
      customersContract.deployed().then(instance => {
        this.customers = instance;
      }),
    );

    const complianceContract = contract(complianceArtifact);
    complianceContract.setProvider(provider);
    initializePromises.push(
      complianceContract.deployed().then(instance => {
        this.compliance = instance;
      }),
    );

    const securityTokenRegistrarContract = contract(
      securityTokenRegistrarArtifact,
    );
    securityTokenRegistrarContract.setProvider(provider);
    initializePromises.push(
      securityTokenRegistrarContract.deployed().then(instance => {
        this.securityTokenRegistrar = instance;
      }),
    );

    this.initializedPromise = Promise.all(initializePromises);
  }
}
/* eslint-enable import/prefer-default-export, no-param-reassign */
