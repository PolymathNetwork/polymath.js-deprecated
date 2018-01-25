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
  makeSecurityToken,
  makeTemplate,
  makeTemplateWithFinalized,
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
    assert.equal(await securityToken._contract.name.call(), 'Token Name');
    assert.equal(await securityToken._contract.decimals.call(), 0);

  });

  // it('updateComplianceProof, getTokenDetails', async () => {
  //   await securityToken.updateComplianceProof(
  //     accounts[0],
  //     fakeBytes32,
  //     fakeBytes32,
  //   );

  //   const details = await securityToken.getTokenDetails();
  //   console.log(details);
  //   assert.equal(details.merkleRoot, fakeBytes32);
  // });

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
      'US-CA',
      'investor',
      true,
      new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
    );

    await securityToken.addToWhitelist(kycProvider, investor);

    let checkShareholderDetails = await securityToken.getShareholderDetails(investor);
    assert.equal(checkShareholderDetails[1], true, "Should read true, investor has been whitelisted");

    let checkPolyAllocationDetails = await securityToken.getPolyAllocationDetails(legalDelegate);
    assert.equal(checkPolyAllocationDetails[1], 9888888, "Should equal 9888888 from make_examples value used");
  });


  it('getRegistrarAddress, isSTOProposed', async () => {
    let registrarAddress = await securityToken.getRegistrarAddress();
    assert.equal(registrarAddress, accounts[0], "Registrar address should read account[0] account, beacuse this was the 'from' value passed into makeSecurityToken");

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

});
