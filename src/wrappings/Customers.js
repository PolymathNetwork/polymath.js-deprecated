// @flow

import Web3 from 'web3';

/**
 * Customers class
 */
class Customers {
  constructor() {}



  /**
  * Retrives the information relative to a legal delegate, a developer, or an investor. Returns a promise in the form of a JSON object, which provides the user information in the form of the {@link Customer} Struct 
  * @param {string} kycProviderEthAddress Hex address of the kyc provider that approved the investor
  * @param {string} userEthAddress Hex address of the delegate that is being looked up
  */
  getUserInfo(kycProviderEthAddress: string, userEthAddress: string) {}


  /**
  * Retrives the information relative to a KYC provider. Returns a promise in the form of a JSON object, which provides the provider information in the form of the {@link Provider} Struct 
  * @param {string} kycProviderEthAddress Hex address of the kyc provider that approved the investor
  */
  getKYCProvderInfo(kycProviderEthAddress: string) {}

    /**
    * Allows a KYC provider to sign up to the Polymath Platform. Returns boolean true if the LogNewProvider() event is emitted from EVM, meaning it was successfully created on the EVM. It does this by event watching for {@link LogNewProvider}.
    *
    * @param {string} providerAddress String of ethereum address that the KYC provider wants to use for their account
    * @param {string} name Name of the KYC provider 
    * @param {string} details A SHA256 hash of the new providers details
    * @param {string} fee The fee the KYC provider charges for customer verification
  */
  signUpKYC(providerAddress: string, name: string, details: string, fee: string) {}


      /**
    * Allows a KYC provider to verify a customer on the platform. Returns boolean true if the {@link LogCustomerVerified()} event is emitted from EVM, meaning it was successfully created on the EVM. It does this by event watching.
    *
    * @param {string} customerAddress String of ethereum address of the customer the KYC provider is approving
    * @param {string} jurisdiciton Jurisdiction of the customer (i.e. CAN = Canada)
    * @param {uint8} role a number representing what type of customer it is. 1 represents investor, 2 issuer, 3 delegate
    * @param {bool} accredited true if they are found to be accredited, false if not
    * @param {number} kycExpires The time the verification expires
  */
  verifyCustomer(kycProviderEthAddress: string) {}


    /**
  * Changes the fee that the provider charges to verify a customer. Returns a promise of true if the changeFee has been successful.
  *
  * @param {number} newFee The new fee the provider wants to charge
  */
  changeFee(newFee: number) {}

}



export type CustomersClass = Customers;

module.exports = Customers;