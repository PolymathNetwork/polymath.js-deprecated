import BigNumber from 'bignumber.js';
import chai from 'chai';
import ganache from 'ganache-cli';
import 'mocha';
import Web3 from 'web3';

import { makeWeb3 } from './util/web3';

import { Polymath } from '../src/index';

const assert = chai.assert;

describe('Polymath library', () => {
  const web3 = makeWeb3();
  let polymath;

  before(async () => {
    polymath = new Polymath(web3.currentProvider);
    await polymath.initializedPromise;
  });

  describe('Some category', () => {
    it('Some test', async () => {
      const accounts = await new Promise((resolve, reject) => {
        web3.eth.getAccounts((err, accounts) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(accounts);
        });
      });

      console.log('accounts', accounts);

      console.log('allowanceBefore', await polymath.polyToken.allowance(accounts[0], accounts[1]) + '');
      await polymath.polyToken.approve(accounts[1], 1234, { from: accounts[0] });
      console.log('final allowance:', await polymath.polyToken.allowance(accounts[0], accounts[1]) + '');

      const symbol = await polymath.polyToken.symbol();
      console.log('Symbol:', symbol);
      console.log('Balance of account 0:', await polymath.polyToken.balanceOf(accounts[0]) + '');

      console.log('polymath.securityTokenRegistrar', polymath.securityTokenRegistrar);
      console.log(await polymath.securityTokenRegistrar.polyCustomersAddress());
    });
  });
});
