// @flow

import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { BigNumber } from 'bignumber.js';
import ContractWrapper from './ContractWrapper';
import securityTokenRegistrarArtifact from '../artifacts/SecurityTokenRegistrar.json';
import SecurityToken from './SecurityToken';
import type {
  BlockRange,
  LogNewSecurityToken,
  EventCallback,
  IndexedFilterValues,
  Log,
  SecurityTokenData,
} from '../types';

/**
 * Wrapper for the SecurityTokenRegistrar Solidity contract
 */
export default class SecurityTokenRegistrar extends ContractWrapper {
  /**
   * @hideconstructor
   */
  constructor(web3Wrapper: Web3Wrapper, securityToken: SecurityToken, deployedAddress?: string) {
    super(web3Wrapper, securityTokenRegistrarArtifact, deployedAddress);

    this.securityToken = securityToken;

  }

  /**
   * Subscribes to events emitted by the contract.
   * @param   eventName           The name of the event to subscribe to
   * @param   indexedFilterValues Event argument values with which to filter logs
   * @param   callback            Callback to receive event logs
   * @return  An identifier used to unsubscribe
   */
  subscribe(
    eventName: 'LogNewSecurityToken',
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<LogNewSecurityToken>,
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
    eventName: 'LogNewSecurityToken',
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<LogNewSecurityToken>>> {
    return super._getLogs(eventName, indexedFilterValues, blockRange);
  }

  /**
   * Creates a security token and stores it in the security token registry. Returns a promise of true it the security token was successfully created. This is done by event watching for the event {@link LogNewSecurityToken()}.
   *
   * @param creator The address from which the token is created
   * @param name Name of the security token
   * @param ticker Ticker name of the security
   * @param totalSupply Total amount of tokens being created
   * @param owner Public Key address of the security token owner
   * @param host The host of the security token wizard
   * @param fee POLY Fee being requested by the wizard host
   * @param type Type of security being tokenized (NEED TOKEN NUMBERS ie. security:1, somethingelse:2)
   * @param maxPoly Amount of POLY being raised
   * @param lockupPeriod Length of time (unix) raised POLY will be locked up for dispute
   * @param quorum Percent of initial investors required to freeze POLY raise
   */
  async createSecurityToken(
    creator: string,
    name: string,
    ticker: string,
    totalSupply: BigNumber,
    owner: string,
    maxPoly: BigNumber,
    host: string,
    fee: BigNumber,
    type: number,
    lockupPeriod: BigNumber,
    quorum: number,
  ) {
    await this._contract.createSecurityToken(
      name,
      ticker,
      totalSupply,
      owner,
      maxPoly,
      host,
      fee,
      type,
      lockupPeriod,
      quorum,
      {
        from: creator,
        gas: 6700000,
      },
    );
  }

  /**
   * Getter function for ST data by passing the address as the variable.
   * @param tokenAddress
   * @return The security token data
   */
  async getSecurityTokenData(tokenAddress: string): Promise<SecurityTokenData> {
    const tokenData = await this._contract.getSecurityTokenData.call(
      tokenAddress,
    );
    const dataToNumber = tokenData.map(i => {
      if (typeof i === 'object') return i.toNumber(); // so it only changes BigNumber objects
      return i;
    });
    return dataToNumber;
  }

  /**
   * Getter function for ST addresses by passing the ticker/symbol as the variable.
   * @param ticker The security token ticker
   * @return The security token address
   */
  async getSecurityTokenAddress(ticker: string): Promise<string> {
    return this._contract.getSecurityTokenAddress.call(ticker);
  }

  /**
   * Getter function for the state variable in the registrar for the polytoken address
   * @return The address of polyToken on the blockchain that the registrar is connected to
   */
  async getPolyTokenAddress(): Promise<string> {
    return this._contract.polyTokenAddress.call();
  }

  /**
   * Getter function for the state variable in the registrar for the customers address
   * @return The address of customers on the blockchain that the registrar is connected to
   */
  async getCustomersAddress(): Promise<string> {
    return this._contract.polyCustomersAddress.call();
  }

  /**
   * Getter function for the state variable in the registrar for the compliance address
   * @return The address of compliance on the blockchain that the registrar is connected to
   */
  async getComplianceAddress(): Promise<string> {
    return this._contract.polyComplianceAddress.call();
  }

  /**
   * Allow POLY allocations to be withdrawn by owner, delegate, and the STO auditor at appropriate times.
   * @param polyOwnerAddress The owner who wants to withdraw their poly
   * @param ticker The security token ticker
   */
  async withdrawPolyFunds(polyOwnerAddress: string, ticker: string) {
    await this._contract.withdrawFunds(ticker, { from: polyOwnerAddress });
  }
}
