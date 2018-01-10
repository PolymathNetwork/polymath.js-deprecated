import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
} from './util/make_contracts';
import { makeWeb3Wrapper } from './util/web3';
import zeroAddress from './util/zeroAddress';

const { assert } = chai;

describe('Compliance wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken;
  let compliance;
  let customers;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3Wrapper, accounts[0]);
    customers = await makeCustomers(web3Wrapper, polyToken, accounts[0]);
    compliance = await makeCompliance(web3Wrapper, customers, accounts[0]);

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

  const makeKYCProvider = async account => {
    const fee = await customers.getNewKYCProviderFee();
    await polyToken.approve(account, customers.address, fee);

    await customers.newKYCProvider(
      account,
      'Provider',
      '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      new BigNumber(100),
    );
  };

  const makeLegalDelegate = async (kycProvider, legalDelegate) => {
    await polyToken.approve(legalDelegate, customers.address, 100);
    await customers.verifyCustomer(
      kycProvider,
      legalDelegate,
      'US-CA',
      'delegate',
      true,
      new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
    );
  };

  const makeTemplate = async (kycProvider, legalDelegate): string =>
    compliance.createTemplate(
      legalDelegate,
      'offeringtype',
      'US-CA',
      false,
      kycProvider,
      '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
      new BigNumber(1000),
      new BigNumber(10),
      new BigNumber(9888888),
    );

  it('createTemplate', async () => {
    await makeKYCProvider(accounts[0]);
    await makeLegalDelegate(accounts[0], accounts[1]);
    const templateAddress = await makeTemplate(accounts[0], accounts[1]);
    assert.isAbove(templateAddress.length, 0);
  });

  it('proposeTemplate', async () => {
    await makeKYCProvider(accounts[0]);
    await makeLegalDelegate(accounts[0], accounts[1]);
    const templateAddress = await makeTemplate(accounts[0], accounts[1]);

    await compliance.proposeTemplate(accounts[1], zeroAddress, templateAddress);
  });
});
