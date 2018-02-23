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
  makeCustomer,
  makeSecurityToken,
  makeSecurityTokenRegistrar,
  makeTemplateWithFinalized,
  makeProposedOfferingFactory,
  makeSecurityTokenThroughRegistrar,
  makeSelectedTemplateForSecurityToken,
  makeSecurityTokenOffering,
} from './util/make_examples';
import { makeWeb3 } from './util/web3';
import { fakeAddress, fakeBytes32 } from './util/fake';
import { pk } from './util/testprivatekey';
import getAccounts from './util/getAccounts';

const { assert } = chai;

describe('Compliance wrapper', () => {
  const web3 = makeWeb3();
  const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(
    10000,
  );
  const pk_1 = pk.account_1;
  const pk_2 = pk.account_2;
  const pk_3 = pk.account_3;
  const pk_4 = pk.account_4;
  let accounts;
  let polyToken;
  let compliance;
  let customers;
  let securityToken;
  let registrar;
  let owner;
  let KYCProvider;
  let legalDelegate;

  before(async () => {
    accounts = await getAccounts(web3);
    owner = accounts[0];
    KYCProvider = accounts[1];
    legalDelegate = accounts[2];
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3, accounts[0]);
    customers = await makeCustomers(web3, polyToken, accounts[0]);
    compliance = await makeCompliance(web3, customers, accounts[0]);


    securityToken = await makeSecurityTokenThroughRegistrar(
      web3,
      polyToken,
      customers,
      compliance,
      owner,
      web3.eth.getBlock('latest').timestamp,
      accounts[3],
    );
    securityToken = data[0];
    registrar = data[1];

    await compliance.setRegistrarAddress(registrar.address, owner);
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
    await makeKYCProvider(customers, KYCProvider);
    await makeLegalDelegate(
      polyToken,
      customers,
      KYCProvider,
      legalDelegate,
      expiryTime,
      pk_2,
    );
    const templateAddress = (await makeTemplate(
      compliance,
      KYCProvider,
      legalDelegate,
      expiryTime,
    )).address;

    assert.isAbove(templateAddress.length, 0);
  });

  it('proposeTemplate, templateReputation, getTemplateAddressByProposal, cancelTemplateProposal, getAllTemplateProposals', async () => {
    // Subscribtion setup
    let subscriptionID2 = null;
    const eventName2 = 'LogNewTemplateProposal';
    const indexedFilterValues2 = ["_securityToken"];

    // The callback is passed into the filter.watch function  and is operated on when a new event comes in
    const logNewTemplateProposalArgsPromise = new Promise((resolve, reject) => {
      subscriptionID2 = compliance.subscribe(
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

    // Subscribtion setup
    let subscriptionID4 = null;
    const eventName4 = 'LogCancelTemplateProposal';
    const indexedFilterValues4 = ["_securityToken"];

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logCancleTemplateProposalArgsPromise = new Promise(
      (resolve, reject) => {
        subscriptionID4 = compliance.subscribe(
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

    await makeKYCProvider(customers, KYCProvider);
    await makeLegalDelegate(
      polyToken,
      customers,
      KYCProvider,
      legalDelegate,
      expiryTime,
      pk_2,
    );
    const templateAddress = (await makeTemplateWithFinalized(
      compliance,
      KYCProvider,
      legalDelegate,
      expiryTime,
    )).address;
    // Propose Template
    await compliance.proposeTemplate(
      legalDelegate,
      securityToken.address,
      templateAddress,
    );
    const logs = await compliance.getLogs(
      'LogNewTemplateProposal',
      {},
      { fromBlock: 1 },
    );
    assert.equal(
      logs[0].args._template,
      templateAddress,
      'Template address does not match the logged version',
    );
    const logNewTemplateProposal = await logNewTemplateProposalArgsPromise;
    assert.equal(
      logNewTemplateProposal._securityToken,
      securityToken.address,
      'ST address not picked up from LogNewTemplateProposal event',
    ) // Needs to be renamed from core

    // Reputation
    const templateReputation = await compliance.getTemplateReputation(
      templateAddress,
    );
    let templateReputationReturnedTotalRaised = templateReputation.template.toNumber();

    assert.equal(
      templateReputationReturnedTotalRaised,
      0,
      `TemplateReputation should read 0 becuase none has been raised yet`,
    );

    // Get Template Address By Proposal
    const address = await compliance.getTemplateAddressByProposal(
      securityToken.address,
      0,
    );
    assert.equal(
      address,
      templateAddress,
      'Proposal returned the wrong template address',
    );

    // Test all templateProposals
    const arrayOfTemplates = await compliance.getAllTemplateProposals(
      securityToken.address,
    );
    assert.equal(
      arrayOfTemplates[0],
      templateAddress,
      'Template address does not match the getter function return',
    );

    await compliance.cancelTemplateProposal(
      accounts[2],
      securityToken.address,
      0,
    );

    const logCancleTemplateProposal = await logCancleTemplateProposalArgsPromise;
    assert.equal(
      logNewTemplateProposal._securityToken,
      securityToken.address,
      'ST address not picked up from LogCancleTemplateProposal event',
    ); // needs to be renamed from core

    const addressShouldBeZero = await compliance.getTemplateAddressByProposal(
      securityToken.address,
      0,
    );
    assert.equal(
      addressShouldBeZero,
      0,
      'Proposal returned the wrong template address',
    );

    await compliance.unsubscribeAll();
  });

  it('getMinimumVestingPeriod', async () => {
    const minimum = await compliance.getMinimumVestingPeriod();
    assert.equal(
      minimum,
      60 * 60 * 24 * 100,
      `Does not equal 100 days, when it should`,
    );
  });

  it('registerOfferingFactory, proposeOfferingFactory, cancelOfferingFactoryProposal, getOfferingFactoryByProposal, getAllOfferingFactoryProposals', async () => {
    // STO variables
    const auditor = accounts[4];

    await makeKYCProvider(customers, KYCProvider);

    await makeLegalDelegate(
      polyToken,
      customers,
      KYCProvider,
      legalDelegate,
      expiryTime,
      pk_2,
    );
    const templateAddress = (await makeTemplateWithFinalized(
      compliance,
      KYCProvider,
      legalDelegate,
      expiryTime,
    )).address;

    await makeSelectedTemplateForSecurityToken(
      securityToken,
      compliance,
      polyToken,
      owner,
      legalDelegate,
      KYCProvider,
      fakeBytes32,
      templateAddress,
    );

    await makeCustomer(
      polyToken,
      customers,
      KYCProvider,
      auditor,
      1,
      expiryTime,
      pk_4,
    );

    // This make example does registerOfferingFactory and proposeOfferingFactory, and we will test below
    await makeProposedOfferingFactory(web3, securityToken, compliance, auditor);

    const offeringAddress = await compliance.getOfferingFactoryByProposal(
      securityToken.address,
      0,
    );
    assert.isAbove(
      offeringAddress.length,
      20,
      'It should be the address of the offering contract',
    );

    const allFactoryProposal = await compliance.getAllOfferingFactoryProposals(
      securityToken.address,
    );

    assert.equal(
      allFactoryProposal.length,
      1,
      'Factory contract should be added in the offeringFactoryProposal mapping',
    );

    assert.equal(allFactoryProposal[0], offeringAddress);

    // Cancel Proposal
    await compliance.cancelOfferingFactoryProposal(
      auditor,
      securityToken.address,
      0,
    );

    const cancelledAddress = await compliance.getOfferingFactoryByProposal(
      securityToken.address,
      0,
    );

    assert.equal(cancelledAddress, 0x0);
  });

  // it('LogTemplateCreated event test, subscribe, unsubscribe', async () => {

  //   //subscribtion setup
  //   let subscriptionID1 = null;
  //   const eventName1 = 'LogTemplateCreated';
  //   const indexedFilterValues1 = ["_creator"];
  //   const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);
  //   //the callback is passed into the filter.watch function, and is operated on when a new event comes in
  //   const logTemplateCreatedArgsPromise = new Promise((resolve, reject) => {
  //     subscriptionID1 = compliance.subscribe(eventName1, indexedFilterValues1, (err, log) => {
  //       if (err !== null) {
  //         reject(err);
  //         return;
  //       }
  //       resolve(log.args);
  //     });
  //   });

  //   await makeKYCProvider(customers, accounts[1]);
  //   await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2], expiryTime);
  //   const templateAddress = (await makeTemplate(
  //     compliance,
  //     accounts[1],
  //     accounts[2],
  //     expiryTime,
  //   )).address;

  //   const logTemplateCreated = await logTemplateCreatedArgsPromise;
  //   assert.equal(logTemplateCreated._creator, accounts[2], 'legal delegate creator address wasnt found in event subscription'); //'offeringtype' from make_examples.js
  //   assert.isAbove(logTemplateCreated._template.length, 20, 'template address wasnt found in event subscription');
  //   assert.equal(logTemplateCreated._offeringType, "offeringtype", 'offering type wasnt found in event subscription'); //'offeringtype' from make_examples.js
  //   await compliance.unsubscribe(subscriptionID1);

  // })
});
