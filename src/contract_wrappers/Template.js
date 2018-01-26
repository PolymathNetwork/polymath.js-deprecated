// @flow

import BigNumber from 'bignumber.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import Web3 from 'web3';

import ContractWrapper from './ContractWrapper';
import templateArtifact from '../artifacts/Template.json';
import { roleToNumber } from '../roles';

/**
 * Wrapper for the Template Solidity contract
 */
export default class Template extends ContractWrapper {
  /**
   * @hideconstructor
   */
  constructor(web3Wrapper: Web3Wrapper, deployedAddress: string) {
    super(web3Wrapper, templateArtifact, deployedAddress);
  }

  /**
   * Subscribes to events emitted by the contract.
   * @param   eventName           The name of the event to subscribe to
   * @param   indexedFilterValues Event argument values with which to filter logs
   * @param   callback            Callback to receive event logs
   * @return  An identifier used to unsubscribe
   */
  subscribe(
    eventName: 'DetailsUpdated',
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<DetailsUpdated>,
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
    eventName: 'DetailsUpdated',
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<DetailsUpdated>>> {
    return super._getLogs(eventName, indexedFilterValues, blockRange);
  }

  /**
   * Add a jurisdiction to the Security token that indicates investors in that jurisdiction are allowed to purchase this security token.
   * @param  legalDelegateAddress The Ethereum address of the legal delegate who made the template
   * @param  allowedJurisdictions An array of strings (solidity type bytes32) that represent the jurisdiction
   * @param  allowed An array of whether the jurisdiction is allowed to purchase the security or not
   */
  async addJurisdiction(
    legalDelegateAddress: string,
    allowedJurisdictions: Array<string>,
    allowed: Array<boolean>,
  ) {
    const uppercaseJurisdictions = allowedJurisdictions.map(i =>
      i.toUpperCase(),
    );
    const jurisdictionsToBytes32 = uppercaseJurisdictions.map(j =>
      Web3.prototype.fromAscii(j),
    );

    await this._contract.addJurisdiction(jurisdictionsToBytes32, allowed, {
      from: legalDelegateAddress,
    });
  }

  /**
   * Add a jurisdiction division to the Security token that indicates investors in that division are allowed to purchase this security token.
   * @param  legalDelegateAddress The Ethereum address of the legal delegate who made the template
   * @param  allowedDivisionJurisdictions An array of strings (solidity type bytes32) that represent the jurisdiction divisiom
   * @param  allowed An array of whether the division is allowed to purchase the security or not
   */
  async addDivisionJurisdiction(
    legalDelegateAddress: string,
    allowedDivisionJurisdictions: Array<string>,
    allowed: Array<boolean>,
  ) {
    const uppercaseJurisdictions = allowedDivisionJurisdictions.map(i =>
      i.toUpperCase(),
    );
    const jurisdictionsToBytes32 = uppercaseJurisdictions.map(j =>
      Web3.prototype.fromAscii(j),
    );

    await this._contract.addDivisionJurisdiction(
      jurisdictionsToBytes32,
      allowed,
      {
        from: legalDelegateAddress,
      },
    );
  }

  /**
   * Allows the adding of new roles to be added to whitelist
   * @param legalDelegateAddress The Ethereum address of the legal delegate who made the template
   * @param allowedRoles An array of strings  that adds new roles to the whitelist
   */
  async addRoles(legalDelegateAddress: string, allowedRoles: Array<string>) {
    const arrayNumbers = [];
    for (let i = 0; i < allowedRoles.length; i++) {
      arrayNumbers[i] = roleToNumber(allowedRoles[i]);
    }
    await this._contract.addRoles(arrayNumbers, {
      from: legalDelegateAddress,
    });
  }

  /**
   * Allows the legal delegate to update the hash of the details of the template that is stored off the blockchain.
   * @param  legalDelegateAddress The Ethereum address of the legal delegate who made the template
   * @param  details Hash of the new details documentation (solidity type bytes32)
   * @return True in case of success, string error in case of fail
   */
  async updateTemplateDetails(
    legalDelegateAddress: string,
    details: string,
  ): Promise<string | boolean> {
    if (details === '') return 'Details cannot be an empty string';

    const owner = (await this.getTemplateUsageDetails())[3];
    if (legalDelegateAddress === owner) {
      await this._contract.updateDetails(details, {
        from: legalDelegateAddress,
      });
      return true;
    }
    return 'Only owner can call updateTemplateDetails';
  }

  /**
   * Allows the legal delegate to finalize the template.
   * @param  legalDelegateAddress The Ethereum address of the legal delegate who made the template
   * @return True in case of success, string error in case of fail
   */
  async finalizeTemplate(
    legalDelegateAddress: string,
  ): Promise<string | boolean> {
    const owner = (await this.getTemplateUsageDetails())[3];
    if (legalDelegateAddress === owner) {
      await this._contract.finalizeTemplate({
        gas: 1000000,
        from: legalDelegateAddress,
      });
      return true;
    }
    return 'Only owner can call finalizeTemplate';
  }

  /**
   * Checks if the template requirements for jurisdiction, accreditation, and role are met.
   * @param jurisdiction The ISO-3166 code of the investors jurisdiction (solidity type bytes32)
   * @param accredited Defines if the investor is accredited or not
   * @param role Role string used to see if the role is allowed for a security token (solidity type uint8)
   * @return True if it all template requirements are met
   */
  async checkTemplateRequirements(
    countryJurisdiction: string,
    divisionJurisdiction: string,
    accredited: boolean,
    role: string,
  ): Promise<boolean> {
    const uppercaseJurisdiction = countryJurisdiction.toUpperCase();
    const jurisdictionsToBytes32 = Web3.prototype.fromAscii(
      uppercaseJurisdiction,
    );

    const uppercaseJurisdictionDivision = divisionJurisdiction.toUpperCase();
    const jurisdictionDivisionsToBytes32 = Web3.prototype.fromAscii(
      uppercaseJurisdictionDivision,
    );
    const numericalRole = roleToNumber(role);

    // we want to return false in polymath.js when conditions are not met, instead of the revert failure that solidity gives. So we check
    // them individually, and if all conditions are met, we let a call go to checkTemplateRequirements. If not, just return false
    const checkJurisdiction = await this.checkIfCountryJurisdictionIsAllowed(
      jurisdictionsToBytes32,
    );
    const checkJurisdictionDivision = await this.checkIfDivisionJurisdictionIsAllowed(
      jurisdictionDivisionsToBytes32,
    );

    const checkAccreditation = await this.checkIfAccreditationIsRequired();
    const checkRole = await this.checkIfRoleIsAllowed(numericalRole);
    if (
      checkJurisdiction === true &&
      checkJurisdictionDivision === true &&
      checkRole === true &&
      (checkAccreditation === false || checkAccreditation === checkRole)
    )
      return this._contract.checkTemplateRequirements.call(
        jurisdictionsToBytes32,
        jurisdictionDivisionsToBytes32,
        accredited,
        numericalRole,
      );
    return false;
  }

  /**
   * Get the template details, which is a hash that points to a document off the blockchain with more detailed information on the template.It also returns the finalization status of the template
   * @return An array [details, finalized], where details is a string and finalized is a boolean
   */
  async getTemplateDetails(): Promise<Array<mixed>> {
    return this._contract.getTemplateDetails.call();
  }

  /**
   * Gets multiple usage details for the template
   * bignumber, number, bignumber, string, string
   * @return An array of details for the template being used.
   */
  async getTemplateUsageDetails(): Promise<Array<mixed>> {
    const details = await this._contract.getUsageDetails.call();
    const detailsToNumber = details.map(i => {
      if (typeof i === 'object') return i.toNumber(); // so it only changes BigNumber objects
      return i;
    });
    return detailsToNumber;
  }

  /**
   * Returns what type of offering the Security Token is by calling the state variable .
   * @return   The type of offering of the Security token (solidity type string).
   */
  async getOfferingType(): Promise<string> {
    return this._contract.offeringType.call();
  }

  /**
   * Returns the issuers jurisdiction by calling the state variable.
   * @return The issuer jurisdiction code (solidty type bytes32)
   */
  async getIssuerJurisdiction(): Promise<string> {
    const bytes32Returned = await this._contract.issuerJurisdiction.call();
    const parsedString = Web3.prototype
      .toAscii(bytes32Returned)
      .replace(/\u0000/g, '');
    return parsedString;
  }

  /**
   * Checks if the jurisdiction is allowed for this template
   * @return True if the jurisdiction is allowed
   */
  async checkIfCountryJurisdictionIsAllowed(
    jurisdiction: string,
  ): Promise<boolean> {
    return this._contract.allowedJurisdictions.call(jurisdiction);
  }

  /**
   * Checks if the jurisdiction division is allowed for this template
   * @return True if the division is allowed
   */
  async checkIfDivisionJurisdictionIsAllowed(
    jurisdiction: string,
  ): Promise<boolean> {
    return this._contract.blockedDivisionJurisdictions.call(jurisdiction);
  }

  /**
   * Checks if a role is allowed for the template
   * @return True if the role is allowed
   */
  async checkIfRoleIsAllowed(role: number): Promise<boolean> {
    return this._contract.allowedRoles.call(role);
  }

  /**
   * Checks for investor accreditation
   * @return True if the template does require investors to be accredited
   */
  async checkIfAccreditationIsRequired(): Promise<boolean> {
    return this._contract.accredited.call();
  }

  /**
   * Returns when the template expires by calling the state variable
   * @return A BigNumber object representing the UNIX time the template expires (solidty type uint256)
   */
  async getTemplateExpiry(): Promise<BigNumber> {
    return (await this._contract.expires.call()).toNumber();
  }
}
