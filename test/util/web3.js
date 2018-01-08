import Web3 from 'web3';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

export function makeWeb3() {
  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  return new Web3(provider);
}


export function makeWeb3Wrapper() {
  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  return new Web3Wrapper(provider);
}
