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


  it('subscribe, unsubscribe, unsubscribeAll', async () => {

    //subscribtion setup
    let subscriptionID1 = null;
    const eventName1 = 'LogNewProvider';
    const indexedFilterValues1 = null;

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewProviderArgsPromise = new Promise((resolve, reject) => {
      subscriptionID1 = customers.subscribe(eventName1, indexedFilterValues1, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    //subscribtion setup
    let subscriptionID2 = null;
    const eventName2 = 'LogCustomerVerified';
    const indexedFilterValues2 = null;

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logCustomerVerifiedArgsPromise = new Promise((resolve, reject) => {

      subscriptionID2 = customers.subscribe(eventName2, indexedFilterValues2, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });


    const owner = accounts[0]
    const kycProvider = accounts[1];
    const investor = accounts[2];

    await makeKYCProvider(polyToken, customers, accounts[0], accounts[1]);

    const logNewProvider = await logNewProviderArgsPromise;
    assert.equal(logNewProvider.providerAddress, kycProvider, 'kycProvider address wasnt found in event subscription');
    assert.equal(logNewProvider.name, 'Provider', 'Name of kycProvider wasnt found in event subscription');
    assert.equal(logNewProvider.details, '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Details wasnt found in event subscription'); //details hash from make_examples.js
    await customers.unsubscribe(subscriptionID1);


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

    const logCustomerVerified = await logCustomerVerifiedArgsPromise;
    assert.equal(logCustomerVerified.customer, investor, 'Customer address wasnt found in event subscription');
    assert.equal(logCustomerVerified.provider, kycProvider, 'kyc provider address wasnt found in event subscription');
    assert.equal(logCustomerVerified.role, 1, 'Role wasnt found in event subscription');
    await customers.unsubscribeAll();

  })

});
