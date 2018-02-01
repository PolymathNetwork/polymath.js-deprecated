// @flow

import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
  makeKYCProvider,
  makeLegalDelegate,
  makeTemplate,
  makeSecurityToken,
  makeSecurityTokenRegistrar,
  makeTemplateWithFinalized,
  makeSecurityTokenThroughRegistrar,
  makeSelectedTemplateForSecurityToken,
  makeSecurityTokenOffering,
} from './util/make_examples';
import { makeWeb3Wrapper, makeWeb3 } from './util/web3';
import { fakeAddress, fakeBytes32 } from './util/fake';

const { assert } = chai;

describe('Compliance wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();
  const web3 = makeWeb3();
  const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(100000);

  let accounts;
  let polyToken;
  let compliance;
  let customers;
  let securityToken;
  let registrar;

  before(async () => {
    //accounts[0] = owner
    //accounts[1] = kyc
    //accounts[2] = legal delegate

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
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[3],
    );
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[4],
    );
  });

  it('createTemplate', async () => {
    await makeKYCProvider(customers, accounts[1], expiryTime);
    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2], expiryTime);
    const templateAddress = await makeTemplate(
      compliance,
      accounts[1],
      accounts[2],
      expiryTime,
    );

    assert.isAbove(templateAddress.length, 0);
  });

  it('proposeTemplate, templateReputation, getTemplateAddressByProposal, cancelTemplateProposal, getAllTemplateProposals', async () => {


    //subscribtion setup
    let subscriptionID2 = null;
    const eventName2 = 'LogNewTemplateProposal';
    const indexedFilterValues2 = ["_securityToken"];

    //the callback is passed into the filter.watch function  and is operated on when a new event comes in
    const logNewTemplateProposalArgsPromise = new Promise((resolve, reject) => {

      subscriptionID2 = compliance.subscribe(eventName2, indexedFilterValues2, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    //subscribtion setup
    let subscriptionID4 = null;
    const eventName4 = 'LogCancelTemplateProposal';
    const indexedFilterValues4 = ["_securityToken"];

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logCancleTemplateProposalArgsPromise = new Promise((resolve, reject) => {

      subscriptionID4 = compliance.subscribe(eventName4, indexedFilterValues4, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    await makeKYCProvider(customers, accounts[1], expiryTime);
    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2], expiryTime);
    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      accounts[1],
      accounts[2],
      expiryTime,

    );


    // Propose Template
    await compliance.proposeTemplate(accounts[2], securityToken.address, templateAddress);
    const logs = await compliance.getLogs('LogNewTemplateProposal', {}, { fromBlock: 1 });
    assert.equal(logs[0].args._template, templateAddress, 'Template address does not match the logged version');


    let logNewTemplateProposal = await logNewTemplateProposalArgsPromise;
    assert.equal(logNewTemplateProposal._securityToken, securityToken.address, 'ST address not picked up from LogNewTemplateProposal event') //needs to be renamed from core


    // Reputation
    let templateReputation = await compliance.getTemplateReputation(templateAddress);
    assert.equal(templateReputation.owner, accounts[2], "TemplateReputation not stored or read properly");

    // Get Template Address By Proposal
    const address = await compliance.getTemplateAddressByProposal(securityToken.address, 0)
    assert.equal(address, templateAddress, 'Proposal returned the wrong template address');

    //Test all templateProposals
    let arrayOfTemplates = await compliance.getAllTemplateProposals(securityToken.address)
    assert.equal(arrayOfTemplates[0], templateAddress, 'Template address does not match the getter function return');


    await compliance.cancelTemplateProposal(accounts[2], securityToken.address, 0);

    let logCancleTemplateProposal = await logCancleTemplateProposalArgsPromise;
    assert.equal(logNewTemplateProposal._securityToken, securityToken.address, 'ST address not picked up from LogCancleTemplateProposal event') //needs to be renamed from core

    const addressShouldBeZero = await compliance.getTemplateAddressByProposal(securityToken.address, 0)
    assert.equal(addressShouldBeZero, 0, 'Proposal returned the wrong template address');

    await compliance.unsubscribeAll();

   });


  it('getMinimumVestingPeriod', async () => {
    let minimum = await compliance.getMinimumVestingPeriod();
    assert.equal(minimum, 60 * 60 * 24 * 100, "Does not equal 100 days, when it should")
  })

  // so we need to have a securityToken actually created through STRegistrar
  // and so me of the stuff has to match up
  // then we have an actual one in offeringProposals
  it('setSTO, proposeSTO, cancleSTO, getSTOProposal, getSTOAddressByProposal, getAllOfferingProposals', async () => {

    //subscribtion setup
    let subscriptionID3 = null;
    const eventName3 = 'LogNewContractProposal';
    const indexedFilterValues3 = ["_securityToken"];

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewContractProposalArgsPromise = new Promise((resolve, reject) => {

      subscriptionID3 = compliance.subscribe(eventName3, indexedFilterValues3, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });



    //subscribtion setup
    let subscriptionID5 = null;
    const eventName5 = 'LogCancelContractProposal';
    const indexedFilterValues5 = ["_securityToken"];

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logCancleContractProposalArgsPromise = new Promise((resolve, reject) => {

      subscriptionID5 = compliance.subscribe(eventName5, indexedFilterValues5, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });


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

    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2], expiryTime);
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

    //this make example does setSTO and proposeSTO, and we will test below
    const offering = await makeSecurityTokenOffering(
      web3Wrapper,
      polyToken,
      securityToken,
      compliance,
      auditor,
      startTime,
      endTime,
    );


    let logNewContractProposal = await logNewContractProposalArgsPromise;
    assert.equal(logNewContractProposal._delegate, auditor, 'legal delegate not picked up from LogNewProposal event') //needs to be renamed from core

    //to confirm setSTO, we need to check offerings for the msg.sender addr
    //which is using getOfferingByProposal
    //in setSTO we
    let getSTO = await compliance.getSTOProposal(securityToken.address, 0)
    assert.equal(getSTO.auditorAddress, auditor, "Auditor address not read properly");

    //to confirm proposeSTO worked, we check offeringProposals, which is getSTOAddress by proposal
    let getSTOProposal = await compliance.getSTOAddressByProposal(securityToken.address, 0)
    assert.equal(getSTOProposal, getSTO.stoContractAddress, "STO address not read properly");

    let getAllOfferings = await compliance.getAllOfferingProposals(securityToken.address, 0)
    assert.equal(getAllOfferings[0], getSTO.stoContractAddress, "STO array of addresses not read properly");


    // Cancel Proposal
    await compliance.cancelSTOProposal(auditor, securityToken.address, 0);

    //LOGCANCLESTOPROPOSAL
    let logCancleContractProposal = await logCancleContractProposalArgsPromise;
    assert.equal(logNewContractProposal._securityToken, securityToken.address, 'ST address not picked up from LogCancleContractProposal event') //needs to be renamed from core



    const addressShouldBeZero = await compliance.getSTOAddressByProposal(securityToken.address, 0)
    assert.equal(addressShouldBeZero, 0, 'Proposal did not return zero, which it should have for being cancelled');

    await compliance.unsubscribe(subscriptionID3);
    await compliance.unsubscribe(subscriptionID5);


  })

  it('LogTemplateCreated event test, subscribe, unsubscribe', async () => {

    //subscribtion setup
    let subscriptionID1 = null;
    const eventName1 = 'LogTemplateCreated';
    const indexedFilterValues1 = ["_creator"];
    const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);
    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logTemplateCreatedArgsPromise = new Promise((resolve, reject) => {
      subscriptionID1 = compliance.subscribe(eventName1, indexedFilterValues1, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    await makeKYCProvider(customers, accounts[1], expiryTime);
    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2], expiryTime);
    const templateAddress = await makeTemplate(
      compliance,
      accounts[1],
      accounts[2],
      expiryTime,
    );


    const logTemplateCreated = await logTemplateCreatedArgsPromise;
    assert.equal(logTemplateCreated._creator, accounts[2], 'legal delegate creator address wasnt found in event subscription'); //'offeringtype' from make_examples.js
    assert.isAbove(logTemplateCreated._template.length, 20, 'template address wasnt found in event subscription');
    assert.equal(logTemplateCreated._offeringType, "offeringtype", 'offering type wasnt found in event subscription'); //'offeringtype' from make_examples.js
    await compliance.unsubscribe(subscriptionID1);


  })



});
