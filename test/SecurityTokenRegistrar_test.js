import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
  makeSecurityToken,
  makeSecurityTokenRegistrar,
} from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';
import SecurityToken from '../src/contract_wrappers/SecurityToken';

const { assert } = chai;

describe('Registrar wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken;
  let compliance;
  let customers;
  let registrar;
  let securityToken;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    // parameters for Template constructor
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

    registrar = await makeSecurityTokenRegistrar(
      web3Wrapper,
      polyToken,
      customers,
      compliance,
      securityToken,
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
    const decimals = 8;
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
      decimals,
      owner,
      maxPoly,
      host,
      fee,
      type,
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

  it('subscribe, unsubscibe, unsubscribeAll', async () => {
    //subscribtion setup
    let subscriptionID = null;
    const eventName1 = 'LogNewSecurityToken';
    const indexedFilterValues1 = null;

    //the callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewSecurityTokenArgsPromise = new Promise((resolve, reject) => {
      subscriptionID = registrar.subscribe(eventName1, indexedFilterValues1, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    //functions to test for first token made
    const creator = accounts[0];
    const name = 'FUNTOKEN';
    const ticker = 'FUNT';
    const totalSupply = 1234567;
    const decimals = 8;
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
      decimals,
      owner,
      maxPoly,
      host,
      fee,
      type,
      lockupPeriod,
      quorum,
    );

    const logNewSecurityToken = await logNewSecurityTokenArgsPromise;
    assert.equal(logNewSecurityToken.ticker, ticker, 'Ticker wasnt found in event subscription');
    assert.isAbove(logNewSecurityToken.securityTokenAddress.length, 20, 'Address wasnt found in event subscription');
    assert.equal(logNewSecurityToken.owner, owner, 'Owner wasnt found in event subscription');
    assert.equal(logNewSecurityToken.host, host, 'Host wasnt found in event subscription');
    assert.equal(logNewSecurityToken.fee, fee, 'Fee wasnt found in event subscription');
    assert.equal(logNewSecurityToken._type, type, 'Type wasnt found in event subscription');

    //note: if unsubscribe does not work, the test in the terminal will be stuck running a process
    //and you can see the process is running by looking at testrpc and seeing 'eth_getFilterChanges' constantly repeated
    await registrar.unsubscribe(subscriptionID);


    //testing two to see that we get 2 logs in the getLogs function
    let subscriptionID2 = null;
    const logNewSecurityTokenArgsPromise2 = new Promise((resolve, reject) => {
      subscriptionID2 = registrar.subscribe(eventName1, indexedFilterValues1, (err, log) => {
        if (err !== null) {
          reject(err);
          return;
        }
        resolve(log.args);
      });
    });

    let secondTestTicker = 'STT';
    await polyToken.approve(owner, registrar.address, fee);
    await registrar.createSecurityToken(
      creator,
      name,
      secondTestTicker,
      totalSupply,
      decimals,
      owner,
      maxPoly,
      host,
      fee,
      type,
      lockupPeriod,
      quorum,
    );

    const logNewSecurityToken2 = await logNewSecurityTokenArgsPromise2;
    assert.equal(logNewSecurityToken2.ticker, secondTestTicker, 'Ticker wasnt found in event subscription');
    assert.isAbove(logNewSecurityToken2.securityTokenAddress.length, 20, 'Address wasnt found in event subscription');
    assert.equal(logNewSecurityToken2.owner, owner, 'Owner wasnt found in event subscription');
    assert.equal(logNewSecurityToken2.host, host, 'Host wasnt found in event subscription');
    assert.equal(logNewSecurityToken2.fee, fee, 'Fee wasnt found in event subscription');
    assert.equal(logNewSecurityToken2._type, type, 'Type wasnt found in event subscription');
    await registrar.unsubscribeAll();

    const logs = await registrar.getLogs(
      'LogNewSecurityToken',
      { owner: accounts[0] },
      { fromBlock: 1, toBlock: 'latest' },
    );
    assert.equal(logs.length, 2, 'Two logs should appear in the array since we made 2 security tokens');
    assert(logs[0].args.fee.equals(fee), 'Retrieved first Transfer log');
  })

});
