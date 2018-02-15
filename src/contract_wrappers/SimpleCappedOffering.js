// @flow

import BigNumber from 'bignumber.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import Web3 from 'web3';
import SecurityToken from './SecurityToken'
import ContractWrapper from './ContractWrapper';
import simpleCappedOfferingArtifact from '../artifacts/SimpleCappedOffering.json';
import type {
     SimpleCappedOfferingEventArgs,
     IndexedFilterValues,
     EventCallback,
     BlockRange 
} from '../types';

/**
 * Wrapper for the SimpleCappedOffering Solidity contract
 */
export default class SimpleCappedOffering extends ContractWrapper {
  securityToken: SecurityToken;
  /**
   * @hideconstructor
   */
  constructor(
      web3Wrapper: Web3Wrapper,
      securityToken: SecurityToken,
      deployedAddress: string
    ) {
    super(web3Wrapper, simpleCappedOfferingArtifact, deployedAddress);
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
    eventName: 'LogBoughtSecurityToken',
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<SimpleCappedOfferingEventArgs>,
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
    eventName: 'LogBoughtSecurityToken',
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<LogBoughtSecurityToken>>> {
    return super._getLogs(eventName, indexedFilterValues, blockRange);
  }

  /**
   * Gets the POLY raised by the STO contract
   * @return Total POLY raised
   */
  async getPolyRaisedBySTO(): Promise<BigNumber> {
    return this._contract.polyRaised.call();
  }

  /**
   * Gets the max poly amount raised by the issuer
   * @return Max POLY
   */
  async getMaxPoly(): Promise<BigNumber> {
    return this._contract.maxPoly.call();
  }

  /**
   * Gets the Unix timestamp to start the STO contract
   * @return Start Time
   */
  async getStartTime(): Promise<BigNumber> {
    return this._contract.startTime.call();
  }

  /**
   * Gets the Unix timestamp to end the STO contract
   * @return End Time
   */
  async getEndTime(): Promise<BigNumber> {
    return this._contract.endTime.call();
  }

  /**
   * Gets the fix security token rate in terms of POLY
   * @return Fix security token rate
   */
  async getFxPolyTokenRate(): Promise<BigNumber> {
    return this._contract.fxPolyToken.call();
  }

  /**
   * Buy the security token using POLY token
   * @param  contributorAddress The Contributor or investor address who is willing to take participate in the offering of security token
   * @param  polyContributed Amount of the POLY contributed
   */
  async buy(contributorAddress: string, polyContributed: BigNumber) {
    await this._contract.buy(polyContributed, {
      from: contributorAddress,
      gas: 300000,
    });
  }
}
