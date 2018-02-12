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
  makeKYCProvider,
  makeLegalDelegate,
  makeSelectedTemplateForSecurityToken,
  makeSecurityTokenOffering,
  makeTemplateWithFinalized,
  makeSecurityTokenThroughRegistrar,
} from './util/make_examples';
import { makeWeb3Wrapper, makeWeb3 } from './util/web3';
import { fakeBytes32 } from './util/fake';
import { increaseTime } from './util/time';
import { strictEqual } from 'assert';
import { log } from 'util';

const { assert } = chai;

describe('SecurityToken wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();
  const web3 = makeWeb3();
  let accounts;
  let polyToken: PolyToken;
  let customers: Customers;
  let compliance: Compliance;
  let securityToken: SecurityToken;
  const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3Wrapper, accounts[0]);
    customers = await makeCustomers(web3Wrapper, polyToken, accounts[0]);
    compliance = await makeCompliance(web3Wrapper, customers, accounts[0]);

    securityToken = await makeSecurityTokenThroughRegistrar(
      web3Wrapper,
      polyToken,
      customers,
      compliance,
      accounts[0],
      accounts[1],
      expiryTime,
    );

    // Fund five accounts.
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

    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[3],
    );

    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[4],
    );

  });

  it('getName, getDecimals', async () => {
    assert.equal(
      await securityToken.getName(),
      'FUNTOKEN',
      'It should match with the token name provided at the time of creation of securityToken',
    );
    assert.equal(
      await securityToken.getDecimals(),
      8,
      'It should equals with the decimals value provided at the time of creation of securityToken',
    );
  });


  it('getSymbol, getOwnerAddress, getTotalSupply', async () => {
    assert.equal(
      await securityToken.getSymbol(),
      'FUNT',
      'It should equals with the ticker string provided at the time of creation of securityToken',
    );
    assert.equal(
      await securityToken.getOwnerAddress(),
      accounts[0],
      'It should equals with the Owner address provided at the time of creation of securityToken',
    );
    assert.equal(
      await securityToken.getTotalSupply(),
      1234567,
      'It should equals with the totalSupply value provided at the time of creation of securityToken',
    );
  });

  it('updateComplianceProof, getTokenDetails', async () => {
    await securityToken.updateComplianceProof(
      accounts[0],
      fakeBytes32,
      fakeBytes32,
    );

    const details = await securityToken.getTokenDetails();
    assert.equal(
      details.merkleRoot,
      fakeBytes32,
      'Should validate the assigned merkle root',
    );
  });

  it('getMerkleRoot', async () => {
    await securityToken.updateComplianceProof(
      accounts[0],
      fakeBytes32,
      fakeBytes32,
    );
    assert.equal(
      await securityToken.getMerkleRoot(),
      fakeBytes32,
      'Should validate the assigned merkle root',
    );
  });

  it('selectTemplate, addToWhiteList, getShareholderDetails, getPolyAllocationDetails, getKYCProviderAddress, getDelegate', async () => {
    const owner = accounts[0];
    const investor = accounts[3];
    const legalDelegate = accounts[2];
    const kycProvider = accounts[1];
    const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);

    await makeKYCProvider(customers, kycProvider, expiryTime);
    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate, expiryTime);
    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
      expiryTime,
    );

    await compliance.proposeTemplate(
      legalDelegate,
      securityToken.address,
      templateAddress,
    );

    // Security token must have the template's fee before applying the template.
    await polyToken.transfer(kycProvider, securityToken.address, 1000);

    await securityToken.selectTemplate(owner, 0);

    assert.equal(await securityToken.getKYCProviderAddress(), kycProvider);
    assert.equal(await securityToken.getDelegateAddress(), legalDelegate);

    await polyToken.approve(investor, customers.address, 100);

    await customers.verifyCustomer(
      kycProvider,
      investor,
      'US',
      'CA',
      'investor',
      true,
      new BigNumber(15163975079),
    );

    await securityToken.addToWhitelist(owner, investor);

    const checkShareholderDetails = await securityToken.getShareholderDetails(
      investor,
    );
    assert.equal(
      checkShareholderDetails[1],
      true,
      'Should read true, investor has been whitelisted',
    );

    const checkPolyAllocationDetails = await securityToken.getPolyAllocationDetails(
      legalDelegate,
    );
    assert.equal(
      checkPolyAllocationDetails[1],
      9888888,
      'Should equal 9888888 from make_examples value used',
    );
  });

  it('tokensIssuedBySTO, isSTOProposed', async () => {
    const isSTOProposed = await securityToken.isSTOProposed();
    assert.equal(
      isSTOProposed,
      false,
      'Should read false as no STO has been proposed',
    );

    const tokensIssuedBySTO = await securityToken.tokensIssuedBySTO();
    assert.equal(
      tokensIssuedBySTO,
      0,
      'Should read zero we havent issued tokens yet',
    );
  });

  it('getVoted, getContributedToSTO', async () => {
    const hasVoted = await securityToken.getVoted(accounts[8], accounts[7]); //random accounts
    assert.equal(hasVoted, false, 'Should read false no one has voted');
    const getContributedToSTO = await securityToken.getContributedToSTO(
      accounts[1],
    );
    assert.equal(
      getContributedToSTO,
      false,
      `Should read 0 no one has contributed yet`,
    );
  });

  it('selectSTOProposal, getSTOContractAddress, getSTOStart, getSTOEnd', async () => {
    const owner = accounts[0];
    const legalDelegate = accounts[2];
    const kycProvider = accounts[1];
    const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);
    // STO variables
    const auditor = accounts[4];
    const startTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(200);

    const endTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(
      2592000,
    ); // 1 Month duration

    await makeKYCProvider(customers, kycProvider);

    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate, expiryTime);

    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
      expiryTime,
    );
    await makeSelectedTemplateForSecurityToken(
      securityToken,
      compliance,
      polyToken,
      owner,
      legalDelegate,
      kycProvider,
      fakeBytes32,
      templateAddress,
    );

    await polyToken.approve(auditor, customers.address, 100);

    await customers.verifyCustomer(
      kycProvider,
      auditor,
      'US',
      'CA',
      'investor',
      true,
      new BigNumber(15163975079),
    );

    const offering = await makeSecurityTokenOffering(
      web3Wrapper,
      polyToken,
      securityToken,
      compliance,
      auditor,
      startTime,
      endTime,
    );

    await securityToken.selectSTOProposal(legalDelegate, 0);

    assert.equal(await securityToken.getSTOContractAddress(), offering.address);
    // getSTOEnd
    assert.equal(
      (await securityToken.getSTOEnd()).toNumber(),
      endTime.toNumber(),
      'It should validates the end time STOContract with the endSTO present in the SecurityToken',
    );
    // getSTOStart
    assert.equal(
      (await securityToken.getSTOStart()).toNumber(),
      startTime.toNumber(),
      'It should validates the start time STOContract with the stratSTO present in the SecurityToken',
    );
  });

  it('getMaximumPOLYContribution', async () => {
    assert.equal(await securityToken.getMaximumPOLYContribution(), 100000); // 100000 value from make_examples.js
  });

  it('addToBlackList', async () => {
    const owner = accounts[0];
    const legalDelegate = accounts[2];
    const kycProvider = accounts[1];
    const investor = accounts[3];
    const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);
    await makeKYCProvider(customers, kycProvider);

    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate, expiryTime);

    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
      expiryTime,
    );
    // Create the Selected Template for the SecurityToken
    await makeSelectedTemplateForSecurityToken(
      securityToken,
      compliance,
      polyToken,
      owner,
      legalDelegate,
      kycProvider,
      fakeBytes32,
      templateAddress,
    );
    await polyToken.approve(investor, customers.address, 100);
    await customers.verifyCustomer(
      kycProvider,
      investor,
      'US',
      'CA',
      'investor',
      true,
      new BigNumber(15163975079),
    );

    // addToWhiteList
    await securityToken.addToWhitelist(owner, investor);
    let checkShareholderDetails = await securityToken.getShareholderDetails(
      investor,
    );
    assert.equal(
      checkShareholderDetails[1],
      true,
      'Should read true, investor has been whitelisted',
    );

    // addToBlackList
    await securityToken.addToBlacklist(owner, investor);
    checkShareholderDetails = await securityToken.getShareholderDetails(
      investor,
    );
    assert.equal(
      checkShareholderDetails[1],
      false,
      'Should read false, investor has been blacklisted',
    );
  });

  describe('ERC20 Functions', async () => {
    it('getBalanceOf', async () => {
      const balance = await securityToken.getBalanceOf(accounts[0]);
      assert.equal(
        balance.toNumber(),
        1234567, // 1234567 data is taken from the make_examples.js
        'It should equal to the totalSupply of the securityToken',
      );
    });

    it('transfer, getAllowance, approve, transferFrom, getOfferingStatus, getSTOContractAddress, getPolyAllocationDetails, withdrawPoly, voteTofreeze, startSecurityTokenOffering', async () => {
      const owner = accounts[0];
      const legalDelegate = accounts[2];
      const kycProvider = accounts[1];
      const investor = accounts[3];
      const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);
      // STO variables
      const auditor = accounts[4];
      const startTime = new BigNumber(
        web3.eth.getBlock('latest').timestamp
      ).plus(200);

      const endTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(
        2592000,
      ); // 1 Month duration

      await makeKYCProvider(customers, kycProvider);

      await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate, expiryTime);

      const templateAddress = await makeTemplateWithFinalized(
        compliance,
        kycProvider,
        legalDelegate,
        expiryTime,
      );
      await makeSelectedTemplateForSecurityToken(
        securityToken,
        compliance,
        polyToken,
        owner,
        legalDelegate,
        kycProvider,
        fakeBytes32,
        templateAddress,
      );
      await polyToken.approve(auditor, customers.address, 100);

      await customers.verifyCustomer(
        kycProvider,
        auditor,
        'US',
        'CA',
        'investor',
        true,
        new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000),
      );

      // Create the offering Contract
      const offering = await makeSecurityTokenOffering(
        web3Wrapper,
        polyToken,
        securityToken,
        compliance,
        auditor,
        startTime,
        endTime,
      );


      await securityToken.selectSTOProposal(legalDelegate, 0);

      assert.equal(
        await securityToken.getSTOContractAddress(),
        offering.address,
        'It should equal to the Offering address that just created and select as the offering contract of securityToken',
      );
      // Start the offering
      await securityToken.startSecurityTokenOffering(owner);

      assert.equal(
        await securityToken.getBalanceOf(offering.address),
        1234567,
        'It Should equal to the totalsupply of the securityToken',
      );
      assert.isTrue(
        await securityToken.getOfferingStatus(),
       'Offering status should be true for the STO contract',
      );

      await polyToken.approve(investor, customers.address, 100);
      await customers.verifyCustomer(
        kycProvider,
        investor,
        'US',
        'CA',
        'investor',
        true,
        new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000),
      );

      await securityToken.addToWhitelist(owner, investor);

      let checkShareholderDetails = await securityToken.getShareholderDetails(
        investor,
      );
      assert.equal(
        checkShareholderDetails[1],
        true,
        'Should read true, investor has been whitelisted',
      );
      await polyToken.approve(investor, securityToken.address, 10000);
      await increaseTime(1000); // Time Jump of 1000 seconds to reach beyond the sto start date
      // getSTOContractAddress
      const stoAddress = await securityToken.getSTOContractAddress();
      assert.equal(
        stoAddress,
        offering.address,
        'It should match with the desired offering address',
      );

      // Bought Security Token using POLY
      await offering.buySecurityTokenWithPoly(investor, new BigNumber(10000));
      assert.equal(
        (await securityToken.getBalanceOf(investor)).toNumber(),
        100,
        'Balance of the investor should be eqaul to 100',
      );

      // Whitelisting the address
      await securityToken.addToWhitelist(owner, auditor);
      checkShareholderDetails = await securityToken.getShareholderDetails(
        auditor,
      );
      assert.equal(
        checkShareholderDetails[1],
        true,
        'Should read true, investor has been whitelisted',
      );

      // transfer
      await securityToken.transfer(investor, auditor, 20);

      // getBalanceOf
      assert.equal(
        (await securityToken.getBalanceOf(auditor)).toNumber(),
        20,
        'Balance of the auditor should be eqaul to 20',
      );

      // approve
      await securityToken.approve(auditor, accounts[5], 10);

      // getAllowance()
      assert.equal(
        (await securityToken.getAllowance(auditor, accounts[5])).toNumber(),
        10,
        'Allowance should be 10 security tokens',
      );

      // transferFrom
      await securityToken.transferFrom(auditor, investor, accounts[5], 5);
      assert.equal(
        (await securityToken.getBalanceOf(investor)).toNumber(),
        85,
        'Balance of investor should equal to 85',
      );

      // voteToFreeze
      await increaseTime(2592000 + 100); // time jump to reach the endSTO timestamp
      await securityToken.voteToFreeze(investor, auditor);
      const allocationDetailsOfAuditor = await securityToken.getPolyAllocationDetails(
        auditor,
      );
      assert.isTrue(
        allocationDetailsOfAuditor[5],
        'Freeze variable of the Allocation array should be true after vote freeze',
      );

      // withdrawPoly
      await increaseTime(9888888 + 1000); // time jump to reach the vesting period
      const status = await securityToken.withdrawPoly(legalDelegate);
      assert.isTrue(
        status,
        'Status should be true after successing the withdraw',
      );
    });
  });

  it('subscribe, unsubscribe, unsubscribeAll, getLogs', async () => {
    // Subscribtion setup
    let subscriptionID1 = null;
    const eventName1 = 'LogTemplateSet';
    const indexedFilterValues1 = ['_delegateAddress', '_KYC'];
    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logTemplateSetArgsPromise = new Promise((resolve, reject) => {
      subscriptionID1 = securityToken.subscribe(
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
    const eventName2 = 'LogUpdatedComplianceProof';
    const indexedFilterValues2 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logUpdatedComplianceProofArgsPromise = new Promise(
      (resolve, reject) => {
        subscriptionID2 = securityToken.subscribe(
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
      },
    );

    // Subscribtion setup
    let subscriptionID4 = null;
    const eventName4 = 'LogNewWhitelistedAddress';
    const indexedFilterValues4 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewWhitelistedAddressArgsPromise = new Promise(
      (resolve, reject) => {
        subscriptionID4 = securityToken.subscribe(
          eventName4,
          indexedFilterValues4,
          (err, log) => {
            if (err !== null) {
              reject(err);
              return;
            }
            resolve(log.args);
          },
        );
      },
    );

    // Subscribtion setup
    let subscriptionID5 = null;
    const eventName5 = 'LogNewBlacklistedAddress';
    const indexedFilterValues5 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewBlacklistedAddressArgsPromise = new Promise(
      (resolve, reject) => {
        subscriptionID5 = securityToken.subscribe(
          eventName5,
          indexedFilterValues5,
          (err, log) => {
            if (err !== null) {
              reject(err);
              return;
            }
            resolve(log.args);
          },
        );
      },
    );

    const owner = accounts[0];
    const kycProvider = accounts[1];
    const legalDelegate = accounts[2];
    const investor = accounts[3];
    const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);
    await makeKYCProvider(customers, kycProvider);

    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate, expiryTime);
    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
      expiryTime,
    );

    await makeSelectedTemplateForSecurityToken(
      securityToken,
      compliance,
      polyToken,
      owner,
      legalDelegate,
      kycProvider,
      fakeBytes32,
      templateAddress,
    );

    await polyToken.approve(investor, customers.address, 100);

    await customers.verifyCustomer(
      kycProvider,
      investor,
      'US',
      'CA',
      'investor',
      true,
      new BigNumber(15163975079),
    );

    await securityToken.addToWhitelist(owner, investor);
    await securityToken.addToBlacklist(owner, investor);


    const logUpdateCompliance = await logUpdatedComplianceProofArgsPromise;
    assert.equal(
      logUpdateCompliance._merkleRoot,
      fakeBytes32,
      'merkle root  wasnt found in event subscription',
    );
    assert.equal(
      logUpdateCompliance._complianceProofHash,
      fakeBytes32,
      'compliance hash wasnt found in event subscription',
    );
    await securityToken.unsubscribe(subscriptionID2);

    const logTemplateSet = await logTemplateSetArgsPromise;

    assert.equal(
      logTemplateSet._delegateAddress,
      legalDelegate,
      'Legal delegate address wasnt found in event subscription',
    );
    assert.isAbove(
      logTemplateSet._template.length,
      20,
      'Template wasnt found in event subscription',
    );
    assert.equal(
      logTemplateSet._KYC,
      kycProvider,
      'KYC provider address wasnt found in event subscription',
    );

    const logBlacklistAddress = await logNewBlacklistedAddressArgsPromise;
    // Needs to be fixed in core. owner is getting emmited instaed of KYC
    // assert.equal(logBlacklistAddress._KYC, kycProvider, 'KYC provider address wasnt found in event subscription');
    assert.equal(
      logBlacklistAddress._shareholder,
      investor,
      'Investor/sharholder wasnt found in event subscription',
    );

    const logWhitelistAddress = await logNewWhitelistedAddressArgsPromise;
    // Needs to be fixed in core. owner is getting emmited instaed of KYC
    // assert.equal(logWhitelistAddress._KYC, kycProvider, 'KYC provider address wasnt found in event subscription');
    assert.equal(
      logWhitelistAddress._shareholder,
      investor,
      'Investor/sharholder wasnt found in event subscription',
    );
    assert.equal(
      logWhitelistAddress._role,
      1,
      'Role wasnt found in event subscription',
    );
    await securityToken.unsubscribeAll();
  });

  it('Test LogNewSTO, LogIssueToken, logFreezePoly', async () => {
    let subscriptionID3 = null;
    const eventName3 = 'LogSetSTOContract';
    const indexedFilterValues3 = ['_STOTemplate', '_auditor'];

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logSetSTOContractArgsPromise = new Promise((resolve, reject) => {
      subscriptionID3 = securityToken.subscribe(
        eventName3,
        indexedFilterValues3,
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
    const legalDelegate = accounts[2];
    const kycProvider = accounts[1];
    const investor = accounts[3];
    const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);
    // STO variables
    const auditor = accounts[4];
    const startTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(200);
    const endTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(2592000);


    await makeKYCProvider(customers, kycProvider, expiryTime);

    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate, expiryTime);

    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
      expiryTime,
    );
    await makeSelectedTemplateForSecurityToken(
      securityToken,
      compliance,
      polyToken,
      owner,
      legalDelegate,
      kycProvider,
      fakeBytes32,
      templateAddress,
    );

    await polyToken.approve(auditor, customers.address, 100);

    await customers.verifyCustomer(
      kycProvider,
      auditor,
      'US',
      'CA',
      'investor',
      true,
      new BigNumber(15163975079),
    );

    const offering = await makeSecurityTokenOffering(
      web3Wrapper,
      polyToken,
      securityToken,
      compliance,
      auditor,
      startTime,
      endTime,
    );

    await securityToken.selectSTOProposal(legalDelegate, 0);

    const logSetSTO = await logSetSTOContractArgsPromise;
    assert.isAbove(logSetSTO._STO.length, 20, 'STO address not created');
    assert.isAbove(
      logSetSTO._STOtemplate.length,
      20,
      'STO address not created',
    );
    assert.equal(
      logSetSTO._auditor,
      accounts[4],
      'Auditor address wasnt found',
    );
    assert.isAbove(
      logSetSTO._endTime.toNumber(),
      logSetSTO._startTime.toNumber() + 259200,
      'start time and end time didnt work correctly',
    );

    // Subscribtion setup
    let subscriptionID7 = null;
    const eventName7 = 'LogTokenIssued';
    const indexedFilterValues7 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logTokenIssuedArgsPromise = new Promise((resolve, reject) => {
      subscriptionID7 = securityToken.subscribe(
        eventName7,
        indexedFilterValues7,
        (err, log) => {
          if (err !== null) {
            reject(err);
            return;
          }
          resolve(log.args);
        },
      );
    });

    // Start the offering
    await securityToken.startSecurityTokenOffering(owner);

    assert.isTrue(
      await securityToken.getOfferingStatus(),
      'Offering status should be true for the STO contract',
    );

    await polyToken.approve(investor, customers.address, 100);

    await customers.verifyCustomer(
      kycProvider,
      investor,
      'US',
      'CA',
      'investor',
      true,
      new BigNumber(15163975079),
    );

    await securityToken.addToWhitelist(owner, investor);

    await polyToken.approve(investor, securityToken.address, 10000);
    await increaseTime(1000); // Time Jump of 1000 seconds to reach beyond the sto start date

    // Bought Security Token using POLY
    await offering.buySecurityTokenWithPoly(investor, new BigNumber(10000));
    assert.equal(
      (await securityToken.getBalanceOf(investor)).toNumber(),
      100,
      'Balance of the investor should be eqaul to 100',
    );

    const logIssueToken = await logTokenIssuedArgsPromise;
    assert.isAbove(
      logIssueToken._contributor.length,
      20,
      'Tokens are not issued1',
    );
    assert.equal(logIssueToken._stAmount, 100, 'Tokens are not issued2');
    assert.equal(logIssueToken._polyContributed.toNumber(), 10000);

    // Subscribtion setup
    let subscriptionID6 = null;
    const eventName6 = 'LogVoteToFreeze';
    const indexedFilterValues6 = ['_recipient', '_yayPercent'];

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logVoteToFreezeArgsPromise = new Promise((resolve, reject) => {
      subscriptionID6 = securityToken.subscribe(
        eventName6,
        indexedFilterValues6,
        (err, log) => {
          if (err !== null) {
            reject(err);
            return;
          }
          resolve(log.args);
        },
      );
    });
    // voteToFreeze
    await increaseTime(2592000 + 100); // time jump to reach the endSTO timestamp
    await securityToken.voteToFreeze(investor, auditor);

    const logFreezePoly = await logVoteToFreezeArgsPromise;

    assert.isAbove(logFreezePoly._recipient.length, 20, 'Failure to Vote');
    assert.notEqual(logFreezePoly._yayPercent, 0, 'Failure to Vote');
    await securityToken.unsubscribeAll();
  });
});
