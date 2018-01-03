import Web3 from 'Web3';

export function makeWeb3() {
  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  return new Web3(provider);
}
