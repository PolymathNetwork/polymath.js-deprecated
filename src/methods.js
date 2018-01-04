// @flow

import Web3 from 'web3';



export class PolymathjsMethods {
    constructor() {
    }

    /**
        * Adds a {@link IControl} to the map, calling `control.onAdd(this)`.
        *
        * @param {IControl} control The {@link IControl} to add.
        * @param {string} [position] position on the map to which the control will be added.
        * Valid values are `'top-left'`, `'top-right'`, `'bottom-left'`, and `'bottom-right'`. Defaults to `'top-right'`.
        * @returns {Map} `this`
        * @see [Display map navigation controls]asdasda dsad s(https://www.mapbox.com/mapbox-gl-js/example/navigation/)
        */
    addControl(control: IControl, position?: ControlPosition) {
        if (position === undefined && control.getDefaultPosition) {
            position = control.getDefaultPosition();
        }
        if (position === undefined) {
            position = 'top-right';
        }
        const controlElement = control.onAdd(this);
        const positionContainer = this._controlPositions[position];
        if (position.indexOf('bottom') !== -1) {
            positionContainer.insertBefore(controlElement, positionContainer.firstChild);
        } else {
            positionContainer.appendChild(controlElement);
        }
        return this;
    }

    /**
    * Add a jurisdiction to the Security token that indicates investors in that jurisdiction are allowed to purchase this security token.

    * @param {string[]} allowedJurisdictions An array of strings (solidity type bytes32) that represent the jurisdiction
    * @param {boolean} allowed An array of whether the jurisdiction is allowed to purchase the security or not
    * @returns {null}
    * @see {link https//:www.google.ca} for fun
    */
    addJurisdiction(allowedJurisdictions: string[], allowed: boolean[]) {

    }

    /**
    * Allows the adding of new roles to be added to whitelist

    * @param {number[]} allowedRoles An array of numbers (solidity type uint8) that adds new roles to the whitelist
    * @returns {null}
    */
    addRoles(allowedRoles: number[]) {

    }

    /**
    * Allows the legal delegate to update the hash of the details of the template that is stored off the blockchain.

    * @param {string} details Hash of the new details documentation (solidity type bytes32)
    * @returns {boolean} True if it updated correctly to the blockchain.
    */
    updateTemplateDetails(details: string) {
    
    }



    /**
    * Allows the legal delegate to finalize the template.

    * @returns {boolean} True if it template is finalized
    */
    finalizeTemplate() {
    
    }


       /**
    * Checks if the template requirements for jurisdiction, accredation, and role are met.

    * @param {string} jurisdiction The ISO-3166 code of the investors jurisdiction (solidty type bytes32)
    * @param {boolean} accredited Defines if the investor is accredited or not
    * @param {number} role Role number used to see if the role is allowed for a security token (solidity type uint8)

    * @returns {boolean} True if it all template requirements are met 
    */
    checkTemplateRequirements(jurisdiction: string, accredited: boolean, role: number) {
    
    }

    /**
    * Get the template details, which is a hash that points to a document off the blockchain with more detailed information on the template.It also returns the finalization status of the template

    * @returns {[details, finalized]} details is a string and finalized is a boolean
    */
    getTemplateDetails() {
    
    }

    /**
    * Gets multiple usage details for the template 

    * @returns {[fee, quorum, vestingPeriod, owner, KYC]} An array of details for the template being used. 
    */
    getTemplateUsageDetails() {
    
    }

        /**
    * Returns when the template expires by calling the state variable

    * @returns {BigNumber} A BigNumber object representing the UNIX time the template expires (solidty type uint256)
    */
    getTemplateExpiry() {
    
    }

        /**
    * Returns the issuers jurisdiction by calling the state variable.


    * @returns {string} The issuer jurisdiction code (solidty type bytes32)
    */
    getIssuerJurisdiction() {
    
    }

        /**
    * Returns what type of offering the Security Token is by calling the state variable .

    * @returns {string}  The type of offering of the Security token (solidity type string).
    */
    getOfferingType() {
    
    }





