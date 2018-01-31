// @flow

import BigNumber from 'bignumber.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import ContractWrapper from './ContractWrapper';
import polyTokenArtifact from '../artifacts/PolyTokenMock.json';
import type {
  BlockRange,
  EventCallback,
  IndexedFilterValues,
  Log,
  PolyTokenEventArgs,
} from '../types';

/**
 * Wrapper for the PolyToken Solidity contract
 */
export default class PolyToken extends ContractWrapper {
  /**
   * @hideconstructor
   */
  constructor(web3Wrapper: Web3Wrapper, deployedAddress?: string) {
    super(web3Wrapper, polyTokenArtifact, deployedAddress);
  }

  /**
   * Subscribes to events emitted by the contract.
   * @param   eventName           The name of the event to subscribe to
   * @param   indexedFilterValues Event argument values with which to filter logs
   * @param   callback            Callback to receive event logs
   * @return  An identifier used to unsubscribe
   */
  subscribe(
    eventName: 'Transfer' | 'Approval',
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<PolyTokenEventArgs>,
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
    eventName: 'Transfer' | 'Approval',
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<PolyTokenEventArgs>>> {
    return super._getLogs(eventName, indexedFilterValues, blockRange);
  }

  /**
   * Gets the total supply of POLY tokens.
   * @return Total supply in base units
   */
  async getTotalSupply(): Promise<BigNumber> {
    return this._contract.totalSupply.call();
  }

  /**
   * Gets the number of decimals the POLY token uses.
   * @return Number of decimals
   */
  async getDecimals(): Promise<number> {
    return (await this._contract.decimals.call()).toNumber();
  }

  /**
   * Gets the POLY token symbol (i.e. POLY).
   * @return The POLY token symbol
   */
  async getSymbol(): Promise<string> {
    return this._contract.symbol.call();
  }

  // does not need  documentationjs docs, as it is not part of the actual PolyToken contract on mainnet.
  async generateNewTokens(amount: BigNumber, recipientAddress: string) {
    // TODO: Validate recipientAddress is one of our accounts
    await this._contract.getTokens(amount, recipientAddress, {
      from: recipientAddress,
    });
  }

  /**
   * Gets the account balance of `address`.
   * @param   address   The Ethereum address of the account
   * @return  Account balance in base units
   */
  async getBalanceOf(address: string): BigNumber {
    return this._contract.balanceOf(address);
  }

  /**
   * Transfers `amount` POLY tokens from `fromAddress` to `toAddress`.
   * @param   fromAddress   The Ethereum address of the account to withdraw from
   * @param   toAddress     The Ethereum address of the account receiving POLY
   * @param   amount        The amount, in base units, of POLY to transfer
   */
  async transfer(fromAddress: string, toAddress: string, amount: BigNumber) {
    // TODO: Validate fromAddress is one of our accounts
    await this._contract.transfer(toAddress, amount, {
      from: fromAddress,
    });
  }

  /**
   * Approves `spenderAddress` to withdraw `amount` POLY tokens from `ownerAddress`.
   * @param   ownerAddress    The Ethereum address of the account setting the allowance
   * @param   spenderAddress  The Ethereum address of the account approved to withdraw the allowance
   * @param   amount          The amount, in base units, of POLY tokens that the spender will be able to withdraw
   */
  async approve(
    ownerAddress: string,
    spenderAddress: string,
    amount: BigNumber,
  ) {
    // TODO: Validate ownerAddress is one of our accounts
    await this._contract.approve(spenderAddress, amount, {
      from: ownerAddress,
    });
  }

  /**
   * Gets the amount of POLY tokens that `spenderAddress` is allowed to withdraw from `ownerAddress`.
   * @param   ownerAddress    The Ethereum address that may be withdrawn from
   * @param   spenderAddress  The Ethereum address that may spend the returned allowance
   * @return  Amount of POLY allowed to be withdrawn, in base units
   */
  async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
  ): Promise<BigNumber> {
    return this._contract.allowance.call(ownerAddress, spenderAddress);
  }

  /**
   * Transfers `amount` POLY tokens from `fromAddress` to `toAddress` using `spenderAddress`'s previously approved allowance.
   * @param   fromAddress     The Ethereum address from which the POLY is withdrawn
   * @param   toAddress       The Ethereum address receiving the POLY
   * @param   spenderAddress  The Ethereum address that was approved to withdraw POLY
   * @param   amount          The amount, in base units, of POLY to transfer
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
}
