import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import {
  makeCustomers,
  makePolyToken,
  makeKYCProvider,
  makeCustomer,
} from './util/make_examples';
import { makeWeb3Wrapper, makeWeb3 } from './util/web3';
import { fakeAddress } from './util/fake';
import { pk } from './util/testprivatekey';

const { assert } = chai;

describe('Customers wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();
  const web3 = makeWeb3();
  const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(
    10000,
  );
  let accounts;
  let polyToken;
  let customers;
  const pk_1 = pk.account_1;
  const pk_2 = pk.account_2;
  const pk_3 = pk.account_3;
  const pk_4 = pk.account_4;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3Wrapper, accounts[0]);
    customers = await makeCustomers(web3Wrapper, polyToken, accounts[0]);

    // Fund three accounts.
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
        provider.verificationFee
          .dividedBy(new BigNumber(10).pow(18))
          .equals(100),
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

      await customers.changeVerificationFee(
        accounts[1],
        new BigNumber(200).times(new BigNumber(10).pow(18))
      );
      const updatedProvider = await customers.getKYCProviderByAddress(
        accounts[1],
      );
      assert(
        updatedProvider.verificationFee
          .dividedBy(new BigNumber(10).pow(18))
          .equals(200),
        'Verification fee correectly changed',
      );
    });
  });

  it('verifyCustomer, getCustomer, getLogs', async () => {
    const owner = accounts[0];
    const kycProvider = accounts[1];
    const investor = accounts[2];

    await makeKYCProvider(customers, accounts[1], expiryTime);
    await makeCustomer(
      polyToken,
      customers,
      kycProvider,
      investor,
      1,
      expiryTime,
      pk_2,
    );

    const customer = await customers.getCustomer(kycProvider, investor);

    assert.equal(customer.accredited, true);
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
    // Subscribtion setup
    let subscriptionID1 = null;
    const eventName1 = 'LogNewProvider';
    const indexedFilterValues1 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewProviderArgsPromise = new Promise((resolve, reject) => {
      subscriptionID1 = customers.subscribe(
        eventName1,
        indexedFilterValues1,
        (err, log) => {
          if (err !== null) {
            reject(err);
            return;
          }
          resolve(log.args);
        },
      );
    });

    // Subscribtion setup
    let subscriptionID2 = null;
    const eventName2 = 'LogCustomerVerified';
    const indexedFilterValues2 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logCustomerVerifiedArgsPromise = new Promise((resolve, reject) => {

    subscriptionID2 = customers.subscribe(
        eventName2,
        indexedFilterValues2,
        (err, log) => {
          if (err !== null) {
            reject(err);
            return;
          }
          resolve(log.args);
        },
      );
    });

    const owner = accounts[0];
    const kycProvider = accounts[1];
    const investor = accounts[2];

    await makeKYCProvider(customers, accounts[1]);

    const logNewProvider = await logNewProviderArgsPromise;
    assert.equal(
      logNewProvider.providerAddress,
      kycProvider,
      'kycProvider address wasnt found in event subscription',
    );
    assert.equal(
      logNewProvider.name,
      'Provider',
      'Name of kycProvider wasnt found in event subscription',
    );
    assert.equal(
      logNewProvider.details,
      '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      'Details wasnt found in event subscription',
    );
    // Details hash from make_examples.js
    await customers.unsubscribe(subscriptionID1);

    await makeCustomer(
      polyToken,
      customers,
      kycProvider,
      investor,
      1,
      expiryTime,
      pk_2,
    );

    const logCustomerVerified = await logCustomerVerifiedArgsPromise;
    assert.equal(
      logCustomerVerified.customer,
      investor,
      'Customer address wasnt found in event subscription',
    );
    assert.equal(
      logCustomerVerified.provider,
      kycProvider,
      'kyc provider address wasnt found in event subscription',
    );
    assert.equal(
      logCustomerVerified.role,
      1,
      'Role wasnt found in event subscription',
    );
    await customers.unsubscribeAll();
  });
});
