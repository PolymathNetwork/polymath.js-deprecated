// @flow

import BigNumber from 'bignumber.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import {
  EventCallback,
  IndexedFilterValues,
  STOContractEventArgs,
} from '../types';

import ContractWrapper from './ContractWrapper';

import securityTokenOfferingArtifact from '../artifacts/STOContract.json';

/**
 * Wrapper for the STOContract Solidity contract
 */
export default class STOContract extends ContractWrapper {
  /**
   * @hideconstructor
   */
  constructor(
    web3Wrapper: Web3Wrapper,
    polyToken: string,
    owner: string,
    deployedAddress: string,
  ) {
    super(web3Wrapper, securityTokenOfferingArtifact, deployedAddress);

    this.POLY = polyToken;
    this.owner = owner;
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
    callback: EventCallback<STOContractEventArgs>,
  ): string {
    return super._subscribe(eventName, indexedFilterValues, callback);
  }

  /**
   * Gets the STO start time as a unix timestamp.
   * @return The start time.
   */

  async getStartTime(): Promise<BigNumber> {
    return this._contract.startTime.call();
  }

  /**
   * Gets the STO end time as a unix timestamp.
   * @return The end time.
   */

  async getEndTime(): Promise<BigNumber> {
    return this._contract.endTime.call();
  }

  /**
   * Gets the owner of the offering contract.
   * @return The owner address.
   */

  async getOwner(): Promise<string> {
    return this._contract.owner.call();
  }

  /**
   * Gets the rate of one security token in terms of poly.
   * @return The rate in poly.
   */

  async getRateInPoly(): Promise<BigNumber> {
    return this._contract.rateInPoly.call();
  }

  /**
   * Gets the address of the securityToken.
   * @return The security token contract address.
   */

  async getSecurityTokenAddress(): Promise<string> {
    return this._contract.securityTokenAddress.call();
  }

  /**
   * Issue Security Token by the owner
   * @param owner                       Owner of the offering contract
   * @param securityTokenAddress        Address of the security token
   * @param startTime                   Start timestamp of the STO
   * @param endTime                     End timestamp of the STO
   */
  async securityTokenOffering(
    owner: string,
    securityTokenAddress: string,
    startTime: BigNumber,
    endTime: BigNumber,
  ) {
    await this._contract.securityTokenOffering(
      securityTokenAddress,
      startTime,
      endTime,
      {
        from: owner,
        gas: 500000,
      },
    );
  }

  /**
   * Buy Security Token using POLY
   * @param contributor                Address of the contributor
   * @param amountOfPolyContributed    Number of POLY contributed
   */
  async buySecurityTokenWithPoly(
    contributor: string,
    amountOfPolyContributed: BigNumber,
  ) {
    await this._contract.buySecurityTokenWithPoly(amountOfPolyContributed, {
      from: contributor,
      gas: 500000,
    });
  }
}
