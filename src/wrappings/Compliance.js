// @flow

import Web3 from 'web3';

/**
 * Complaince class
 */
 class Compliance {
  constructor() {}

  /**
   * The {@link TemplateReputation} is a struct that represents a legal compliance template. It records who has used the template, when it expires, how many times it has been used, the total POLY raised by this template, and the owner of the template.
   * 
   * @param templateAddress Ethereum address of the template
   */
  checkTemplateReputation(templateAddress: string) {}


  /**
  * Gets the address of a single template proposal from the array of proposals that have been submitted for a single Security Token. Returns a promise of one template address that has been proposed for a single security token.
  *
  * @param securityTokenAddress Ethereum  address of the Security Token
  * @param templateIndex Index of the template in the array of templates in templateProposals
  */
  getTemplateByProposal(securityTokenAddress: string, templateIndex: number) {}


    /**
   * The {@link Offering} is a struct that stores information about an STO. It records the address of the STO, the auditor, the vesting period, the quorum of votes needed, and the fee associated with using the STO.
   * 
   * @param templateAddress Ethereum address of the template
   */
  checkContractOfferingReputation(templateAddress: string) {}

    /**
  * Gets the address of a single STO proposal from the array of proposals that have been submitted for a single Security Token. Returns a promise of the STO contract address.
  *
  * @param securityTokenAddress Ethereum  address of the Security Token
  * @param contractIndex Index of the STO in the array of STO contracts in offeringProposals
  */
  getOfferingByProposal(securityTokenAddress: string, contractIndex: number) {}


    /**
  * Creates a legal template, submitted by a legal delegate. Returns  boolean true if the TemplateCreated() event is emitted from EVM, meaning it was successfully created on the EVM. It does this by event watchingfor {@link LogTemplateCreated()}.
  *
  *
  * @param offeringType The name of the security being issued
  * @param issuerJurisdiction The jurisdiction id of the issuer
  * @param accredited Accreditation status required for investors
  * @param kyc KYC provider used by the template
  * @param details Details of the offering requirements
  * @param expires Timestamp of when the template will expire
  * @param fee fee Amount of POLY to use the template (held in escrow until issuance)
  * @param quorum % of voters needed to penalize the legal delegate 
  * @param vestingPeriod Time allowed for the vesting of the template before the legal delegate can recieve POLY 
  */
  getOfferingByProposal(offeringType: string, issuerJurisdiction: string, accredited: boolean, kyc: string, details: string, expires: number, fee: number, quorum: number, vestingPeriod: number) {}

  
  /**
  * Propose a legal template. Returns boolean true if the LogNewDelegateProposal() event is emitted from EVM, meaning it was successfully created on the EVM. It does this by event watching for {@link LogNewTemplateProposal()}.
  *
  * @param securityTokenAddress Ethereum  address of the security token being bid on
  * @param templateAddress The template address
  */
  proposeLegalTemplate(securityTokenAddress: string, templateAddress: string) {}

    /**
  * Cancle an already proposed legal template. Can only be called if the bid hasn't been accepted yet. Returns boolean true if the cancellation is successful.
  *
  * @param securityTokenAddress Ethereum  address of the security token being bid on
  * @param templateProposalIndex The template proposal array index
  */
  cancleLegalTemplate(securityTokenAddress: string, templateProposalIndex: number) {}


  /**
  * Proposes a new STO contract. Returns boolean true if the {@link LogNewContractproposal()} event is emitted from EVM, meaning it was successfully created on the EVM. It does this by event watching.
  *
  * @param securityTokenAddress Ethereum  address of the security token being bid on
  * @param stoAddress The STO address
  */
  proposeSTOContract(securityTokenAddress: string, stoAddress: string) {}

      /**
  * Cancle an already proposed STO contract. Can only be called if the STO has not been accepted. Returns boolean true if the cancellation was successful.
  *
  * @param securityTokenAddress Ethereum  address of the security token being bid on
  * @param templateProposalIndex he offering proposal array index
  */
  cancleSTOContract(securityTokenAddress: string, offeringProposalIndex: number) {}


      /**
  * Set a created STO contract. A developer would create the STO contract first, get the address of it on the ethereum network, and then call setSTOContract() to indicate that a new STO contract has been located, along with the fee, the vesting period, and the quorum. Returns boolean true if the STO was set.
  *
  * @param stoAddress The address of the deployed STO contract
  * @param fee The POLY fee to use this contract
  * @param vestingPeriod The number of days the investor is binded to hold the security token
  * @param quorum Minimum percent of shareholders which need to vote to freeze
  */
  setSTOContract(stoAddress: string, fee: number, vestingPeriod: number, quorum: number) {}

}






export type ComplianceClass = Compliance;

module.exports = Compliance;