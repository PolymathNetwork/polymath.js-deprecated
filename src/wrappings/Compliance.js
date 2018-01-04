// @flow

import Web3 from 'web3';

export class Template {
  constructor() {}

  /**
    * Add a jurisdiction to the Security token that indicates investors in that jurisdiction are allowed to purchase this security token.

    * @param {string[]} allowedJurisdictions An array of strings (solidity type bytes32) that represent the jurisdiction
    * @param {boolean} allowed An array of whether the jurisdiction is allowed to purchase the security or not
    * @returns {null}
    * @see {link https//:www.google.ca} for fun
    */
  addJurisdiction(allowedJurisdictions: string[], allowed: boolean[]) {}

  /**
   * The template reputation is a struct that represents a legal compliance template. It records who has used the template, when it expires, how many times it has been used, the total POLY raised by this template, and the owner of the template.
   */
  checkTemplateReputation(templateAddress: string) {}
}