    /**
    * Allows only the owner of the contract to select a template proposed by a legal delegate to be the template of their Security Token.

    * @param {number} templateIndex The index of the template to select from the array of templates for the chosen Security Token. It finds it from Compliane.sol in the templateProposals mapping. (solidity type uint8)

    * @returns {boolean} True if the template is correctly selected
    */
    selectTemplate(templateIndex: number) {
    
    }

   /**
    * Allows the owner or the legal delegate to update the compliance proof hash for the issuance.This is the hash of all the current documents being uploaded to show that the legal delegate and the issuer are following regulations in order to launch a legal Security Token.This hash can then be used to go confirm the documentation is stored, and then that documentation can be reviewed

    * @param {string} newMerkleRoot New merkle root hash of the compliance proofs
    * @param {string} complianceProof Compliance proof hash

    * @returns {boolean} True if it is updated correctly.
    */
    updateComplianceProof(newMerkleRoot: string, complianceProof: string) {
    
    }

   /**
    * Allows the legal delegate to choose a Security Token Offering contract that was proposed by an STO developer.

    * @param {number} offeringProposalIndex Array index of the STO proposal (solidity type uint8)
    * @param {number} startTime Start of issuance period (solidity type uint256)
    * @param {number} endTime End of issuance period (solidity type uint256)


    * @returns {boolean} True if it is offering is selected correctly.
    */
    
    selectOfferingProposal(offeringProposalIndex: number, startTime: number, endTime: number) {
    
    }

   /**
    * Allows a KYC provider to add an ethereum address to the Security Token whitelist.

    * @param {string} whitelistAddress Address attempting to join Security Token whitelist (solidity type address).

    * @returns {boolean} True if the address was successfully whitelisted
    */
    
    addToWhitelist(whitelistAddress: string) {
    
    }

   /**
    * Allows poly allocations(which are recorded in the struct Allocations) to be withdrawn by owner, delegate and STO auditor at appropriate times.

    * @returns {boolean} True if the user was able to successfully withdraw their poly
    */
    
    withdrawPoly() {
    
    }

   /**
    * Allows investors to vote to freeze the fee of a certain network participant who is entitled to a POLY reward.

    * @param {string} recipient Address of the network participant that the investor is voting to lose their poly (solidity type address).

    * @returns {boolean} True if the vote was recorded on the blockchain
    */
    
    voteToFreeze(recipient: string) {
    
    }

   /**
    * Standard ERC20 transfer function call that is used in the ST20 standard to transfer security tokens from one account to another.

    * @param {string} to Address of the recipent of the Security Tokens being transferred (solidity type address)
    * @param {number} value Amount of Security Tokens to send (solidity type uint256)


    * @returns {boolean} True if the transfer is successful
    */
    transfer(to: string, value: number) {
    
    }

   /**
    * Standard ERC20 transfer function call that is used in the ST20 standard to transfer security tokens from one account to another from an approve account.

    * @param {string} from Address that is sending away Security Tokens in the transfer. The caller of this function will have to have given an allowance by the `to` address through the call of the function {@link approve} in order to allow this function to work (solidity type address).
    * @param {string} to Address of the recipent of the Security Tokens being transferred (solidity type address)

    * @param {number} value Amount of Security Tokens to send (solidity type uint256)


    * @returns {boolean} True if the transfer is successful
    */
    transferFrom(from: string, to: string, value: number) {
    
    }

   /**
    * Standard ERC20 transfer function call that is used in the ST20 standard to approve another ethereum account to tranfer tokens on your behalf.

    * @param {string} spender Address of the account which will be approved to transfer Security Tokens on the callers behalf (solidity type address)
    * @param {number} value Amount of Security Tokens to be approved for an allowance (solidity type uint256)


    * @returns {boolean} True if the approval amount is successfully recorded on the blockchain
    */
    approve(spender: string, value: number) {
    
    }

