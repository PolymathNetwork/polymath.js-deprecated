import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import { makeCustomers, makePolyToken, makeKYCProvider } from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';
import { fakeAddress } from './util/fake';

const { assert } = chai;

describe('Customers wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken;
  let customers;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3Wrapper, accounts[0]);
    customers = await makeCustomers(web3Wrapper, polyToken, accounts[0]);

    // Fund two accounts.
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[0],
    );
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[1],
    );
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[2],
    );
  });

  describe('getKYCProviderByAddress', () => {
    it('should return created provider', async () => {
      await makeKYCProvider(customers, accounts[1]);

      const provider = await customers.getKYCProviderByAddress(accounts[1]);
      assert.equal(provider.name, 'Provider');
      assert(
        provider.verificationFee.equals(100),
        'Verification fee is correct',
      );
    });

    it('should emit LogNewProvider event', async () => {
      await makeKYCProvider(customers, accounts[1]);
      const logs = await customers.getLogs(
        'LogNewProvider',
        {},
        { fromBlock: 1 },
      );
      assert.isAbove(logs.length, 0, 'Got a log');
      assert.equal(logs[0].args.providerAddress, accounts[1]);
      assert.equal(logs[0].args.name, 'Provider');
    });

    it('should return null for nonexistent provider', async () => {
      const nullProvider = await customers.getKYCProviderByAddress(fakeAddress);
      assert.equal(nullProvider, null);
    });

    it('should change verification fee', async () => {
      await makeKYCProvider(customers, accounts[1]);
      const provider = await customers.getKYCProviderByAddress(accounts[1]);
      assert.equal(provider.name, 'Provider');

      await customers.changeVerificationFee(accounts[1], new BigNumber(200));
      const updatedProvider = await customers.getKYCProviderByAddress(accounts[1]);
      assert(
        updatedProvider.verificationFee.equals(200),
        'Verification fee correectly changed',
      );
    });
  });

  it('verifyCustomer, getCustomer, getLogs', async () => {
    const owner = accounts[0]
    const kycProvider = accounts[1];
    const investor = accounts[2];

    await makeKYCProvider(customers, accounts[1]);
    await polyToken.approve(investor, customers.address, new BigNumber(100));
    await customers.verifyCustomer(
      kycProvider,
      investor,
      'US',
      'CA',
      'investor',
      false,
      new BigNumber(15163975079),
    );

    const customer = await customers.getCustomer(kycProvider, investor);

    assert.equal(customer.verified, true);
    assert.equal(customer.countryJurisdiction, 'US');
    const logs = await customers.getLogs(
      'LogCustomerVerified',
      {},
      { fromBlock: 1 },
    );
    assert.isAbove(logs.length, 0, 'Got a log');
    assert.equal(logs[0].args.role, 'investor');
    assert.equal(logs[0].args.customer, investor, 'customer is investor');
  });

  it('getCustomer should return null for nonexistent customer', async () => {
    await makeKYCProvider(customers, accounts[1]);

    assert.equal(
      await customers.getCustomer(accounts[0], fakeAddress),
      null,
      'getCustomer returns null for nonexistent customer',
    );
  });

});
