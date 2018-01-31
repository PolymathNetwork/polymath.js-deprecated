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
} from './util/make_examples';
import { makeWeb3Wrapper, makeWeb3 } from './util/web3';
import { fakeAddress } from './util/fake';

const { assert } = chai;

describe('Compliance wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();
  const web3 = makeWeb3();
  const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(10000);

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

  it('proposeTemplate, templateReputation, getTemplateAddressByProposal, cancelTemplateProposal', async () => {
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
    assert.equal(logs[0].args._template, templateAddress, 'Template address does not match the logged version');

    // Reputation
    let templateReputation = await compliance.getTemplateReputation(templateAddress);
    assert.equal(templateReputation.owner, accounts[2], "TemplateReputation not stored or read properly");

    // Get Template Address By Proposal
    // const address = compliance.getTemplateAddressByProposal(securityToken.address, )
    // assert.equal(address, templateAddress, 'Proposal returned the wrong template address');

    // Cancel Proposal
    // templateAddress.cancelTemplateProposal(accounts[2],securityToken.address, );

  });

  it('setSTO', async () => {
    await makeKYCProvider(customers, accounts[1], expiryTime);

    await compliance.setSTO(
      accounts[0],
      fakeAddress,
      new BigNumber(10),
      new BigNumber(9888888),
      new BigNumber(20),
    );
  });

  it('getMinimumVestingPeriod', async () => {
    let minimum = await compliance.getMinimumVestingPeriod();
    assert.equal(minimum, 60 * 60 * 24 * 100, "Does not equal 100 days, when it should")
  })

  // it('getTemplateReputation', async() => {

  // })

  it('subscribe, unsubscribe, unsubscribeAll', async () => {

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

    //subscribtion setup
    let subscriptionID2 = null;
    const eventName2 = 'LogNewTemplateProposal';
    const indexedFilterValues2 = "_securityToken";

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
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
