// @flow

import BigNumber from 'bignumber.js';
import chai from 'chai';
import { before, beforeEach, describe, it } from 'mocha';

import {
  PolyToken,
  Compliance,
  Customers,
  SecurityToken,
  SecurityTokenRegistrar,
} from '../src/contract_wrappers';
import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
  makeKYCProvider,
  makeLegalDelegate,
  makeSecurityToken,
  makeSecurityTokenRegistrar,
  makeTemplate,
  makeTemplateWithFinalized,
  makeSecurityTokenThroughRegistrar,
} from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';
import { fakeBytes32 } from './util/fake';

const { assert } = chai;

describe('SecurityToken wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken: PolyToken;
  let customers: Customers;
  let compliance: Compliance;
  let securityToken: SecurityToken;
  let registrar: SecurityTokenRegistrar;
  let securityTokenAddress;

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
  });

  it('getName, getDecimals', async () => {
    assert.equal(await securityToken._contract.name.call(), 'FUNTOKEN');
    assert.equal(await securityToken._contract.decimals.call(), 8);

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

  it('selectTemplate, addToWhiteList, getShareholderDetails, getPolyAllocationDetails', async () => {
    const owner = accounts[0];
    const kycProvider = accounts[1];
    const legalDelegate = accounts[2];
    const investor = accounts[3];
    await makeKYCProvider(polyToken, customers, owner, kycProvider);

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

    let checkShareholderDetails = await securityToken.getShareholderDetails(investor);
    assert.equal(checkShareholderDetails[1], true, "Should read true, investor has been whitelisted");

    let checkPolyAllocationDetails = await securityToken.getPolyAllocationDetails(legalDelegate);
    assert.equal(checkPolyAllocationDetails[1], 9888888, "Should equal 9888888 from make_examples value used");
  });


  it('tokensIssuedBySTO, isSTOProposed', async () => {

    let isSTOProposed = await securityToken.isSTOProposed();
    assert.equal(isSTOProposed, false, "Should read false as no STO has been proposed");

    let tokensIssuedBySTO = await securityToken.tokensIssuedBySTO();
    assert.equal(tokensIssuedBySTO, 0, "Should read zero we havent issued tokens yet");
  });

  it('getVoted, getContributedToSTO', async () => {
    let hasVoted = await securityToken.getVoted(accounts[8], accounts[7]); //random accounts
    assert.equal(hasVoted, false, "Should read false no one has voted");
    let getContributedToSTO = await securityToken.getContributedToSTO(accounts[1])
    assert.equal(getContributedToSTO, false, "Should read 0 no one has contributed yet");
  });



  it('subscribe, unsubscribe, unsubscribeAll, getLogs', async () => {

    //subscribtion setup
    let subscriptionID1 = null;
    const eventName1 = 'LogTemplateSet';
    const indexedFilterValues1 = ['_delegateAddress', '_KYC'];
    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logTemplateSetArgsPromise = new Promise((resolve, reject) => {
      subscriptionID1 = securityToken.subscribe(eventName1, indexedFilterValues1, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    //subscribtion setup
    let subscriptionID2 = null;
    const eventName2 = 'LogUpdatedComplianceProof';
    const indexedFilterValues2 = null;

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logUpdatedComplianceProofArgsPromise = new Promise((resolve, reject) => {

      subscriptionID2 = securityToken.subscribe(eventName2, indexedFilterValues2, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    //subscribtion setup
    let subscriptionID3 = null;
    const eventName3 = 'LogNewWhitelistedAddress';
    const indexedFilterValues3 = null;

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewWhitelistedAddressArgsPromise = new Promise((resolve, reject) => {
      subscriptionID3 = securityToken.subscribe(eventName3, indexedFilterValues3, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    await securityToken.updateComplianceProof(
      accounts[0],
      fakeBytes32,
      fakeBytes32,
    );

    const owner = accounts[0];
    const kycProvider = accounts[1];
    const legalDelegate = accounts[2];
    const investor = accounts[3];
    await makeKYCProvider(polyToken, customers, owner, kycProvider);

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


    const logUpdateCompliance = await logUpdatedComplianceProofArgsPromise;
    assert.equal(logUpdateCompliance._merkleRoot, fakeBytes32, 'merkle root  wasnt found in event subscription');
    assert.equal(logUpdateCompliance._complianceProofHash, fakeBytes32, 'compliance hash wasnt found in event subscription');
    await securityToken.unsubscribe(subscriptionID2);

    const logTemplateSet = await logTemplateSetArgsPromise;
    assert.equal(logTemplateSet._delegateAddress, legalDelegate, 'Legal delegate address wasnt found in event subscription');
    assert.isAbove(logTemplateSet._template.length, 20, 'Template wasnt found in event subscription');
    assert.equal(logTemplateSet._KYC, kycProvider, 'KYC provider address wasnt found in event subscription');



    const logWhitelistAddress = await logNewWhitelistedAddressArgsPromise;
    // assert.equal(logWhitelistAddress._KYC, kycProvider, 'KYC provider address wasnt found in event subscription');
    assert.equal(logWhitelistAddress._shareholder, investor, 'Investor/sharholder wasnt found in event subscription');
    assert.equal(logWhitelistAddress._role, 1, 'Role wasnt found in event subscription');
    await securityToken.unsubscribeAll();


  })





  //LogTempalteSet = selectTemplate
  //updateComplianceProof = LogUpdatedComplianceProof
  //LogNewWhitelist = addToWhiteList

  //LogNewBlackList = addToBlackList

  //cant do sleectOfferingProposal - LogSetSTOContract -satyam done
  //LogVoteToFreeze - wait until this is done
  //LogTokensIssued - cant test until STO is worked out


});
