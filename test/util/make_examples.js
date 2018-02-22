// @flow

import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';
import Web3 from 'web3';

import {
  Compliance,
  Customers,
  PolyToken,
  SecurityToken,
  Template,
  SecurityTokenRegistrar,
  STOContract,
} from '../../src/contract_wrappers';
import complianceArtifact from '../../src/artifacts/Compliance.json';
import customersArtifact from '../../src/artifacts/Customers.json';
import polyTokenArtifact from '../../src/artifacts/PolyTokenMock.json';
import securityTokenArtifact from '../../src/artifacts/SecurityToken.json';
import securityTokenRegistrarArtifact from '../../src/artifacts/SecurityTokenRegistrar.json';
import TemplateArtifact from '../../src/artifacts/Template.json';
import securityTokenOfferingArtifact from '../../src/artifacts/STOContract.json';

export async function makePolyToken(web3: Web3, account: string) {
  const contractTemplate = contract(polyTokenArtifact);
  contractTemplate.setProvider(web3.currentProvider);
  const instance = await contractTemplate.new({ gas: 6000000, from: account });

  const polyToken = new PolyToken(web3, instance.address);
  await polyToken.initialize();
  return polyToken;
}

export async function makeCustomers(
  web3: Web3,
  polyToken: PolyToken,
  account: string,
) {
  const contractTemplate = contract(customersArtifact);
  contractTemplate.setProvider(web3.currentProvider);
  const instance = await contractTemplate.new(polyToken.address, {
    gas: 6000000,
    from: account,
  });

  const customers = new Customers(web3, polyToken, instance.address);
  await customers.initialize();
  return customers;
}

export async function makeCompliance(
  web3: Web3,
  customers: Customers,
  account: string,
) {
  const contractTemplate = contract(complianceArtifact);
  contractTemplate.setProvider(web3.currentProvider);
  const instance = await contractTemplate.new(customers.address, {
    from: account,
    gas: 6000000,
  });

  const compliance = new Compliance(web3, instance.address);
  await compliance.initialize();
  return compliance;
}

export async function makeSecurityToken(
  web3: Web3,
  polyToken: PolyToken,
  customers: Customers,
  compliance: Compliance,
  account: string,
) {
  const securityTokenTemplate = contract(securityTokenArtifact);
  securityTokenTemplate.setProvider(web3.currentProvider);
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
    web3,
    instance.address,
  );
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
    new BigNumber(100),
  );

};

export const makeLegalDelegate = async (
  polyToken: PolyToken,
  customers: Customers,
  kycProvider: string,
  legalDelegate: string,
  expiryTime: BigNumber,
) => {
  await polyToken.approve(legalDelegate, customers.address, 100);
  await customers.verifyCustomer(
    kycProvider,
    legalDelegate,
    'US',
    'CA',
    'delegate',
    true,
    expiryTime,
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
    new BigNumber(1000),
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
    new BigNumber(1000),
    new BigNumber(10),
    new BigNumber(9888888),
  );

  await template.addJurisdiction(legalDelegate, ['US-CA'], [true]);
  await template.addRoles(legalDelegate, ['investor'], [true]);
  await template.finalizeTemplate(legalDelegate);

  return template;
};

export async function makeTemplateDirectCall(
  web3: Web3,
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
  contractTemplate.setProvider(web3.currentProvider);
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
  const template = new Template(web3, instance.address);

  await template.initialize();
  return template;
}

export async function makeSecurityTokenRegistrar(
  web3: Web3,
  polyToken: PolyToken,
  customers: Customers,
  compliance: Compliance,
  account: string,
) {
  const contractTemplate = contract(securityTokenRegistrarArtifact);
  contractTemplate.setProvider(web3.currentProvider);

  const instance = await contractTemplate.new(
    polyToken.address,
    customers.address,
    compliance.address,
    {
      gas: 15000000,
      from: account,
    },
  );
  const registrar = new SecurityTokenRegistrar(web3, instance.address);

  await registrar.initialize();
  return registrar;
}

export async function makeSecurityTokenOffering(
  web3: Web3,
  polyToken: PolyToken,
  securityToken: SecurityToken,
  compliance: Compliance,
  auditor: string,
  startTime: BigNumber,
  endTime: BigNumber,

) {
  const contractTemplate = contract(securityTokenOfferingArtifact);
  contractTemplate.setProvider(web3.currentProvider);
  const instance = await contractTemplate.new(polyToken.address,
  {
    gas: 15000000,
    from: auditor,
  },
  );

  const offering = new STOContract(
    web3,
    polyToken,
    auditor,
    instance.address,
  );

  await offering.initialize();

  const fee = new BigNumber(10).toPower(18).times(100);
  const vestingPeriod = new BigNumber(8888888);
  const quorum = new BigNumber(10);

  await offering.securityTokenOffering(
    auditor,
    securityToken.address,
    startTime,
    endTime,
  );

  await compliance.setSTO(
    auditor,
    offering.address,
    fee,
    vestingPeriod,
    quorum,
  );

  await compliance.proposeSTO(auditor, securityToken.address, offering.address);
  return offering;
}

export async function makeSecurityTokenThroughRegistrar(
  web3: Web3,
  polyToken: PolyToken,
  customers: Customers,
  compliance: Compliance,
  account: string,
  hostAccount: string,
  currentBlockTime: number,
) {
  const contractTemplate = contract(securityTokenRegistrarArtifact);
  contractTemplate.setProvider(web3.currentProvider);

  const instance = await contractTemplate.new(
    polyToken.address,
    customers.address,
    compliance.address,
    {
      gas: 15000000,
      from: account,
    },
  );
  const registrar = new SecurityTokenRegistrar(web3, instance.address);

  await registrar.initialize();

  // Start creating security token
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
  const lockupPeriod = currentBlockTime + 31557600; // plus one year
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
    web3,
    securityTokenAddress,
  );

  await securityTokenThroughRegistrar.initialize();
  return securityTokenThroughRegistrar;
}

export async function makeSelectedTemplateForSecurityToken (
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
