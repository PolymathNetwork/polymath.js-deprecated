// @flow

import BigNumber from 'bignumber.js';
import chai from 'chai';
import { before, beforeEach, describe, it } from 'mocha';

import {
  PolyToken,
  Compliance,
  Customers,
  SecurityToken,
  STOContract,
  SecurityTokenRegistrar,
} from '../src/contract_wrappers';
import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
  makeKYCProvider,
  makeLegalDelegate,
  makeSecurityToken,
  makeSelectedTemplateForSecurityToken,
  makeSecurityTokenOffering,
  makeSecurityTokenRegistrar,
  makeTemplate,
  makeTemplateWithFinalized,
  makeSecurityTokenThroughRegistrar,
  makeSTOForSecurityToken,
} from './util/make_examples';
import { makeWeb3Wrapper, makeWeb3 } from './util/web3';
import { fakeBytes32 } from './util/fake';
import { increaseTime } from './util/time';
import { strictEqual } from 'assert';

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

    securityToken = await makeSecurityTokenThroughRegistrar(
      web3Wrapper,
      polyToken,
      customers,
      compliance,
      securityToken,
      accounts[0],
      accounts[1],
    );

    // Fund four accounts.
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
    assert.equal(await securityToken.getName(), 'FUNTOKEN');
    assert.equal(await securityToken.getDecimals(), 8);
  });

  it('getSymbol, getOwnerAddress, getTotalSupply', async () => {
    assert.equal(await securityToken.getSymbol(), 'FUNT');
    assert.equal(await securityToken.getOwnerAddress(), accounts[0]);
    assert.equal(await securityToken.getTotalSupply(), 1234567);
  });

  it('updateComplianceProof, getTokenDetails', async () => {
    await securityToken.updateComplianceProof(
      accounts[0],
      fakeBytes32,
      fakeBytes32,
    );

    const details = await securityToken.getTokenDetails();
    assert.equal(details.merkleRoot, fakeBytes32);
  });

  it('getMerkleRoot', async () => {
    await securityToken.updateComplianceProof(
      accounts[0],
      fakeBytes32,
      fakeBytes32,
    );
    assert.equal(await securityToken.getMerkleRoot(), fakeBytes32);
  });

  it('selectTemplate, addToWhiteList, getShareholderDetails, getPolyAllocationDetails, getKYCProviderAddress, getDelegate', async () => {
    const owner = accounts[0];
    const investor = accounts[3];
    const legalDelegate = accounts[2];
    const kycProvider = accounts[1];
    await makeKYCProvider(customers, kycProvider);

    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate);
    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
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
      new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
    );

    await securityToken.addToWhitelist(owner, investor);

    const checkShareholderDetails = await securityToken.getShareholderDetails(
      investor
    );
    assert.equal(
      checkShareholderDetails[1],
      true,
      'Should read true, investor has been whitelisted'
    );

    const checkPolyAllocationDetails = await securityToken.getPolyAllocationDetails(
      legalDelegate
    );
    assert.equal(
      checkPolyAllocationDetails[1],
      9888888,
      'Should equal 9888888 from make_examples value used'
    );
  });

  it('tokensIssuedBySTO, isSTOProposed', async () => {
    const isSTOProposed = await securityToken.isSTOProposed();
    assert.equal(
      isSTOProposed,
      false,
      'Should read false as no STO has been proposed'
    );

    const tokensIssuedBySTO = await securityToken.tokensIssuedBySTO();
    assert.equal(
      tokensIssuedBySTO,
      0,
      'Should read zero we havent issued tokens yet'
    );

  });

  it('getVoted, getContributedToSTO', async () => {
    const hasVoted = await securityToken.getVoted(accounts[8], accounts[7]); //random accounts
    assert.equal(hasVoted, false, 'Should read false no one has voted');
    const getContributedToSTO = await securityToken.getContributedToSTO(
      accounts[1]
    );
    assert.equal(
      getContributedToSTO,
      false,
      `Should read 0 no one has contributed yet`
    );
  });

  it('selectSTOProposal, getSTOContractAddress, getSTOStart, getSTOEnd', async () => {
    const owner = accounts[0];
    const legalDelegate = accounts[2];
    const kycProvider = accounts[1];

    // STO variables
    const auditor = accounts[4];
    const startTime = new BigNumber(
      Math.floor(new Date().getTime() / 1000)
    ).plus(200);

    const endTime = new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(
      2592000,
    ); // 1 Month duration

    await makeKYCProvider(customers, kycProvider);

    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate);

    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
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
      new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(10000),
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
    assert.equal(
      (await securityToken.getSTOEnd()).toNumber(),
      endTime.toNumber(),
    );
    assert.equal(
      (await securityToken.getSTOStart()).toNumber(),
      startTime.toNumber(),
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
    await makeKYCProvider(customers, kycProvider);

    await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate);

    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      kycProvider,
      legalDelegate,
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
      new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(50000),
    );

    await securityToken.addToWhitelist(owner, investor);
    let checkShareholderDetails = await securityToken.getShareholderDetails(
      investor,
    );
    assert.equal(
      checkShareholderDetails[1],
      true,
      'Should read true, investor has been whitelisted'
    );
    await securityToken.addToBlacklist(owner, investor);
    checkShareholderDetails = await securityToken.getShareholderDetails(
      investor,
    );
    assert.equal(
      checkShareholderDetails[1],
      false,
      'Should read false, investor has been blacklisted'
    );
  });

  describe('ERC20 Functions', async () => {
    it('getBalanceOf', async () => {
      const balance = await securityToken.getBalanceOf(accounts[0]);
      assert.equal(balance.toNumber(), 1234567); // 1234567 data is taken from the make_examples.js
    });

    it('transfer, getAllowance, approve, transferFrom, getOfferingStatus, getSTOContractAddress, getPolyAllocationDetails, withdrawPoly, voteTofreeze', async () => {
      const owner = accounts[0];
      const legalDelegate = accounts[2];
      const kycProvider = accounts[1];
      const investor = accounts[3];

      // STO variables
      const auditor = accounts[4];
      const startTime = new BigNumber(
        Math.floor(new Date().getTime() / 1000)
      ).plus(200);

      const endTime = new BigNumber(
        Math.floor(new Date().getTime() / 1000)
      ).plus(2592000); // 1 Month duration

      await makeKYCProvider(customers, kycProvider);

      await makeLegalDelegate(polyToken, customers, kycProvider, legalDelegate);

      const templateAddress = await makeTemplateWithFinalized(
        compliance,
        kycProvider,
        legalDelegate,
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
        new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(10000),
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

      assert.equal(
        await securityToken.getSTOContractAddress(),
        offering.address,
      );

      await securityToken.startSecurityTokenOffering(owner);

      assert.equal(await securityToken.getBalanceOf(offering.address), 1234567);
      assert.isTrue(await securityToken.getOfferingStatus());

      await polyToken.approve(investor, customers.address, 100);

      await customers.verifyCustomer(
        kycProvider,
        investor,
        'US',
        'CA',
        'investor',
        true,
        new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
      );

      await securityToken.addToWhitelist(owner, investor);

      let checkShareholderDetails = await securityToken.getShareholderDetails(
        investor,
      );
      assert.equal(
        checkShareholderDetails[1],
        true,
        'Should read true, investor has been whitelisted'
      );

      await polyToken.approve(investor, securityToken.address, 10000);
      await increaseTime(1000);
      const stoAddress = await securityToken.getSTOContractAddress();
      assert.equal(stoAddress, offering.address);

      await offering.buySecurityTokenWithPoly(investor, new BigNumber(10000));

      assert.equal(
        (await securityToken.getBalanceOf(investor)).toNumber(),
        100,
      );
      await securityToken.addToWhitelist(owner, auditor);
      checkShareholderDetails = await securityToken.getShareholderDetails(
        auditor,
      );
      assert.equal(
        checkShareholderDetails[1],
        true,
        'Should read true, investor has been whitelisted'
      );
      // transfer
      await securityToken.transfer(investor, auditor, 20);

      // getBalanceOf
      assert.equal((await securityToken.getBalanceOf(auditor)).toNumber(), 20);

      // approve
      await securityToken.approve(auditor, accounts[5], 10);

      // getAllowance()
      assert.equal(
        (await securityToken.getAllowance(auditor, accounts[5])).toNumber(),
        10,
      );

      // transferFrom
      await securityToken.transferFrom(auditor, investor, accounts[5], 5);
      assert.equal((await securityToken.getBalanceOf(investor)).toNumber(), 85);

      // voteToFreeze
      await increaseTime(2592000 + 100); // time jump to reach the endSTO timestamp
      await securityToken.voteToFreeze(investor, auditor);
      const allocationDetailsOfAuditor = await securityToken.getPolyAllocationDetails(
        auditor,
      );
      assert.isTrue(allocationDetailsOfAuditor[5]);

      // withdrawPoly
      await increaseTime(9888888 + 1000); // time jump to reach the vesting period
      const status = await securityToken.withdrawPoly(legalDelegate);
      assert.isTrue(status);
    });
  });
});
