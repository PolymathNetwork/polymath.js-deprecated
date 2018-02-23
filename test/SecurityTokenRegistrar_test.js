import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';
import Web3 from 'web3';

import {
  makePolyToken,
  makeCompliance,
  makeCustomers,
  makeSecurityToken,
  makeSecurityTokenRegistrar,
} from './util/make_examples';
import { makeWeb3 } from './util/web3';
import getAccounts from './util/getAccounts';
import SecurityToken from '../src/contract_wrappers/SecurityToken';

const { assert } = chai;

describe('Registrar wrapper', () => {
  const web3 = makeWeb3();
  const expiryTime = new BigNumber(web3.eth.getBlock('latest').timestamp).plus(
    10000,
  );

  let accounts;
  let polyToken;
  let compliance;
  let customers;
  let registrar;
  // create securityToken
  let owner;
  let nameSpaceName;
  const fee = new BigNumber(100).times(new BigNumber(10).pow(18));

  before(async () => {
    accounts = await getAccounts(web3);
    owner = accounts[0];
    nameSpaceName = 'AWESOME POLY';
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3, accounts[0]);
    customers = await makeCustomers(web3, polyToken, accounts[0]);
    compliance = await makeCompliance(web3, customers, accounts[0]);

    registrar = await makeSecurityTokenRegistrar(
      web3,
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
    const totalSupply = new BigNumber(1234567);
    const decimals = 8;
    const type = 1;
    const lockupPeriod = expiryTime + 31557600; // one year plus
    const quorum = 75;

    await registrar.createNameSpace(nameSpaceName, owner, fee);

    await polyToken.approve(owner, registrar.address, fee);
    const securityToken = await registrar.createSecurityToken(
      nameSpaceName,
      creator,
      name,
      ticker,
      totalSupply,
      decimals,
      owner,
      type,
      lockupPeriod,
      quorum,
    );

    assert(
      Web3.prototype.isAddress(securityToken.address),
      'Returned security token has valid address.',
    );

    const logs = await registrar.getLogs(
      'LogNewSecurityToken',
      {},
      { fromBlock: 1 },
    );
    assert.isAbove(logs.length, 0, 'Got a log');
    assert.equal(
      logs[0].args._ticker,
      ticker,
      'Ticker wasnt picked up, therefore a problem with reading LogNewSecurityToken',
    );

    assert.equal(
      logs[0].args._nameSpace,
      nameSpaceName,
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
    // subscribtion setup
    let subscriptionID1 = null;
    const eventName1 = 'LogNewSecurityToken';
    const indexedFilterValues1 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNewSecurityTokenArgsPromise = new Promise((resolve, reject) => {
      subscriptionID1 = registrar.subscribe(
        eventName1,
        indexedFilterValues1,
        (err, log) => {
          if (err !== null) {
            reject(err);
            return;
          }
          resolve(log.args);
        },
      );
    });

    // subscribtion setup
    let subscriptionID2 = null;
    const eventName2 = 'LogNameSpaceChange';
    const indexedFilterValues2 = null;

    // The callback is passed into the filter.watch function, and is operated on when a new event comes in
    const logNameSpaceChangeArgsPromise = new Promise((resolve, reject) => {
      subscriptionID2 = registrar.subscribe(
        eventName1,
        indexedFilterValues1,
        (err, log) => {
          if (err !== null) {
            reject(err);
            return;
          }
          resolve(log.args);
        },
      );
    });

    const creator = accounts[0];
    const name = 'FUNTOKEN';
    const ticker = 'FUNT';
    const totalSupply = new BigNumber(1234567);
    const decimals = 8;
    const type = 1;
    const lockupPeriod = expiryTime + 31557600; // one year plus
    const quorum = 75;

    await registrar.createNameSpace(nameSpaceName, owner, fee);
    await polyToken.approve(owner, registrar.address, fee);
    await registrar.createSecurityToken(
      nameSpaceName,
      creator,
      name,
      ticker,
      totalSupply,
      decimals,
      owner,
      type,
      lockupPeriod,
      quorum,
    );

    const logNewSecurityToken = await logNewSecurityTokenArgsPromise;
    assert.equal(
      logNewSecurityToken._ticker,
      ticker,
      'Ticker wasnt found in event subscription',
    );
    assert.isAbove(
      logNewSecurityToken._securityTokenAddress.length,
      20,
      'Address wasnt found in event subscription',
    );
    assert.equal(
      logNewSecurityToken._owner,
      owner,
      'Owner wasnt found in event subscription',
    );
    assert.equal(
      logNewSecurityToken._nameSpace,
      nameSpaceName,
      'Name space does not found in the event subscription',
    );
    assert.equal(
      logNewSecurityToken._type,
      type,
      'Type wasnt found in event subscription',
    );

    // await registrar.changeNameSpace(
    //   'awesome poly',
    //   owner,
    //   new BigNumber(10).times(new BigNumber(10).pow(18)),
    // );

    // const logNameSpaceChange = logNameSpaceChangeArgsPromise;
    // assert.equal(
    //   logNameSpaceChange._nameSpace,
    //   nameSpaceName,
    //   'Name space name does not found in the event subscription',
    // );

    // assert.equal(
    //   logNameSpaceChange._owner,
    //   owner,
    //   'owner does not found in the event subscription',
    // );
    // logNameSpaceChange._newFee = logNameSpaceChange._newFee
    //   .dividedBy(new BigNumber(10).pow(18))
    //   .toNumber();
    // assert.equal(
    //   logNameSpaceChange._newFee,
    //   10,
    //   'owner does not found in the event subscription',
    // );

    // note: if unsubscribe does not work, the test in the terminal will be stuck running a process
    // and you can see the process is running by looking at testrpc and seeing 'eth_getFilterChanges' constantly repeated
    await registrar.unsubscribeAll();

    const logs = await registrar.getLogs(
      'LogNewSecurityToken',
      { owner: accounts[0] },
      { fromBlock: 1, toBlock: 'latest' },
    );
    assert.equal(
      logs.length,
      1,
      'One log should appear in the array since we made 1 security tokens',
    );
    assert.equal(logs[0].args._ticker, ticker, 'Retrieved first Transfer log');
  });
});
