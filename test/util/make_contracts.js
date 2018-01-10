import contract from 'truffle-contract';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import { Compliance, Customers, PolyToken } from '../../src';
import complianceArtifact from '../../src/artifacts/Compliance.json';
import customersArtifact from '../../src/artifacts/Customers.json';
import polyTokenArtifact from '../../src/artifacts/PolyToken.json';

export async function makePolyToken(web3Wrapper: Web3Wrapper, account: string) {
  const contractTemplate = contract(polyTokenArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new({ gas: 2000000, from: account });

  const polyToken = new PolyToken(web3Wrapper, instance.address);
  await polyToken.initialize();
  return polyToken;
}

export async function makeCustomers(
  web3Wrapper: Web3Wrapper,
  polyToken: PolyToken,
  account: string,
) {
  const contractTemplate = contract(customersArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new(polyToken.address, {
    gas: 2000000,
    from: account,
  });

  const customers = new Customers(web3Wrapper, polyToken, instance.address);
  await customers.initialize();
  return customers;
}

export async function makeCompliance(
  web3Wrapper: Web3Wrapper,
  customers: Customers,
  account: string,
) {
  const contractTemplate = contract(complianceArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new(customers.address, {
    from: account,
    gas: 4000000,
  });

  const compliance = new Compliance(web3Wrapper, customers, instance.address);
  await compliance.initialize();
  return compliance;
}
