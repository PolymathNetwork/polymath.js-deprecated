// @flow

import Web3 from 'web3';

/**
 * SecurityTokenRegistrar Class
 */
class SecurityTokenRegistrar {
    constructor() { }

  /**
   * Retrives the Security Token Ethereum Address. Returns a promise string of the address.
   * 
   * @param {string} ticker Ticker/Symbol of the Security Token being searched.
   */
  getSecurityTokenAddressByTicker(ticker: string) {}


  /**
   * Retrives the Security Token data that is stored in the Security Token Registrar contract. Returns a promise in the form of a JSON object, which provides ST data in the form of a {@link SecurityTokenData} struct
   * 
   * @param {string} securityTokenAddress Address of the Security Token being searched.
   */
  getSecurityTokenData(securityTokenAddress: string) {}


  /**
   * Creates a security token and stores it in the security token registry. Returns a promise of true it the security token was successfully created. This is done by event watching for the event {@link LogNewSecurityToken()}. 
   * 
   * @param {string} name Name of the security token
   * @param {string} ticker Ticker name of the security
   * @param {number} totalSupply Total amount of tokens being created
   * @param {string} owner Public Key address of the security token owner
   * @param {string} host The host of the security token wizard
   * @param {number} fee Fee being requested by the wizard host
   * @param {string} type Type of security being tokenized
   * @param {number} maxPoly Amount of POLY being raised
   * @param {number}lockupPeriod Length of time raised POLY will be locked up for dispute
   * @param {number} quorum Percent of initial investors required to freeze POLY raise 
   */
  createSecurityToken(name: string, ticker: string, totalSupply: number, owner: string, host: string, fee: number, type: string, maxPoly: number, lockupPeriod: number, quorum: number) {}
}


export type SecurityTokenRegistrarClass = SecurityTokenRegistrar;

module.exports = SecurityTokenRegistrar;
