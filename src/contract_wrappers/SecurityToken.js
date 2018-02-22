// @flow

import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import ContractWrapper from './ContractWrapper';
import Compliance from './Compliance';
import Customers from './Customers';
import PolyToken from './PolyToken';

import securityTokenArtifact from '../artifacts/SecurityToken.json';
import bytes32Zero from '../bytes32Zero';
import { numberToRole } from '../roles';
import type {
  BlockRange,
  EventCallback,
  IndexedFilterValues,
  Log,
  SecurityTokenEventArgs,
  TokenDetails,
  PolyAllocation,
  Shareholder,
} from '../types';

export type LogNewWhitelistedAddress = {
  _KYC: string,
  _shareholder: string,
  _role: BigNumber,
};

/**
 * Wrapper for the SecurityToken Solidity contract
 */
export default class SecurityToken extends ContractWrapper {
  /**
   * @hideconstructor
   */
  constructor(
    web3: Web3,
    deployedAddress: string,
  ) {
    super(web3, securityTokenArtifact, deployedAddress);
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
      | 'LogTemplateSet'
      | 'LogUpdatedComplianceProof'
      | 'LogSetSTOContract'
      | 'LogNewWhitelistedAddress'
      | 'LogNewBlacklistedAddress'
      | 'LogVoteToFreeze'
      | 'LogTokenIssued',
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<SecurityTokenEventArgs>,
  ): string {
    const wrappedCallback = callback;

    // Temporary comment out, dont know if we need
    // if (eventName === 'LogNewWhitelistedAddress') {
    //   // Convert from number roles to string enum roles.
    //   wrappedCallback = (args: any) => {
    //     const role = numberToRole(args._role.toNumber());

    //     if (role === null) {
    //       return;
    //     }

    //     callback({
    //       ...args,
    //       _role: role,
    //     });
    //   };
    // }

    return super._subscribe(eventName, indexedFilterValues, wrappedCallback);
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
      | 'LogTemplateSet'
      | 'LogUpdatedComplianceProof'
      | 'LogSetSTOContract'
      | 'LogNewWhitelistedAddress'
      | 'LogVoteToFreeze'
      | 'LogTokenIssued',
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<SecurityTokenEventArgs>>> {
    if (eventName === 'LogNewWhitelistedAddress') {
      // Convert from number roles to string enum roles.
      const logs: Array<Log<LogNewWhitelistedAddress>> = await super._getLogs(
        eventName,
        indexedFilterValues,
        blockRange,
      );
      const processedLogs = [];

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const { args } = log;
        const role = numberToRole(args._role.toNumber());

        if (role === null) {
          continue;
        }

        processedLogs.push({
          ...log,
          args: {
            ...args,
            _role: role,
          },
        });
      }

      return processedLogs;
    }

    return super._getLogs(eventName, indexedFilterValues, blockRange);
  }

  /**
   * Gets the name of the security token.
   * @return Name of security token
   */
  async getName(): Promise<string> {
    return this._contract.name.call();
  }

  /**
   * Gets the security token ticker symbol.
   * @return Ticker symbol
   */
  async getSymbol(): Promise<string> {
    return this._contract.symbol.call();
  }

  /**
   * Gets the address of the security token contract owner.
   * @return The token owner address
   */
  async getOwnerAddress(): Promise<string> {
    return this._contract.owner.call();
  }

  /**
   * Gets the total supply of tokens.
   * @return Total supply in base units
   */
  async getTotalSupply(): Promise<BigNumber> {
    return this._contract.totalSupply.call();
  }

  /**
   * Gets the delegate address if set.
   * @return If set, the delegate address. Otherwise null
   */
  async getDelegateAddress(): Promise<?string> {
    const address = await this._contract.delegate.call();
    return address !== bytes32Zero ? address : null;
  }

  /**
   * Gets the compliance proof hash.
   * @return Compliance proof hash
   */
  async getMerkleRoot(): Promise<string> {
    return this._contract.merkleRoot.call();
  }

  /**
   * Gets the KYC address if set.
   * @return If set, the KYC address. Otherwise null
   */
  async getKYCProviderAddress(): Promise<string> {
    return this._contract.KYC.call();
  }

  /**
   * Gets the STO contract address if set.
   * @return If set, the STO contract address. Otherwise null
   */
  async getSTOContractAddress(): Promise<string> {
    return this._contract.STO.call();
  }

  /**
   * Gets the Max Poly contribution allowed for the security token.
   * @return Max poly allowed.
   */
  async getMaximumPOLYContribution(): Promise<BigNumber> {
    return this._contract.maxPoly.call();
  }

