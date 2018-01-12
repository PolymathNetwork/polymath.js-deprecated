// @flow

import BigNumber from 'bignumber.js';
import chai from 'chai';
import { before, beforeEach, describe, it } from 'mocha';

import {
  PolyToken,
  Compliance,
  Customers,
  SecurityToken,
} from '../src/contract_wrappers';
import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
  makeSecurityToken,
} from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';
import fakeAddress from './util/fakeAddress';

const { assert } = chai;

describe('SecurityToken wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken: PolyToken;
  let customers: Customers;
  let compliance: Compliance;
  let securityToken: SecurityToken;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3Wrapper, accounts[0]);
    customers = await makeCustomers(web3Wrapper, polyToken, accounts[0]);
    compliance = await makeCompliance(web3Wrapper, customers, accounts[0]);
    securityToken = await makeSecurityToken(
      web3Wrapper,
      polyToken,
      customers,
      compliance,
      accounts[0],
    );

    // Fund two accounts.
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[0],
    );
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[1],
    );
  });

  it('getName', async () => {
    assert.equal(await securityToken._contract.name.call(), 'Token Name');
  });

  it('updateComplianceProof', async () => {
    await securityToken.updateComplianceProof(
      accounts[0],
      fakeAddress,
      fakeAddress,
    );
  });
});
