// @flow

import BigNumber from 'bignumber.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import ContractWrapper from './ContractWrapper';
import simpleCappedOfferingFactoryArtifact from '../artifacts/SimpleCappedOfferingFactory.json';
import bytes32Zero from '../bytes32Zero';
import { numberToRole } from '../roles';

/**
 * Wrapper for the SimpleCappedOfferingFactory Solidity contract
 */
export default class SimpleCappedOfferingFactory extends ContractWrapper {

  /**
   * @hideconstructor
   */
  constructor(
    web3Wrapper: Web3Wrapper,
    deployedAddress: string,
  ) {
    super(web3Wrapper, simpleCappedOfferingFactoryArtifact, deployedAddress);
  }

  /**
   * Gets the description of the offeringFactory.
   * @return Type of offeringFactory
   */
  async getDescription(): Promise<string> {
    return this._contract.description.call();
  }

  /**
   * Gets Vesting period.
   * @return Minimum amount of time to hold
   */
  async getVestingPeriod(): Promise<BigNumber> {
    return this._contract.vestingPeriod.call();
  }

  /**
   * Gets the fee taken by the STO factories creator.
   * @return The amount of POLY need to be paid for using the factory
   * to create the STO contract
   */
  async getFee(): Promise<BigNumber> {
    return this._contract.fee.call();
  }

  /**
   * Gets the Quorum of the offeringFactory.
   * @return Required amount of votes needed to make the consensus 
   */
  async getQuorum(): Promise<number> {
    return this._contract.quorum.call();
  }

  /**
   * Gets multiple usage details for the offeringFactory
   * bignumber, number, bignumber, string, string.
   * @return An array of details for the template being used.
   */
  async getFactoryUsageDetails(): Promise<Array<mixed>> {
     const details = await this._contract.getUsageDetails.call();
     const detailsToNumber = details.map(i => {
        if (typeof i === 'object') return i.toNumber(); // so it only changes BigNumber objects
        return i;
      });
      return detailsToNumber;
  }

  /**
   * Create the new STO contract from the factory
   * @param startTime               Unix timestamp at which offering will start
   * @param endTime                 Unix timestamp at which offering will end
   * @param polyTokenRate           Price of one security token in terms of poly       
   * @param maxPoly                 Maximum amount of POLY issuer wants to raise
   * @param securityTokenAddress    Address of the security token
   * @param deployer                Address of the deployer of the STO contract
   */
  async createOffering(
    startTime: string,
    endTime: string,
    polyTokenRate: string,
    maxPoly: BigNumber,
    securityTokenAddress: string,
    deployer: string,
  ) {
    await this._contract.createOffering(startTime, endTime, polyTokenRate, maxPoly, securityTokenAddress, {
      from: deployer,
      gas: 300000
    });
  }
}