  /**
   * Gets the STO start time as a unix timestamp.
   * @return The start time
   */
  async getSTOStart(): Promise<BigNumber> {
    return this._contract.startSTO.call();
  }

  /**
   * Gets the STO end time as a unix timestamp.
   * @return The end time
   */
  async getSTOEnd(): Promise<BigNumber> {
    return this._contract.endSTO.call();
  }

  /**
   * Gets the boolean value of the hasOfferingStarted.
   * @return The bool value
   */
  async getOfferingStatus(): Promise<string> {
    return this._contract.hasOfferingStarted.call();
  }

  /**
   * Update compliance proof hash for the issuance
   * @param ownerOrLegalDelegateAddress Owner or legal delegate address which have access to update the contract
   * @param newMerkleRoot               New merkle root hash of the compliance Proofs
   * @param merkleRoot                  Compliance Proof hash
   */
  async updateComplianceProof(
    ownerOrLegalDelegateAddress: string,
    newMerkleRoot: string,
    merkleRoot: string,
  ) {
    await this._contract.updateComplianceProof(newMerkleRoot, merkleRoot, {
      from: ownerOrLegalDelegateAddress,
    });
  }

  /**
   * Select a proposed template for the issuance
   * @param ownerAddress    Owner address who can select the template
   * @param templateIndex   Array index of the delegates proposed template
   */
  async selectTemplate(ownerAddress: string, templateIndex: number) {
    await this._contract.selectTemplate(templateIndex, {
      from: ownerAddress,
      gas: 300000,
    });
  }

  /**
   * Select an security token offering proposal for the issuance
   * @param delegateAddress           Delegate address of the choosen template
   * @param offeringProposalIndex     Array index of the STO proposal
   */
  async selectSTOProposal(delegateAddress: string, proposalIndex: number) {
    await this._contract.selectOfferingProposal(proposalIndex, {
      from: delegateAddress,
      gas: 5000000,
    });
  }

  /**
   * Start the Offering after the template and STO selection
   * @param owner Address of the Owner of a Security Token
   */
  async startSecurityTokenOffering(owner: string) {
    await this._contract.startOffering({
      from: owner,
      gas: 500000,
    });
  }

  /**
   * Add a verified address to the Security Token whitelist
   * @param owner                  Owner of the security token contract
   * @param investorAddress        Investor address to whitelist
   */
  async addToWhitelist(owner: string, investorAddress: string) {
    await this._contract.addToWhitelist(investorAddress, {
      from: owner,
      gas: 1000000,
    });
  }

  /**
   * Allow POLY allocations to be withdrawn by owner, delegate, and the STO auditor at appropriate times
   * @param address  User withdrawing their POLY
   */
  async withdrawPoly(address: string): Promise<boolean> {
    const receipt = await this._contract.withdrawPoly({ from: address });
    return receipt.logs.map(log => log.event).includes('Transfer');
  }

  /**
   * Voting to freeze the funds of the recipient address
   * @param shareHolderAddress   shareholder of the security token
   * @param recipientAddress  User who is getting voted agaisnt to freeze their POLY
   */
  async voteToFreeze(shareHolderAddress: string, recipientAddress: string) {
    await this._contract.voteToFreeze(recipientAddress, {
      from: shareHolderAddress,
      gas : 300000,
    });
  }

  /**
   * Get security token details
   * @return Return the template address, the delegate address, the compliance proof, the STO creator address and the KYC provider address
   */
  async getTokenDetails(): Promise<TokenDetails> {
    const details = await this._contract.getTokenDetails();

    return {
      templateAddress: details[0],
      delegateAddress: details[1],
      merkleRoot: details[2],
      STO: details[3],
      KYC: details[4],
    };
  }

  /**
   * Gets the account balance of `address`.
   * @param   address   The Ethereum address of the account
   * @return  Account balance
   */
  async getBalanceOf(address: string): BigNumber {
    return this._contract.balanceOf(address);
  }

  /**
   * Transfers `amount` security tokens from `fromAddress` to `toAddress`.
   * @param   fromAddress   The Ethereum address of the account to withdraw from
   * @param   toAddress     The Ethereum address of the account receiving tokens
   * @param   amount        The number of tokens to transfer
   */
  async transfer(fromAddress: string, toAddress: string, amount: BigNumber) {
    await this._contract.transfer(toAddress, amount, {
      from: fromAddress,
    });
  }

