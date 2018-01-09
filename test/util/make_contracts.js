import contract from 'truffle-contract';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import { Customers, PolyToken } from '../../src';
import CustomersArtifact from '../../src/artifacts/Customers.json';
import PolyTokenArtifact from '../../src/artifacts/PolyToken.json';

export async function makePolyToken(web3Wrapper: Web3Wrapper, account: string) {
  const contractTemplate = contract(PolyTokenArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new({ gas: 2000000, from: account });

  const polyToken = new PolyToken(web3Wrapper, instance.address);
  await polyToken.initialize();
  return polyToken;
}

export async function makeCustomers(web3Wrapper: Web3Wrapper, account: string) {
  const polyToken = await makePolyToken(web3Wrapper, account);

  const contractTemplate = contract(CustomersArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new(polyToken.address, {
    gas: 2000000,
    from: account,
  });

  const customers = new Customers(web3Wrapper, polyToken, instance.address);
  await customers.initialize();
  return customers;
}
