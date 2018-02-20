// @flow

import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { makeWeb3 } from './web3';

import {
  Compliance,
  Customers,
  PolyToken,
  SecurityToken,
  Template,
  SecurityTokenRegistrar,
  SimpleCappedOfferingFactory,
  SimpleCappedOffering,
} from '../../src/contract_wrappers';
import complianceArtifact from '../../src/artifacts/Compliance.json';
import customersArtifact from '../../src/artifacts/Customers.json';
import polyTokenArtifact from '../../src/artifacts/PolyTokenMock.json';
import securityTokenArtifact from '../../src/artifacts/SecurityToken.json';
import securityTokenRegistrarArtifact from '../../src/artifacts/SecurityTokenRegistrar.json';
import TemplateArtifact from '../../src/artifacts/Template.json';
import securityTokenOfferingArtifact from '../../src/artifacts/SimpleCappedOffering.json';
import simpleCappedOfferingFactoryArtifact from '../../src/artifacts/SimpleCappedOfferingFactory.json';
import { web3StringToBytes32, signData } from './signdata';

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
  account: string,
) {
  const contractTemplate = contract(complianceArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await contractTemplate.new(customers.address, {
    from: account,
    gas: 6000000,
  });

  const compliance = new Compliance(web3Wrapper, instance.address);
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
    new BigNumber(18),
    account,
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

  const securityToken = new SecurityToken(web3Wrapper, instance.address);
  await securityToken.initialize();
  return securityToken;
}

export const makeKYCProvider = async (
  customers: Customers,
  kycProviderAddress: string,
) => {
  await customers.newKYCProvider(
    kycProviderAddress,
    'Provider',
    '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    new BigNumber(100).times(new BigNumber(10).pow(18)),
  );
};
// <--- NEED CHANGES ADD SIGN KEY CONCEPT --->
export const makeLegalDelegate = async (
  polyToken: PolyToken,
  customers: Customers,
  kycProvider: string,
  legalDelegate: string,
  expiryTime: BigNumber,
  pk_delegate: string,
) => {
  await polyToken.approve(
    legalDelegate,
    customers.address,
    new BigNumber(100).times(new BigNumber(10).pow(18)),
  );
  const nonce = 1;
  const jurisdiction0 = 'US';
  const jurisdiction0_0 = 'CA';
  const customerDelegateRole = 2;
  const sig = signData(
    customers.address,
    kycProvider,
    jurisdiction0,
    jurisdiction0_0,
    customerDelegateRole,
    true,
    nonce,
    pk_delegate,
  );

  const r = `0x${sig.r.toString('hex')}`;
  const s = `0x${sig.s.toString('hex')}`;
  const v = sig.v;

  const isVerify = await customers.verifyCustomer(
    kycProvider,
    legalDelegate,
    jurisdiction0,
    jurisdiction0_0,
    customerDelegateRole,
    true,
    expiryTime, // 2 days more than current time
    nonce,
    v,
    r,
    s,
    {
      from: kycProvider,
    },
  );
};

export const makeCustomer = async (
  polyToken: PolyToken,
  customers: Customers,
  kycProvider: string,
  customerAddress: string,
  customerRole: number,
  expiryTime: BigNumber,
  pk_customer: string,
) => {
  await polyToken.approve(
    customerAddress,
    customers.address,
    new BigNumber(100).times(new BigNumber(10).pow(18)),
  );
  const nonce = 1;
  const jurisdiction0 = 'US';
  const jurisdiction0_0 = 'CA';
  const sig = signData(
    customers.address,
    kycProvider,
    jurisdiction0,
    jurisdiction0_0,
    customerRole,
    true,
    nonce,
    pk_customer,
  );
  const r = `0x${sig.r.toString('hex')}`;
  const s = `0x${sig.s.toString('hex')}`;
  const v = sig.v;

  await customers.verifyCustomer(
    kycProvider,
    customerAddress,
    jurisdiction0,
    jurisdiction0_0,
    customerRole,
    true,
    expiryTime, // 2 days more than current time
    nonce,
    v,
    r,
    s,
    {
      from: kycProvider,
    },
  );
};

export const makeTemplate = async (
  compliance: Compliance,
  kycProvider: string,
  legalDelegate: string,
  expiryTime: BigNumber
): Promise<string> => {
  const template = await compliance.createTemplate(
    legalDelegate,
    'offeringtype',
    'US-CA',
    false,
    kycProvider,
    '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    expiryTime,
    new BigNumber(1000).times(new BigNumber(10).pow(18)),
    new BigNumber(10),
    new BigNumber(9888888),
  );

  await template.addJurisdiction(legalDelegate, ['US-CA'], [true]);
  await template.addRoles(legalDelegate, ['investor'], [true]);
  return template;
};

export const makeTemplateWithFinalized = async (
  compliance: Compliance,
  kycProvider: string,
  legalDelegate: string,
  expiryTime: BigNumber,
): Promise<Template> => {
  const template = await compliance.createTemplate(
    legalDelegate,
    'offeringtype',
    'US-CA',
    false,
    kycProvider,
    '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    expiryTime,
    new BigNumber(1000).times(new BigNumber(10).pow(18)),
    new BigNumber(10),
    new BigNumber(9888888),
  );

  await template.addJurisdiction(legalDelegate, ['US-CA'], [true]);
  await template.addRoles(legalDelegate, ['investor'], [true]);
  await template.finalizeTemplate(legalDelegate);

  return template;
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
    expires + 15067386,
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
  const registrar = new SecurityTokenRegistrar(web3Wrapper, instance.address);

  await registrar.initialize();
  return registrar;
}

export async function makeProposedOfferingFactory(
  web3Wrapper: Web3Wrapper,
  securityToken: SecurityToken,
  compliance: Compliance,
  auditor: string,
) {
  const offeringFactoryTemplate = contract(simpleCappedOfferingFactoryArtifact);
  offeringFactoryTemplate.setProvider(web3Wrapper.getCurrentProvider());
  const instance = await offeringFactoryTemplate.new({
    gas: 15000000,
    from: auditor,
  });

  const offeringFactory = new SimpleCappedOfferingFactory(
    web3Wrapper,
    instance.address,
  );

  await offeringFactory.initialize();

  await compliance.registerOfferingFactory(offeringFactory.address, auditor);
  await compliance.proposeOfferingFactoryToSecurityToken(
    auditor,
    securityToken.address,
    offeringFactory.address,
  );
  return offeringFactory;
}

export async function makeSecurityTokenThroughRegistrar(
  web3Wrapper: Web3Wrapper,
  polyToken: PolyToken,
  customers: Customers,
  compliance: Compliance,
  creatorAccount: string,
  currentBlockTime: number,
  nameSpaceOwnerAccount: string,
) {
  const contractTemplate = contract(securityTokenRegistrarArtifact);
  contractTemplate.setProvider(web3Wrapper.getCurrentProvider());

  const instance = await contractTemplate.new(
    polyToken.address,
    customers.address,
    compliance.address,
    {
      gas: 15000000,
      from: creatorAccount,
    },
  );
  const registrar = new SecurityTokenRegistrar(web3Wrapper, instance.address);

  await registrar.initialize();
  const nameSpaceName = 'TESTING';
  const nameSpaceOwner = nameSpaceOwnerAccount;
  const nameSpaceFee = new BigNumber(10).times(new BigNumber(10).pow(18));
  // Start creating security token
  const creator = creatorAccount;
  const name = 'FUNTOKEN';
  const ticker = 'FUNT';
  const totalSupply = 1234567;
  const decimals = 8;
  const owner = creatorAccount;
  const type = 1;
  const lockupPeriod = currentBlockTime + 31557600; // plus one year
  const quorum = 75;

  // Fund two accounts.
  await polyToken.generateNewTokens(
    new BigNumber(10000).times(new BigNumber(10).pow(18)),
    creator,
  );
  await registrar.createNameSpace(nameSpaceName, nameSpaceOwner, nameSpaceFee);
  await polyToken.approve(creator, registrar.address, nameSpaceFee);
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

  const logs = await registrar.getLogs(
    'LogNewSecurityToken',
    {},
    { fromBlock: 1 },
  );
  const tickerLog = logs[0].args._ticker;
  const securityTokenAddress = await registrar.getSecurityTokenAddress(
    nameSpaceName,
    ticker,
  );
  const securityTokenThroughRegistrar = new SecurityToken(
    web3Wrapper,
    securityTokenAddress,
  );

  await securityTokenThroughRegistrar.initialize();
  return [securityTokenThroughRegistrar, registrar];
}

export async function makeSelectedTemplateForSecurityToken(
  securityToken: SecurityToken,
  compliance: Compliance,
  polyToken: PolyToken,
  owner: string,
  legalDelegate: string,
  kycProvider: string,
  fakeBytes32: string,
  templateAddress: string,
) {

  await compliance.proposeTemplate(
    legalDelegate,
    securityToken.address,
    templateAddress,
  );

  // Security token must have the template's fee before applying the template.
  await polyToken.transfer(
    kycProvider,
    securityToken.address,
    new BigNumber(10).toPower(18).times(1000),
  );

  await securityToken.selectTemplate(owner, 0);

  await securityToken.updateComplianceProof(owner, fakeBytes32, fakeBytes32);
}

export async function makeSecurityTokenOffering(
  web3Wrapper: Web3Wrapper,
  securityToken: SecurityToken,
  offeringAddress: string,

) {

  const offering = new SimpleCappedOffering(web3Wrapper, securityToken, offeringAddress);
  await offering.initialize();
  return offering;
}