  /**
   * Approves `spenderAddress` to withdraw `amount` security tokens from `ownerAddress`.
   * @param   ownerAddress    The Ethereum address of the account setting the allowance
   * @param   spenderAddress  The Ethereum address of the account approved to withdraw the allowance
   * @param   amount          The number of tokens the spender will be able to withdraw
   */
  async approve(
    ownerAddress: string,
    spenderAddress: string,
    amount: Promise<BigNumber>,
  ) {
    // TODO: Validate ownerAddress is one of our accounts
    await this._contract.approve(spenderAddress, amount, {
      from: ownerAddress,
    });
  }

  /**
   * Gets the number of security tokens that `spenderAddress` is allowed to withdraw from `ownerAddress`.
   * @param   ownerAddress    The Ethereum address that may be withdrawn from
   * @param   spenderAddress  The Ethereum address that may spend the returned allowance
   * @return  Number of tokens to be withdrawn
   */
  async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
  ): Promise<BigNumber> {
    return this._contract.allowance.call(ownerAddress, spenderAddress);
  }

  /**
   * Transfers `amount` security tokens from `fromAddress` to `toAddress` using `spenderAddress`'s previously approved allowance.
   * @param   fromAddress     The Ethereum address from which the tokens are withdrawn
   * @param   toAddress       The Ethereum address receiving the tokens
   * @param   spenderAddress  The Ethereum address that was approved to withdraw tokens
   * @param   amount          The number of security tokens to transfer
   */
  async transferFrom(
    fromAddress: string,
    toAddress: string,
    spenderAddress: string,
    amount: BigNumber,
  ) {
    // TODO: Validate spenderAddress is one of our accounts
    await this._contract.transferFrom(fromAddress, toAddress, amount, {
      from: spenderAddress,
    });
  }

  /**
   * Amount of decimals the security token is divisable by.
   * @return The number of decimals
   */
  async getDecimals(): Promise<number> {
    return this._contract.decimals.call();
  }

  /**
   * Returns if the STO is propsed or not
   * @return Returns true if it has been proposed.
   */
  async isSTOProposed(): Promise<boolean> {
    return this._contract.isSTOProposed.call();
  }

  /**
   * Gets how many security tokens have been issued so far for the security token offering
   * @return The number of tokens issued.
   */
  async tokensIssuedBySTO(): Promise<BigNumber> {
    return this._contract.tokensIssuedBySTO.call();
  }

  /** Queries the shareholder details.
   *
   * @return Returns the type {@link Shareholder}
   */
  async getShareholderDetails(
    shareholderAddress: string,
  ): Promise<Shareholder> {
    return this._contract.shareholders.call(shareholderAddress);
  }

  /**
   * Queries the POLY allocation details, which cover the rules determining if the stakeholder will receive their POLY vesting.
   * @param polyStakeholderAddress The address of the stakeholder
   * @return Returns the type {@link PolyAllocation}
   */
  async getPolyAllocationDetails(
    polyStakeholderAddress: string,
  ): Promise<PolyAllocation> {
    return this._contract.allocations.call(polyStakeholderAddress);
  }

  /** Checks to see how much a shareholder has contributed to the Security token.
   * @param contributorAddress The address of the contributor
   * @return The amount the user has contributed contributed
   */
  async getContributedToSTO(contributorAddress: string): Promise<BigNumber> {
    return this._contract.contributedToSTO.call(contributorAddress);
  }

  /** Get information on if a shareholder has voted to freeze a POLY allocation.
   * @param userAddress The address of the user who wants to vote
   * @param addressBeingVotedOn The stakeholder who is being voted agaisnt
   * @return True if the shareholder has voted to freeze
   */
  async getVoted(
    userAddress: string,
    addressBeingVotedOn: string,
  ): Promise<boolean> {
    return this._contract.voted.call(userAddress, addressBeingVotedOn);
  }

  /**
   * Call to start the security token offering contract.
   * @param ownerAddress The owner of the SecurityToken contract is the only one who can start the offering
   */
  async startOffering(ownerAddress: string) {
    await this._contract.startOffering({
      from: ownerAddress,
    });
  }

  /**
   * Add a verified address to the Security Token blacklist
   * @param owner Owner of the security token contract
   * @param blacklistAddress The address being added to the blacklist
   */
  async addToBlacklist(ownerAddress: string, blacklistAddress: string) {
    await this._contract.addToBlacklist(blacklistAddress, {
      from: ownerAddress,
      gas: 1000000,
    });
  }

}
