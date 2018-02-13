// @flow

import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import ContractWrapper from './ContractWrapper';
import Template from './Template';
import complianceArtifact from '../artifacts/Compliance.json';
import type {
  BlockRange,
  ComplianceEventArgs,
  EventCallback,
  IndexedFilterValues,
  Log,
  STOProposal,
  TemplateReputation,
} from '../types';

/**
 * Wrapper for the Compliance Solidity contract
 */
export default class Compliance extends ContractWrapper {
  /**
   * @hideconstructor
   */
  constructor(
    web3Wrapper: Web3Wrapper,
    deployedAddress?: string,
  ) {
    super(web3Wrapper, complianceArtifact, deployedAddress);
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
      | 'LogCancelTemplateProposal'
      | 'LogNewContractProposal'
      | 'LogCancelContractProposal',
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

  /**
   * Creates a new Template smart contract on the blockchain
   * @param   legalDelegateAddress  Ethereum address of legal delegate creating the template
   * @param   offeringType          What type of security the template is being created for
   * @param   issuerJurisdiction    The jurisdiction ID the issuer resides in
   * @param   accredited            Indicates if accreditation is required to buy this security
   * @param   kycProviderAddress    Eth address of the KYC provider who will verify the investors
   * @param   details               Hashed details of the offering requirements
   * @param   expires               Timestamp of when the template will expire
   * @param   fee                   Amount of POLY to use the template (held in escrow until issuance)
   * @param   quorum                Minimum percent of shareholders which need to vote to freeze
   * @param   vestingPeriod         Length of time to vest funds
   * @return  The created template
   */
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
  ): Promise<Template> {
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
        gas: 4000000,
      },
    );
    const logs = receipt.logs.filter(log => log.event === 'LogTemplateCreated');

    if (logs.length === 0) {
      throw new Error('createTemplate couldn\'t find an event log.');
    }

    const address = logs[0].args._template;

    if (!address) {
      throw new Error('createTemplate couldn\'t get template address.');
    }

    return this.getTemplateFromAddress(address);
  }

  /**
   * Instantiates a template given its contract address.
   * @param  address The address of the template contract
   * @return The template instance
   */
  async getTemplateFromAddress(address: string): Promise<Template> {
    const template = new Template(this._web3Wrapper, address);
    await template.initialize();
    return template;
  }

  /**
   * Allows a legal delegate to propose a template to a security token.
   * @param   legalDelegateAddress  Ethereum address of legal delegate creating the template
   * @param   securityTokenAddress  Ethereum address of the security token the template is created for
   * @param   templateAddress       Ethereum address of the template being proposed
   */
  async proposeTemplate(
    legalDelegateAddress: string,
    securityTokenAddress: string,
    templateAddress: string,
  ) {
    await this._contract.proposeTemplate(
      securityTokenAddress,
      templateAddress,
      {
        gas: 1000000,
        from: legalDelegateAddress,
      },
    );
  }

  /**
   * Allows a legal delegate to cancle an already proposed template.
   * @param   proposalMakerAddress  Ethereum address of legal delegate who originally proposed the template
   * @param   securityTokenAddress  Ethereum address of the security token the template is created for
   * @param   proposalIndex         The offering proposal array index
   */
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

  /**
   * Set an STO contract to be stored in the offerings mapping in Compliance.sol
   * @param stoDeveloperAddress  Address of the creator of the STO
   * @param stoAddress     Address of the STO contract deployed over the network
   * @param fee            Fee to be paid in poly to use that contract
   * @param vestingPeriod  Number of days investor binded to hold the Security token
   * @param quorum         Minimum percent of shareholders which need to vote to freeze
   */
  async setSTO(
    stoDeveloperAddress: string,
    stoAddress: string,
    fee: BigNumber,
    vestingPeriod: BigNumber,
    quorum: BigNumber,
  ) {
    await this._contract.setSTO(stoAddress, fee, vestingPeriod, quorum, {
      from: stoDeveloperAddress,
      gas: 200000,
    });
  }

  /**
   * Propose a Security Token Offering Contract for an issuance
   * @param stoCreatorAddress     Address of the STO developer
   * @param securityTokenAddress  Address of the security token deployed over the network
   * @param stoContractAddress    Address of the STO contract deployed over the network
   */
  async proposeSTO(
    stoCreatorAddress: string,
    securityTokenAddress: string,
    stoContractAddress: string,
  ) {
    await this._contract.proposeOfferingContract(
      securityTokenAddress,
      stoContractAddress,
      {
        from: stoCreatorAddress,
        gas: 3000000,
      },
    );
  }

  /**
   * Allows an STO developer to cancle an already proposed STO.
   * @param   proposalMakerAddress  Ethereum address of STO developer who originally proposed the template
   * @param   securityTokenAddress  Ethereum address of the security token the template is created for
   * @param   offeringIndex         The STO proposal array index
   */
  async cancelSTOProposal(
    proposalMakerAddress: string,
    securityTokenAddress: string,
    offeringIndex: number,
  ) {
    await this._contract.cancelOfferingProposal(
      securityTokenAddress,
      offeringIndex,
      { from: proposalMakerAddress },
    );
  }

  /**
   * Get the template address for a security token by passing its proposal index.
   * @param   securityTokenAddress  Ethereum address of the security token the template is created for
   * @param   proposalIndex         The template proposal array index
   * @return  The template address
   */
  async getTemplateAddressByProposal(
    securityTokenAddress: string,
    proposalIndex: number,
  ): Promise<string> {
    return this._contract.getTemplateByProposal.call(
      securityTokenAddress,
      proposalIndex,
    );
  }

  /**
   * Get the STO address for a security token by passing its proposal index.
   * @param   securityTokenAddress  Ethereum address of the security token the STO is created for
   * @param   proposalIndex         The STO proposal array index
   * @return  The template address
   */
  async getSTOAddressByProposal(
    securityTokenAddress: string,
    proposalIndex: number,
  ): Promise<string> {
    return this._contract.offeringProposals.call(
      securityTokenAddress,
      proposalIndex,
    );
  }

  /**
   * Get an STO that has been proposed for a security token by passing its offering index.
   * @param   securityTokenAddress  Ethereum address of the security token the STO is created for
   * @param   offeringIndex         The STO proposal array index
   * @return  The type {@link Offering}.
   */
  async getSTOProposal(
    securityTokenAddress: string,
    offeringIndex: string,
  ): Promise<STOProposal> {
    const proposal = await this._contract.getOfferingByProposal(
      securityTokenAddress,
      offeringIndex,
    );

    return {
      stoContractAddress: proposal[0],
      auditorAddress: proposal[1],
      vestingPeriod: proposal[2],
      quorum: proposal[3],
      fee: proposal[4],
    };
  }

  /**
   * Returns the minimum vesting period for POLY earned.
   * @return Minimum vesting period.
   */
  async getMinimumVestingPeriod(): Promise<BigNumber> {
    return (await this._contract.MINIMUM_VESTING_PERIOD.call()).toNumber();
  }

  /**
   * Get the Template reputation details.
   * @param   templateAddress  Ethereum address of the template on the EVM
   * @return  The type {@link TemplateReputation}.
   */
  async getTemplateReputation(
    templateAddress: string,
  ): Promise<TemplateReputation> {
    const template = await this._contract.templates.call(templateAddress);
    return {
      owner: template[0],
      totalRaised: template[1],
      timesUsed: template[2],
      expires: template[3],
    };
  }

  /**
   * Returns all Template proposals
   * @param   SecurityTokenAddress  Address of the Security Token
   * @return An array of addresses
   */
  async getAllTemplateProposals(
    securityTokenAddress: string,
  ): Promise<Array<string>> {
    return await this._contract.getAllTemplateProposals.call(
      securityTokenAddress,
    );
  }

  /**
   * Returns all STO proposal addresses
   * @param   SecurityTokenAddress  Address of the Security Token
   * @return An array of addresses
   */
  async getAllOfferingProposals(
    securityTokenAddress: string,
  ): Promise<Array<string>> {
    return await this._contract.getAllOfferingProposals.call(
      securityTokenAddress,
    );
  }
}