   /**
    * Standard ERC20 transfer function call that is used in the ST20 standard to check the allowance one account has to transfer on another ethereum addresses behalf.

    * @param {string} owner The address of the account owning tokens (solidity type address)
    * @param {number} spender The address of the account able to transfer the tokens (solidity type uint256)

    * @returns {BigNumber} The allowance that the spender has to spend on behalf of the owner
    */
    allowance(owner: string, spender: string) {
    
    }

   /**
    * Returns the following details of the Security Token: template address, deelgate address, compliance proof hash, STO contract address, and KYC address.

    * @returns {[Template, delegate, complianceProof, STO, KYC]}
    */
    getTokenDetails() {
    
    }

  /**
    * Check the Security token balance of an ethereum.
    
    * @param {string} owner The address of the account owning tokens (solidity type address)

    * @returns {BigNumber} The Security Token balance of the owner. 
    */
    balanceOf(owner: string) {
    
    }

   /**
    * Returns the ending time of the Security Token Offering(STO) contract by calling the state variable endSTO.

    * @returns {BigNumber} The UNIX time the STO ends (solidity type uint256)
    */
    endingTimeSTO() {

    }

   /**
    * Returns the start time of the Security Token Offering(STO) contract by calling the state variable startSTO.

    * @returns {BigNumber} The UNIX time the STO starts (solidity type uint256)
    */
    startTimeSTO() {

    }

       /**
    * The max amount of POLY being raised.

    * @returns {BigNumber} The max amount of POLY being raised for this Security Token (solidity type uint256).
    */
    maxPolyAllowedForRaising() {

    }

       /**
    * Returns the amount of Security tokens that were issued by the STO by calling the state variable tokensIssuedBySTO. This value will be frozen after the end time of the STO has been triggered, or the max has been reached.

    * @returns {BigNumber} The amount of tokens that have been raised for the security token (solidity type uint). 

    */
    tokensIssuedBySTO() {

    }

       /**
    * Returns the amount that an ethereum address has contributed to the STO, and the amount is in the chosen security token. (Note: This is a call to a mapping)

    * @param {string} address of the account to see how much they contributed to the STO (solidity type address).

    * @returns {BigNumber} The amount of tokens that were purchased by this ethereum addressfor the security token (solidity type uint). 
    */
    contributedToSTO(address: string) {

    }

    /**
    * Returns the struct Allocation for a specific ethereum address.The allocation struct holds information on the POLY allocations that users can withdraw once the vesting period is done, as long as they are not voted against to lose their rewards. (Note: This is a call to a mapping)

    * @param {string} address of the account to see the Allocations struct related to it.

    * @returns {Allocations} {@link Allocations}
    */
    allocations(address: string) {
    
    }

       /**
    * Returns the struct Shareholder for a specific ethereum address. (Note: This is a call to a mapping).

    * @param {string} address of the account to see the Shareholder struct related to it.

    * @returns {Shareholder} {@link Shareholder}
    */
    getShareholders() {

    }

       /**
    *  Returns a boolean that determines if a shareholders has voted to refuse the POLY reward of one of the users. (Note: This is a call to a mapping)

    * @param {string} voter address of the voter

    * @param {string} recipient address of the account being voted agaisnt

    * @returns {boolean} True if voted to take away POLY reward

    */
    getShareholderVotedResult(voter: string, recipient: string) {

    }

       /**
    * Returns the name of the Security Token.

    * @returns {string} Name of the ST
    */
    getSecurityTokenName() {

    }

       /**
    * Returns the Ticker / Symbol of the Security Token.

    * @returns {string} Symbol of the ST
    */
    getSecurityTokenSymbol() {
    
    }

       /**
    * Returns the owner of the Security Token

    * @returns {string} Address of the owner of the ST (solidity type address).
    */
    getSecurityTokenOwner() {
    
    }

       /**
    * Returns the total supply of the Security Token. 

    * @returns {BigNumber} total supply of all Security Tokens created. 
    */
    getSecurityTokenTotalSupply() {
    
    }

    // ### users.legalDelegate.issueSecurityToken()

    // this DOES NOT NEED TO BE CALLED.It is a function that only the STO contract is allowed to call, therefore, no user would ever need to call


}