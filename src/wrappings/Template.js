// @flow

import Web3 from 'web3';

/**
 * Template Class
 */
 class Template {
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
    * Allows the adding of new roles to be added to whitelist

    * @param {number[]} allowedRoles An array of numbers (solidity type uint8) that adds new roles to the whitelist
    * @returns {null}
    */
  addRoles(allowedRoles: number[]) {}

  /**
    * Allows the legal delegate to update the hash of the details of the template that is stored off the blockchain.

    * @param {string} details Hash of the new details documentation (solidity type bytes32)
    * @returns {boolean} True if it updated correctly to the blockchain.
    */
  updateTemplateDetails(details: string) {}

  /**
    * Allows the legal delegate to finalize the template.

    * @returns {boolean} True if it template is finalized
    */
  finalizeTemplate() {}

  /**
    * Checks if the template requirements for jurisdiction, accredation, and role are met.

    * @param {string} jurisdiction The ISO-3166 code of the investors jurisdiction (solidty type bytes32)
    * @param {boolean} accredited Defines if the investor is accredited or not
    * @param {number} role Role number used to see if the role is allowed for a security token (solidity type uint8)

    * @returns {boolean} True if it all template requirements are met 
    */
  checkTemplateRequirements(
    jurisdiction: string,
    accredited: boolean,
    role: number,
  ) {}

  /**
    * Get the template details, which is a hash that points to a document off the blockchain with more detailed information on the template.It also returns the finalization status of the template

    * @returns {[details, finalized]} details is a string and finalized is a boolean
    */
  getTemplateDetails() {}

  /**
    * Gets multiple usage details for the template 

    * @returns {[fee, quorum, vestingPeriod, owner, KYC]} An array of details for the template being used. 
    */
  getTemplateUsageDetails() {}

  /**
    * Returns when the template expires by calling the state variable

    * @returns {BigNumber} A BigNumber object representing the UNIX time the template expires (solidty type uint256)
    */
  getTemplateExpiry() {}

  /**
    * Returns the issuers jurisdiction by calling the state variable.


    * @returns {string} The issuer jurisdiction code (solidty type bytes32)
    */
  getIssuerJurisdiction() {}

  /**
    * Returns what type of offering the Security Token is by calling the state variable .

    * @returns {string}  The type of offering of the Security token (solidity type string).
    */
  getOfferingType() {}
}


export type TemplateClass = Template;

module.exports = Template;