import chai from 'chai';
import 'mocha';

import { makeTemplateDirectCall } from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';
import { fakeBytes32, fakeAddress } from './util/fake';

const { assert } = chai;

describe('Template wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let template;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    // parameters for Template constructor
    const owner = accounts[0];
    const offeringType = 'Public sale';
    const issuerJurisdiction = 'CAN-ON';
    const accredited = false;
    const KYC = accounts[1];
    const details = 'this would be hashes';
    const expires = 1602288000;
    const fee = 1000;
    const quorum = 10;
    const vestingPeriod = 8888888;

    template = await makeTemplateDirectCall(
      web3Wrapper,
      owner,
      offeringType,
      issuerJurisdiction,
      accredited,
      KYC,
      details,
      expires,
      fee,
      quorum,
      vestingPeriod,
    );
  });

  it('addJurisdiction, checkIfCountryJurisdictionIsAllowed', async () => {
    const canada = 'can-on';
    const usa = 'USA-DW';
    const india = 'INDIA';

    const beforeCanada = await template.checkIfCountryJurisdictionIsAllowed(canada);
    const beforeUsa = await template.checkIfCountryJurisdictionIsAllowed(usa);
    const beforeIndia = await template.checkIfCountryJurisdictionIsAllowed(india);
    assert.equal(beforeCanada, false, 'canada status was not read properly');
    assert.equal(beforeUsa, false, 'usa status was not read properly');
    assert.equal(beforeIndia, false, 'india status was not read properly');

    await template.addJurisdiction(
      accounts[0],
      [canada, usa, india],
      [true, true, true],
    );

    const canadaShouldBeUpperCase = 'CAN-ON';

    const afterCanada = await template.checkIfCountryJurisdictionIsAllowed(
      canadaShouldBeUpperCase,
    );
    const afterUsa = await template.checkIfCountryJurisdictionIsAllowed(usa);
    const afterIndia = await template.checkIfCountryJurisdictionIsAllowed(india);
    assert.equal(afterCanada, true, 'canada status was not read properly');
    assert.equal(afterUsa, true, 'usa status was not read properly');
    assert.equal(afterIndia, true, 'india status was not read properly');
  });

  it('addDivisionJurisdiction, checkIfDivisionJurisdictionIsAllowed', async () => {
    const ontario = 'ONTARIO-CANADA';
    const california = 'CALIFORNIA-USA';
    const dhaka = 'DHAKA-BANGLADESH';

    const beforeOntario = await template.checkIfDivisionJurisdictionIsAllowed(ontario);
    const beforeCalifornia = await template.checkIfDivisionJurisdictionIsAllowed(california);
    const beforeDhaka = await template.checkIfDivisionJurisdictionIsAllowed(dhaka);
    assert.equal(beforeOntario, false, 'ontario status was not read properly');
    assert.equal(beforeCalifornia, false, 'california status was not read properly');
    assert.equal(beforeDhaka, false, 'dhaka status was not read properly');

    await template.addDivisionJurisdiction(
      accounts[0],
      [ontario, california, dhaka],
      [true, true, true],
    );

    const ontarioShouldBeUpperCase = 'ONTARIO-CANADA';

    const afterOntario = await template.checkIfDivisionJurisdictionIsAllowed(
      ontarioShouldBeUpperCase,
    );
    const afterCalifornia = await template.checkIfDivisionJurisdictionIsAllowed(california);
    const afterDhaka = await template.checkIfDivisionJurisdictionIsAllowed(dhaka);
    assert.equal(afterOntario, true, 'ontario status was not read properly');
    assert.equal(afterCalifornia, true, 'california status was not read properly');
    assert.equal(afterDhaka, true, 'dhaka status was not read properly');
  });

  it('addRoles, checkIfRoleIsAllowed', async () => {
    const investor = 1;
    const delegate = 2;
    const issuer = 3;

    const beforeInvestor = await template.checkIfRoleIsAllowed(investor);
    const beforeDelegate = await template.checkIfRoleIsAllowed(delegate);
    const beforeIssuer = await template.checkIfRoleIsAllowed(issuer);
    assert.equal(
      beforeInvestor,
      false,
      'Investor status was not read properly',
    );
    assert.equal(
      beforeDelegate,
      false,
      'Delegate status was not read properly',
    );
    assert.equal(beforeIssuer, false, 'Issuer status was not read properly');

    await template.addRoles(accounts[0], ['issuer', 'investor', 'delegate']);

    const afterInvestor = await template.checkIfRoleIsAllowed(investor);
    const afterDelegate = await template.checkIfRoleIsAllowed(delegate);
    const afterIssuer = await template.checkIfRoleIsAllowed(issuer);
    assert.equal(afterInvestor, true, 'Investor status was not read properly');
    assert.equal(afterDelegate, true, 'Delegate status was not read properly');
    assert.equal(afterIssuer, true, 'Issuer status was not read properly');
  });

  it('updateTemplateDetails, getTemplateDetails', async () => {
    await template.updateTemplateDetails(accounts[0], fakeBytes32); // fake hash

    const getUpdatedDetails = await template.getTemplateDetails();
    const newHash = getUpdatedDetails[0];
    assert.equal(newHash, fakeBytes32, 'Template details were not updated');

    const ownerError = await template.updateTemplateDetails(
      fakeAddress,
      fakeBytes32,
    );
    assert.equal(
      ownerError,
      'Only owner can call updateTemplateDetails',
      'Custom error message did not work',
    );

    const emptyStringError = await template.updateTemplateDetails(
      accounts[0],
      '',
    );
    assert.equal(
      emptyStringError,
      'Details cannot be an empty string',
      'Custom error message did not work',
    );
  });

  it('finalizeTemplate, getTemplateDetails', async () => {
    const getTemplateDetails = await template.getTemplateDetails();
    const templateShouldBeFalse = getTemplateDetails[1];
    assert.equal(
      templateShouldBeFalse,
      false,
      'Template has already been finalized',
    );

    await template.finalizeTemplate(accounts[0]);

    const getUpdatedDetails = await template.getTemplateDetails();
    const templateShouldBeTrue = getUpdatedDetails[1];
    assert.equal(
      templateShouldBeTrue,
      true,
      'Template did not update to be finalized',
    );

    const ownerError = await template.finalizeTemplate(fakeAddress);
    assert.equal(
      ownerError,
      'Only owner can call finalizeTemplate',
      'Custom error message did not work',
    );
  });

  it('checkTemplateRequirements should return true when the requirements given are all met', async () => {
    const jurisdictionCountry = 'CAN';
    const jurisdictionDivision = 'ON';
    const accredited = false;
    const role = 'investor';
    await template.addJurisdiction(accounts[0], [jurisdictionCountry], [true]);
    await template.addDivisionJurisdiction(accounts[0], [jurisdictionDivision], [true]);


    await template.addRoles(accounts[0], [role]);
    const areRequirementsMet = await template.checkTemplateRequirements(
      jurisdictionCountry,
      jurisdictionDivision,
      accredited,
      role,
    );

    assert.equal(
      areRequirementsMet,
      true,
      'Passing template requirements threw a failure from polymath.js',
    );
  });

  it('checkTemplateRequirements should return false when a requirement is not met', async () => {
    const jurisdictionCountry = 'CAN';
    const jurisdictionDivision = 'ON';
    const accredited = false;
    const role = 'investor';
    const roleNotAdded = 'delegate'; // testing the failure

    await template.addJurisdiction(accounts[0], [jurisdictionCountry], [true]);
    await template.addDivisionJurisdiction(accounts[0], [jurisdictionDivision], [true]);
    await template.addRoles(accounts[0], [role]);
    const areRequirementsMet = await template.checkTemplateRequirements(
      jurisdictionCountry,
      jurisdictionDivision,
      accredited,
      roleNotAdded,
    );

    assert.equal(
      areRequirementsMet,
      false,
      'Failing template requirements passed from polymath.js',
    );
  });

  it('getTemplateUsageDetails', async () => {
    const beforeEachFee = 1000;
    const beforeEachQuorum = 10;
    const beforeEachVestingPeriod = 8888888;
    const beforeEachOwner = accounts[0];
    const beforeEachKYC = accounts[1];

    const templateUsageDetails = await template.getTemplateUsageDetails();

    assert.equal(
      templateUsageDetails[0],
      beforeEachFee,
      'Fee was not properly received',
    );
    assert.equal(
      templateUsageDetails[1],
      beforeEachQuorum,
      'Quorum was not properly received',
    );
    assert.equal(
      templateUsageDetails[2],
      beforeEachVestingPeriod,
      'Vesting period was not properly received',
    );
    assert.equal(
      templateUsageDetails[3],
      beforeEachOwner,
      'Owner address was not properly received',
    );
    assert.equal(
      templateUsageDetails[4],
      beforeEachKYC,
      'KYC address was not properly received',
    );
  });

  it('getOfferingType', async () => {
    const beforeEachOffering = 'Public sale';
    const offeringType = await template.getOfferingType();
    assert.equal(
      offeringType,
      beforeEachOffering,
      'Offering type was incorrectly read',
    );
  });

  it('getIssuerJurisdiction', async () => {
    const beforeEachJurisdiction = 'CAN-ON';
    const issuerJurisdiction = await template.getIssuerJurisdiction();
    assert.equal(
      issuerJurisdiction,
      beforeEachJurisdiction,
      'Issuer jurisdiction was incorrectly read',
    );
  });

  it('checkIfAccreditationIsRequired', async () => {
    const accreditation = await template.checkIfAccreditationIsRequired();
    assert.equal(
      accreditation,
      false,
      'Accreditation was not correctly checked and compared to false',
    );
  });

  it('getTemplateExpiry', async () => {
    const expiry = await template.getTemplateExpiry();
    const expireTime = 1602288000;
    assert.equal(
      expiry,
      expireTime,
      'Expiry was not correctly checked and compared',
    );
  });

  it('getLogs, subscribe, ,unsubscribe, unsubscribeAll', async () => {
    //subscribtion setup
    let subscriptionID1 = null;
    const eventName1 = 'DetailsUpdated';
    const indexedFilterValues1 = null;

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const detailsUpdatedArgsPromise = new Promise((resolve, reject) => {
      subscriptionID1 = template.subscribe(eventName1, indexedFilterValues1, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    await template.updateTemplateDetails(accounts[0], fakeBytes32); // fake hash

    const detailsUpdated = await detailsUpdatedArgsPromise
    assert.equal(detailsUpdated._prevDetails, '0x7468697320776f756c6420626520686173686573000000000000000000000000', 'previous details wasnt found in event subscription'); //hash of 'this would be hashes'
    assert.equal(detailsUpdated._newDetails, fakeBytes32, 'new details wasnt found in event subscription');
    assert.isAbove(detailsUpdated._updateDate.toNumber(), 1517265000, 'Update date wasnt found in event subscription'); //some time on jan 29th 2017
    await template.unsubscribeAll();

    const logs = await template.getLogs(
      eventName1,
      {},
      { fromBlock: 1 },
    );
    assert.isAbove(logs.length, 0, 'Got a log');
    assert.equal(logs[0].args._prevDetails, '0x7468697320776f756c6420626520686173686573000000000000000000000000', 'logs have correct data retrieved');

  })
});
