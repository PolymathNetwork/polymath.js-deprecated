// @flow

import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import ContractWrapper from './ContractWrapper';
import Customers from './Customers';
import complianceArtifact from '../artifacts/Compliance.json';
import type {
  BlockRange,
  ComplianceEventArgs,
  EventCallback,
  IndexedFilterValues,
  Log,
  STOProposal,
} from '../types';

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

  /**
   * Subscribes to events emitted by the contract.
   * @param   eventName           The name of the event to subscribe to
   * @param   indexedFilterValues Event argument values with which to filter logs
   * @param   callback            Callback to receive event logs
   * @return  An identifier used to unsubscribe
   */
  subscribe(
    eventName:
      | 'LogTemplateCreated'
      | 'LogNewTemplateProposal'
      | 'LogNewContractProposal',
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<ComplianceEventArgs>,
  ): string {
    return super._subscribe(eventName, indexedFilterValues, callback);
  }

  /**
   * Retrieves events emitted by this contract in an arbitrary block range.
   * @param   eventName           The name of the event to look for
   * @param   indexedFilterValues Event argument values with which to filter logs
   * @param   blockRange          A range of blocks to look in. By default starts and ends at 'latest' block.
   * @return  An array of logs
   */
  async getLogs(
    eventName:
      | 'LogTemplateCreated'
      | 'LogNewTemplateProposal'
      | 'LogNewContractProposal',
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<ComplianceEventArgs>>> {
    return super._getLogs(eventName, indexedFilterValues, blockRange);
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

  async cancelTemplateProposal(
    proposalMakerAddress: string,
    securityTokenAddress: string,
    proposalIndex: number,
  ) {
    await this._contract.cancelTemplateProposal(
      securityTokenAddress,
      proposalIndex,
      { from: proposalMakerAddress },
    );
  }

  async setSTO(
    issuerAddress: string,
    stoAddress: string,
    fee: BigNumber,
    vestingPeriod: BigNumber,
    quorum: BigNumber,
  ) {
    await this._contract.setSTO(stoAddress, fee, vestingPeriod, quorum, {
      from: issuerAddress,
      gas: 200000,
    });
  }

  async proposeSTO(
    stoCreatorAddress: string,
    securityTokenAddress: string,
    stoContractAddress: string,
  ) {
    await this._contract.proposeOfferingContract(
      securityTokenAddress,
      stoContractAddress,
      { from: stoCreatorAddress },
    );
  }

  async cancelSTOProposal(
    proposalMakerAddress: string,
    securityTokenAddress: string,
    proposalIndex: number,
  ) {
    await this._contract.cancelOfferingProposal(
      securityTokenAddress,
      proposalIndex,
      { from: proposalMakerAddress },
    );
  }

  async getTemplateAddressByProposal(
    securityTokenAddress: string,
    proposalIndex: number,
  ): Promise<string> {
    return this._contract.templateProposals.call(
      securityTokenAddress,
      proposalIndex,
    );
  }

  async getSTOProposal(
    securityTokenAddress: string,
    proposalIndex: string,
  ): Promise<STOProposal> {
    const proposal = await this._contract.getOfferingByProposal(
      securityTokenAddress,
      proposalIndex,
    );

    return {
      stoContractAddress: proposal[0],
      auditorAddress: proposal[1],
      vestingPeriod: proposal[2],
      quorum: proposal[3],
      fee: proposal[4],
    };
  }
}
