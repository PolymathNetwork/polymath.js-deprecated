// @flow

import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { BigNumber } from 'bignumber.js';
import ContractWrapper from './ContractWrapper';
import securityTokenRegistrarArtifact from '../artifacts/SecurityTokenRegistrar.json';

/**
 * Wrapper for the SecurityTokenRegistrar Solidity contract
 */
export default class SecurityTokenRegistrar extends ContractWrapper {
  /**
   * @hideconstructor
   */
  constructor(web3Wrapper: Web3Wrapper, deployedAddress?: string) {
    super(web3Wrapper, securityTokenRegistrarArtifact, deployedAddress);
  }

  /**
   * Creates a security token and stores it in the security token registry. Returns a promise of true it the security token was successfully created. This is done by event watching for the event {@link LogNewSecurityToken()}.
   *
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
    host: string,
    fee: BigNumber,
    type: number,
    maxPoly: BigNumber,
    lockupPeriod: BigNumber,
    quorum: number,
  ) {
    await this._contract.createSecurityToken(
      name,
      ticker,
      totalSupply,
      owner,
      host,
      fee,
      type,
      maxPoly,
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
   * @return The security token data
   */
  async getSecurityTokenData(tokenAddress: string): Promise<Array<mixed>> {
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
}
