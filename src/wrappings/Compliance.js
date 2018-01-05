// @flow

import Web3 from 'web3';

/**
 * Complaince class
 */
 class Compliance {
  constructor() {}

  /**
   * The template reputation is a struct that represents a legal compliance template. It records who has used the template, when it expires, how many times it has been used, the total POLY raised by this template, and the owner of the template.
   */
  checkTemplateReputation(templateAddress: string) {}


  /**
  * Gets the address of a single template proposal from the array of proposals that have been submitted for a single Security Token.
  */
  getTemplateByProposal(securityTokenAddress: string, templateIndex) {}

}




export type ComplianceClass = Compliance;

module.exports = Compliance;