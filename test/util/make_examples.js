// @flow

import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import {
  Compliance,
  Customers,
  PolyToken,
  SecurityToken,
  Template,
  SecurityTokenRegistrar,
} from '../../src/contract_wrappers';
import complianceArtifact from '../../src/artifacts/Compliance.json';
import customersArtifact from '../../src/artifacts/Customers.json';
import polyTokenArtifact from '../../src/artifacts/PolyTokenMock.json';
import securityTokenArtifact from '../../src/artifacts/SecurityToken.json';
import securityTokenRegistrarArtifact from '../../src/artifacts/SecurityTokenRegistrar.json';
import TemplateArtifact from '../../src/artifacts/Template.json';

export async function makePolyToken(web3Wrapper: Web3Wrapper, account: string) {
  const contractTemplate = contract(polyTokenArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new({ gas: 6000000, from: account });

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
    gas: 6000000,
    from: account,
  });

  const customers = new Customers(web3Wrapper, polyToken, instance.address);
  await customers.initialize();
  return customers;
}

export async function makeCompliance(
  web3Wrapper: Web3Wrapper,
  customers: Customers,
//  securityTokenRegistrar: SecurityTokenRegistrar,
  account: string,
) {
  const contractTemplate = contract(complianceArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new(customers.address, {
    from: account,
    gas: 6000000,
  });

 // const securityTokenRegistrar = SecurityTokenRegistrar;
  const compliance = new Compliance(web3Wrapper, customers, /*securityTokenRegistrar,*/ instance.address);
  await compliance.initialize();
  return compliance;
}

export async function makeSecurityToken(
  web3Wrapper: Web3Wrapper,
  polyToken: PolyToken,
  customers: Customers,
  compliance: Compliance,
  account: string,
) {
  const securityTokenTemplate = contract(securityTokenArtifact);
  securityTokenTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await securityTokenTemplate.new(
    'Token Name',
    'TONA',
    new BigNumber(1000),
    new BigNumber(10),
    account,
    new BigNumber(1000),
    new BigNumber(9888888),
    new BigNumber(20),
    polyToken.address,
    customers.address,
    compliance.address,
    {
      from: account,
      gas: 6000000,
    },
  );

  const securityToken = new SecurityToken(
    web3Wrapper,
    polyToken,
    customers,
    compliance,
    instance.address,
    { from: account },
  );
  await securityToken.initialize();
  return securityToken;
}

export const makeKYCProvider = async (
  polyToken: PolyToken,
  customers: Customers,
  ownerAddress: string,
  kycProviderAddress: string,
) => {
  await customers.newKYCProvider(
    kycProviderAddress,
    'Provider',
    '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    new BigNumber(100),
  );

};

export const makeLegalDelegate = async (
  polyToken: PolyToken,
  customers: Customers,
  kycProvider: string,
  legalDelegate: string,
) => {
  await polyToken.approve(legalDelegate, customers.address, 100);
  await customers.verifyCustomer(
    kycProvider,
    legalDelegate,
    'US',
    'CA',
    'delegate',
    true,
    new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
  );
};

export const makeTemplate = async (
  compliance: Compliance,
  kycProvider: string,
  legalDelegate: string,
): Promise<string> => {
  const templateAddress = await compliance.createTemplate(
    legalDelegate,
    'offeringtype',
    'US-CA',
    false,
    kycProvider,
    '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
    new BigNumber(1000),
    new BigNumber(10),
    new BigNumber(9888888),
  );

  const template = new Template(compliance._web3Wrapper, templateAddress);
  await template.initialize();

  await template.addJurisdiction(legalDelegate, ['US-CA'], [true]);
  await template.addRoles(legalDelegate, ['investor'], [true]);

  return templateAddress;
};

export const makeTemplateWithFinalized = async (
  compliance: Compliance,
  kycProvider: string,
  legalDelegate: string,
): Promise<string> => {
  const templateAddress = await compliance.createTemplate(
    legalDelegate,
    'offeringtype',
    'US-CA',
    false,
    kycProvider,
    '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    new BigNumber(Math.floor(new Date().getTime() / 1000)).plus(100),
    new BigNumber(1000),
    new BigNumber(10),
    new BigNumber(9888888),
  );

  const template = new Template(compliance._web3Wrapper, templateAddress);
  await template.initialize();

  await template.addJurisdiction(legalDelegate, ['US-CA'], [true]);
  await template.addRoles(legalDelegate, ['investor'], [true]);
  await template.finalizeTemplate(legalDelegate);

  return templateAddress;
};

export async function makeTemplateDirectCall(
  web3Wrapper: Web3Wrapper,
  owner: string,
  offeringType: string,
  issuerJurisdiction: string,
  accredited: boolean,
  KYC: string,
  details: string,
  expires: number,
  fee: number,
  quorum: number,
  vestingPeriod: number,
) {
  const contractTemplate = contract(TemplateArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new(
    owner,
    offeringType,
    issuerJurisdiction,
    accredited,
    KYC,
    details,
    expires,
    fee,
    quorum,
    vestingPeriod,
    {
      gas: 4700000,
      from: owner,
    },
  );
  const template = new Template(web3Wrapper, instance.address);

  await template.initialize();
  return template;
}

export async function makeSecurityTokenRegistrar(
  web3Wrapper: Web3Wrapper,
  polyToken: PolyToken,
  customers: Customers,
  compliance: Compliance,
  securityToken: SecurityToken,
  account: string,
) {
  const contractTemplate = contract(securityTokenRegistrarArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());

  const instance = await contractTemplate.new(
    polyToken.address,
    customers.address,
    compliance.address,
    {
      gas: 15000000,
      from: account,
    },
  );
  const registrar = new SecurityTokenRegistrar(web3Wrapper, securityToken, compliance, instance.address);

  await registrar.initialize();
  return registrar;
}

export async function makeSecurityTokenThroughRegistrar(
  web3Wrapper: Web3Wrapper,
  polyToken: PolyToken,
  customers: Customers,
  compliance: Compliance,
  securityToken: SecurityToken,
  account: string,
  hostAccount: string,
) {
  const contractTemplate = contract(securityTokenRegistrarArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());

  const instance = await contractTemplate.new(
    polyToken.address,
    customers.address,
    compliance.address,
    {
      gas: 15000000,
      from: account,
    },
  );
  const registrar = new SecurityTokenRegistrar(web3Wrapper, securityToken, compliance, instance.address);

  await registrar.initialize();

  //start creating security token
  const creator = account
  const name = 'FUNTOKEN';
  const ticker = 'FUNT';
  const totalSupply = 1234567;
  const decimals = 8;
  const owner = account
  const host = hostAccount
  const fee = 1000;
  const type = 1;
  const maxPoly = 100000;
  const lockupPeriod = 1516397507 + 31557600; // one year from jan 19 2017
  const quorum = 75;

  // Fund two accounts.
  await polyToken.generateNewTokens(
    new BigNumber(10).toPower(18).times(100000),
    account,
  );
  await polyToken.generateNewTokens(
    new BigNumber(10).toPower(18).times(100000),
    hostAccount,
  );

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

  const logs = await registrar.getLogs(
    'LogNewSecurityToken',
    {},
    { fromBlock: 1 },
  );
  let tickerLog =   logs[0].args.ticker;
  let securityTokenAddress = await registrar.getSecurityTokenAddress(ticker);

  const securityTokenThroughRegistrar = new SecurityToken(
    web3Wrapper,
    polyToken,
    customers,
    compliance,
    securityTokenAddress,
    { from: account },
  );

  await securityTokenThroughRegistrar.initialize();
  return securityTokenThroughRegistrar;
}
