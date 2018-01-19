import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import { makeCustomers, makePolyToken } from './util/make_examples';
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

  it('getNewKYCProviderFee', async () => {
    const fee = await customers.getNewKYCProviderFee();
    assert(fee.greaterThan(0), 'New KYC provider fee > 0');
  });

  const makeKYCProvider = async (owner, kyc) => {

    const fee = await customers.getNewKYCProviderFee();

    await polyToken.approve(kyc, customers.address, fee);

    await customers.newKYCProvider(
      kyc,
      'Provider',
      '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      new BigNumber(100),
    );

    await customers.changeStatusOfKYC(owner, [kyc], [true]);

  };

  describe('newKYCProvider', () => {
    it('should successfully create with sufficient fee', async () => {
      await makeKYCProvider(accounts[0], accounts[1]);
    });

    it('should throw InsufficientBalanceError when balance too small', async () => {
      try {
        // Using accounts[8] which has 0 POLY
        await customers.newKYCProvider(
          accounts[8],
          'Provider',
          '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          new BigNumber(100),
        );
      } catch (err) {
        if (err.name === 'InsufficientBalance') {
          return;
        }
      }

      throw new Error('failed');
    });

    it('should throw InsufficientAllowanceError when allowance too small', async () => {
      try {
        // Using accounts[1] which has a lot of POLY
        await customers.newKYCProvider(
          accounts[1],
          'Provider',
          '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          new BigNumber(100),
        );
      } catch (err) {
        if (err.name === 'InsufficientAllowance') {
          return;
        }
      }

      throw new Error('failed');
    });
  });

  describe('getKYCProviderByAddress', () => {
    it('should return created provider', async () => {
      await makeKYCProvider(accounts[0], accounts[1]);

      const provider = await customers.getKYCProviderByAddress(accounts[1]);
      assert.equal(provider.name, 'Provider');
      assert(
        provider.verificationFee.equals(100),
        'Verification fee is correct',
      );
    });

    it('should return null for nonexistent provider', async () => {
      const nullProvider = await customers.getKYCProviderByAddress(fakeAddress);
      assert.equal(nullProvider, null);
    });
  });

  it('changeFee', async () => {

    await makeKYCProvider(accounts[0], accounts[1]);
    await customers.changeVerificationFee(accounts[1], new BigNumber(120));

    assert(
      (await customers.getKYCProviderByAddress(
        accounts[1],
      )).verificationFee.equals(120),
    );
  });

  it('verifyCustomer, getCustomer, getLogs', async () => {
    const owner = accounts[0]
    const kycProvider = accounts[1];
    const investor = accounts[2];

    await makeKYCProvider(accounts[0], accounts[1]);

    await polyToken.approve(investor, customers.address, new BigNumber(100));
    await customers.verifyCustomer(
      kycProvider,
      investor,
      'US-CA',
      'investor',
      false,
      new BigNumber(15163975079),
    );
    const customer = await customers.getCustomer(kycProvider, investor);

    assert.equal(customer.verified, true);
    assert.equal(customer.jurisdiction, 'US-CA');

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
    await makeKYCProvider(accounts[0], accounts[1]);

    assert.equal(
      await customers.getCustomer(accounts[0], fakeAddress),
      null,
      'getCustomer returns null for nonexistent customer',
    );
  });
});
