import chai from 'chai';
import ganache from 'ganache-cli';
import 'mocha';
import Web3 from 'web3';

import { Polymath } from '../src/index';

const assert = chai.assert;

describe('Polymath library', () => {
  describe('', () => {
    it('', async () => {
      const provider = ganache.provider({
        network_id: 50
      });

      const web3 = new Web3(provider);

      const polymath = new Polymath(provider);

      await polymath.initializedPromise;

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

      console.log(await polymath.polyToken.approve(accounts[1], 1234, { from: accounts[0] }));
      console.log('Approved amount for some reason 0:', await polymath.polyToken.allowance(accounts[0], accounts[1]) + '');

      console.log('Symbol for some reason doesn\'t show up:', await polymath.polyToken.symbol.call());
      console.log('Balance of account 0:', await polymath.polyToken.balanceOf(accounts[0]) + '');
    });
  });
});
