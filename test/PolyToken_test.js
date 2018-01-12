import BigNumber from 'bignumber.js';
import chai from 'chai';
import 'mocha';

import { makePolyToken } from './util/make_examples';
import { makeWeb3Wrapper } from './util/web3';

const { assert } = chai;

describe('PolyToken wrapper', () => {
  const web3Wrapper = makeWeb3Wrapper();

  let accounts;
  let polyToken;

  before(async () => {
    accounts = await web3Wrapper.getAvailableAddressesAsync();
  });

  beforeEach(async () => {
    polyToken = await makePolyToken(web3Wrapper, accounts[0]);
  });

  it('getTotalSupply', async () => {
    const totalSupply = await polyToken.getTotalSupply();
    assert.equal(
      totalSupply.constructor.name,
      'BigNumber',
      'totalSupply is BigNumber',
    );
    assert(totalSupply.greaterThan(0), 'totalSupply nonzero');
  });

  it('getDecimals', async () => {
    const decimals = await polyToken.getDecimals();
    assert.typeOf(decimals, 'number', 'decimals is number');
    assert(decimals > 0, 'decimals nonzero');
  });

  it('getSymbol', async () => {
    const symbol = await polyToken.getSymbol();
    assert.notEqual(symbol, '', 'Symbol nonempty');
  });

  it('generateNewTokens, getBalanceOf', async () => {
    await polyToken.generateNewTokens(new BigNumber(50), accounts[1]);
    assert(
      (await polyToken.getBalanceOf(accounts[1])).equals(50),
      'getBalanceOf',
    );
  });

  describe('With a balance on accounts[0]', () => {
    beforeEach(async () => {
      await polyToken.generateNewTokens(new BigNumber(321), accounts[0]);
    });

    it('transfer, subscribe, getLogs', async () => {
      let subscriptionID = null;
      const transferArgsPromise = new Promise((resolve, reject) => {
        subscriptionID = polyToken.subscribe('Transfer', null, (err, log) => {
          if (err !== null) {
            reject(err);
            return;
          }

          resolve(log.args);
        });
      });

      await polyToken.transfer(accounts[0], accounts[1], new BigNumber(5));
      assert((await polyToken.getBalanceOf(accounts[1])).equals(5));

      const transferArgs = await transferArgsPromise;
      assert.equal(transferArgs._from, accounts[0], 'Transfer _from address');
      assert.equal(transferArgs._to, accounts[1], 'Transfer _to address');
      assert(transferArgs._value.equals(5), 'Transfer _value');
      await polyToken.unsubscribe(subscriptionID);

      await polyToken.transfer(accounts[0], accounts[2], new BigNumber(10));

      const logs = await polyToken.getLogs(
        'Transfer',
        { _to: accounts[1] },
        { fromBlock: 1, toBlock: 'latest' },
      );
      assert.equal(logs.length, 1, 'One log');
      assert(logs[0].args._value.equals(5), 'Retrieved first Transfer log');
    });

    it('approve, allowance, transferFrom', async () => {
      await polyToken.approve(accounts[0], accounts[1], new BigNumber(10));
      assert(
        (await polyToken.getAllowance(accounts[0], accounts[1])).equals(10),
        'allowance',
      );

      await polyToken.transferFrom(
        accounts[0],
        accounts[2],
        accounts[1],
        new BigNumber(10),
      );
      assert(
        (await polyToken.getBalanceOf(accounts[2])).equals(10),
        'balance after transferFrom',
      );
    });
  });
});
