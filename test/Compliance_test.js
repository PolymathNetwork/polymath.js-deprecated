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
} from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';
import { fakeAddress } from './util/fake';

const { assert } = chai;

describe('Compliance wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken;
  let compliance;
  let customers;

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
    await makeKYCProvider(polyToken, customers, accounts[0], accounts[1]);
    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2]);

    const templateAddress = await makeTemplate(
      compliance,
      accounts[1],
      accounts[2],
    );

    assert.isAbove(templateAddress.length, 0);
  });

  it('proposeTemplate, getTemplateProposalsBySecurityToken, getTemplateAddressByProposal', async () => {
    await makeKYCProvider(polyToken, customers, accounts[0], accounts[1]);
    await makeLegalDelegate(polyToken, customers, accounts[1], accounts[2]);
    const templateAddress = await makeTemplate(
      compliance,
      accounts[1],
      accounts[2],
    );
    await compliance.proposeTemplate(accounts[2], fakeAddress, templateAddress);

    assert.equal(
      await compliance.getTemplateAddressByProposal(fakeAddress, 0),
      templateAddress,
    );
  });

  it('setSTO', async () => {
    await makeKYCProvider(polyToken, customers, accounts[0], accounts[1]);

    await compliance.setSTO(
      accounts[0],
      fakeAddress,
      new BigNumber(10),
      new BigNumber(9888888),
      new BigNumber(20),
    );
  });
});
