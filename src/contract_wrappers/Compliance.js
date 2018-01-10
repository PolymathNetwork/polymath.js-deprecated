// @flow

import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import ContractWrapper from './ContractWrapper';
import Customers from './Customers';
import complianceArtifact from '../artifacts/Compliance.json';

/**
 * Wrapper for the Compliance Solidity contract
 */
export default class Compliance extends ContractWrapper {
  customers: Customers;

  /**
   * @hideconstructor
   */
  constructor(
    web3Wrapper: Web3Wrapper,
    customers: Customers,
    deployedAddress?: string,
  ) {
    super(web3Wrapper, complianceArtifact, deployedAddress);

    this.customers = customers;
  }

  async createTemplate(
    legalDelegateAddress: string,
    offeringType: string,
    issuerJurisdiction: string,
    accredited: boolean,
    kycProviderAddress: string,
    details: string,
    expires: BigNumber,
    fee: BigNumber,
    quorum: BigNumber,
    vestingPeriod: BigNumber,
  ): Promise<string> {
    const receipt = await this._contract.createTemplate(
      offeringType,
      Web3.prototype.fromAscii(issuerJurisdiction),
      accredited,
      kycProviderAddress,
      details,
      expires,
      fee,
      quorum,
      vestingPeriod,
      {
        from: legalDelegateAddress,
        gas: 1000000,
      },
    );

    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];

      if (log.event === 'LogTemplateCreated') {
        return log.args._template;
      }
    }

    throw new Error('createTemplate should have emitted LogTemplateCreated.');
  }

  async proposeTemplate(
    legalDelegateAddress: string,
    securityTokenAddress: string,
    templateAddress: string,
  ) {
    await this._contract.proposeTemplate(
      securityTokenAddress,
      templateAddress,
      { from: legalDelegateAddress },
    );
  }
}
