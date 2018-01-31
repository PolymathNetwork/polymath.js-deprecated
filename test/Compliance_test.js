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
import { makeWeb3Wrapper } from './util/web3';
import { fakeAddress, fakeBytes32 } from './util/fake';

const { assert } = chai;

describe('Compliance wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

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
    await makeKYCProvider(customers, accounts[1]);
    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2]);
    const templateAddress = await makeTemplate(
      compliance,
      accounts[1],
      accounts[2],
    );

    assert.isAbove(templateAddress.length, 0);
  });

  it('proposeTemplate, templateReputation, getTemplateAddressByProposal, cancelTemplateProposal, getAllTemplateProposals', async () => {
    await makeKYCProvider(customers, accounts[1]);
    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2]);
    const templateAddress = await makeTemplateWithFinalized(
      compliance,
      accounts[1],
      accounts[2],
    );

    // Propose Template
    await compliance.proposeTemplate(accounts[2], securityToken.address, templateAddress);
    const logs = await compliance.getLogs('LogNewTemplateProposal', {}, { fromBlock: 1 });
    assert.equal(logs[0].args._template, templateAddress, 'Template address does not match the logged version');

    // Reputation
    let templateReputation = await compliance.getTemplateReputation(templateAddress);
    assert.equal(templateReputation.owner, accounts[2], "TemplateReputation not stored or read properly");

    // Get Template Address By Proposal
    const address = await compliance.getTemplateAddressByProposal(securityToken.address, 0)
    assert.equal(address, templateAddress, 'Proposal returned the wrong template address');

    //Test all templateProposals
    let arrayOfTemplates = await compliance.getAllTemplateProposals(securityToken.address)
    assert.equal(arrayOfTemplates[0], templateAddress, 'Template address does not match the getter function return');

    // Cancel Proposal
    await compliance.cancelTemplateProposal(accounts[2], securityToken.address, 0);

    const addressShouldBeZero = await compliance.getTemplateAddressByProposal(securityToken.address, 0)
    assert.equal(addressShouldBeZero, 0, 'Proposal returned the wrong template address');



  });


  it('getMinimumVestingPeriod', async () => {
    let minimum = await compliance.getMinimumVestingPeriod();
    assert.equal(minimum, 60 * 60 * 24 * 100, "Does not equal 100 days, when it should")
  })

  //so we need to have a securityToken actually created through STRegistrar
  //and so me of the stuff has to match up
  //then we have an actual one in offeringProposals
  it('setSTO, proposeSTO, cancleSTO, getSTOProposal, getSTOAddressByProposal, getAllOfferingProposals', async () => {
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

    const addressShouldBeZero = await compliance.getSTOAddressByProposal(securityToken.address, 0)
    console.log(addressShouldBeZero)
    assert.equal(addressShouldBeZero, 0, 'Proposal did not return zero, which it should have for being cancelled');



  })

  it('getAllOfferingProposals', async () => {

  })

  it('subscribe, unsubscribe, unsubscribeAll', async () => {

  })

});
