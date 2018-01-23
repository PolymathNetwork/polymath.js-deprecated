import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
  makeSecurityTokenRegistrar,
} from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';

const { assert } = chai;

describe('Registrar wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken;
  let compliance;
  let customers;
  let registrar;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    // parameters for Template constructor
    polyToken = await makePolyToken(web3Wrapper, accounts[0]);
    customers = await makeCustomers(web3Wrapper, polyToken, accounts[0]);
    compliance = await makeCompliance(web3Wrapper, customers, accounts[0]);
    registrar = await makeSecurityTokenRegistrar(
      web3Wrapper,
      polyToken,
      customers,
      compliance,
      accounts[0],
    );

    // Fund two accounts.
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[0],
    );
    await polyToken.generateNewTokens(
      new BigNumber(10).toPower(18).times(100000),
      accounts[1],
    );
  });

  it('createSecurityToken, getSecurityTokenData, getSecurityTokenAddress, getLogs ', async () => {
    const creator = accounts[0];
    const name = 'FUNTOKEN';
    const ticker = 'FUNT';
    const totalSupply = 1234567;
    const owner = accounts[0];
    const host = accounts[1];
    const fee = 1000;
    const type = 1;
    const maxPoly = 100000;
    const lockupPeriod = 1516397507 + 31557600; // one year from jan 19 2017
    const quorum = 75;

    await polyToken.approve(owner, registrar.address, fee);
    await registrar.createSecurityToken(
      creator,
      name,
      ticker,
      totalSupply,
      owner,
      host,
      fee,
      type,
      maxPoly,
      lockupPeriod,
      quorum,
    );

    // const address = await registrar.getSecurityTokenAddress(ticker);
    // const tokenData = await registrar.getSecurityTokenData(address);

    const logs = await registrar.getLogs(
      'LogNewSecurityToken',
      {},
      { fromBlock: 1 },
    );
    assert.isAbove(logs.length, 0, 'Got a log');
    assert.equal(
      logs[0].args.ticker,
      ticker,
      'Ticker wasnt picked up, therefore a problem with reading LogNewSecurityToken',
    );

    logs[0].args.fee = logs[0].args.fee.toNumber();
    assert.equal(
      logs[0].args.fee,
      fee,
      'Fee wasnt picked up, therefore a problem with reading LogNewSecurityToken',
    );
  });

  it('getPolyTokenAddress', async () => {
    const polyAddress = await registrar.getPolyTokenAddress();
    assert.equal(
      polyAddress,
      polyToken.address,
      'Address wasnt queried properly',
    );
  });

  it('getPolyCustomersAddress', async () => {
    const customersAddress = await registrar.getCustomersAddress();
    assert.equal(
      customersAddress,
      customers.address,
      'Address wasnt queried properly',
    );
  });

  it('getPolyComplianceAddress', async () => {
    const complianceAddress = await registrar.getComplianceAddress();
    assert.equal(
      complianceAddress,
      compliance.address,
      'Address wasnt queried properly',
    );
  });

});
