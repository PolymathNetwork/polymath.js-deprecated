// @flow

import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Web3Wrapper } from '@0xproject/web3-wrapper';

import ContractWrapper from './ContractWrapper';
import customersContract from '../artifacts/Customers.json';
import PolyToken from './PolyToken';
import { numberToRole, roleToNumber } from '../roles';
import type {
  BlockRange,
  Customer,
  CustomersEventArgs,
  CustomerRole,
  EventCallback,
  IndexedFilterValues,
  KYCProvider,
  Log,
} from '../types';
import { InsufficientAllowanceError, InsufficientBalanceError } from '../types';

type LogCustomerVerifiedArgsUnprocessed = {
  customer: string,
  provider: string,
  role: BigNumber,
};

/**
 * Wrapper for the Customers Solidity contract
 */
export default class Customers extends ContractWrapper {
  // polyToken: PolyToken;

  /**
   * @hideconstructor
   */
  constructor(
    web3Wrapper: Web3Wrapper,
    polyToken: PolyToken,
    deployedAddress?: string,
  ) {
    super(web3Wrapper, customersContract, deployedAddress);

    this.polyToken = polyToken;
  }

  /**
   * Subscribes to events emitted by the contract.
   * @param   eventName           The name of the event to subscribe to
   * @param   indexedFilterValues Event argument values with which to filter logs
   * @param   callback            Callback to receive event logs
   * @return  An identifier used to unsubscribe
   */
  subscribe(
    eventName: 'LogNewProvider' | 'LogCustomerVerified',
    indexedFilterValues: IndexedFilterValues,
    callback: EventCallback<CustomersEventArgs>,
  ): string {
    let wrappedCallback = callback;

    if (eventName === 'LogCustomerVerified') {
      // Convert from number roles to string enum roles.
      wrappedCallback = (args: any) => {
        const role = numberToRole(args.role.toNumber());

        if (role === null) {
          return;
        }

        callback({
          ...args,
          role,
        });
      };
    }

    return super._subscribe(eventName, indexedFilterValues, wrappedCallback);
  }

  /**
   * Retrieves events emitted by this contract in an arbitrary block range.
   * @param   eventName           The name of the event to look for
   * @param   indexedFilterValues Event argument values with which to filter logs
   * @param   blockRange          A range of blocks to look in. By default starts and ends at 'latest' block.
   * @return  An array of logs
   */
  async getLogs(
    eventName: 'LogNewProvider' | 'LogCustomerVerified',
    indexedFilterValues: IndexedFilterValues,
    blockRange?: BlockRange,
  ): Promise<Array<Log<CustomersEventArgs>>> {
    if (eventName === 'LogCustomerVerified') {
      // Convert from number roles to string enum roles.
      const logs: Array<
        Log<LogCustomerVerifiedArgsUnprocessed>,
      > = await super._getLogs(eventName, indexedFilterValues, blockRange);
      const processedLogs = [];

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const { args } = log;
        const role = numberToRole(args.role.toNumber());

        if (role === null) {
          continue;
        }

        processedLogs.push({
          ...log,
          args: {
            ...args,
            role,
          },
        });
      }

      return processedLogs;
    }

    return super._getLogs(eventName, indexedFilterValues, blockRange);
  }

  /**
   * Gets the fee payable when becoming a new KYC provider.
   * @return The fee in base units
   */
  async getNewKYCProviderFee(): Promise<BigNumber> {
    return this._contract.NEW_PROVIDER_FEE.call();
  }

  /**
   * Retrieve a KYC provider by their Ethereum address
   * @param  address    The Ethereum address of the KYC provider
   * @return The KYC provider, or null if none exists with the given address
   */
  async getKYCProviderByAddress(address: string): Promise<?KYCProvider> {
    const provider = await this._contract.providers.call(address);

    // Check if the `joined` time is 0. If so, the provider didn't exist.
    if (provider[1].equals(0)) {
      return null;
    }

    return {
      name: provider[0],
      joined: provider[1],
      detailsHash: provider[2],
      verificationFee: provider[3],
      active: provider[4],
    };
  }

  /**
   * Turns the provided account into a KYC provider, withdrawing the required fee.
   * @param  providerAddress  The Ethereum address of the account that you would like to turn into a KYC provider
   * @param  name             The name attached to your KYC services
   * @param  detailsHash      An SHA-256 hash of further information about your services
   * @param  verificationFee  Your fee per customer verification
   */
  async newKYCProvider(
    providerAddress: string,
    name: string,
    detailsHash: string,
    verificationFee: BigNumber,
  ) {
    const [allowance, balance, fee] = await Promise.all([
      this.polyToken.getAllowance(providerAddress, this._contract.address),
      this.polyToken.getBalanceOf(providerAddress),
      this.getNewKYCProviderFee(),
    ]);

    // TODO: Set up a way to do this on all functions that require fees.
    if (balance.lessThan(fee)) {
      throw new InsufficientBalanceError('newKYCProvider', fee);
    } else if (allowance.lessThan(fee)) {
      throw new InsufficientAllowanceError('newKYCProvider', fee);
    }

    await this._contract.newProvider(
      providerAddress,
      name,
      detailsHash,
      verificationFee,
      { from: providerAddress, gas: 300000 },
    );
  }

  /**
   * As a KYC provider, changes your fee per customer verification.
   * @param  kycProviderAddress The Ethereum address of the KYC provider account
   * @param  newVerificationFee The new fee in base units of POLY per customer verification
   */
  async changeVerificationFee(
    kycProviderAddress: string,
    newVerificationFee: BigNumber,
  ) {
    await this._contract.changeFee(newVerificationFee, {
      from: kycProviderAddress,
    });
  }

  /**
   * Submit an on-chain record that you have verified a customer's information.
   * @param  kycProviderAddress The Ethereum address of your KYC provider account
   * @param  customerAddress    The Ethereum address of the customer you verified
   * @param  jurisdiction       The customer's jurisdiction that you verified. Either an ISO 3166-1 alpha-2 country code or an ISO 3166-2 country subdivision code.
   * @param  role               The type of Polymath user that the customer is (e.g. investor)
   * @param  accredited         Whether the customer is accredited
   * @param  expires            The time at which this verification should expire, in seconds since the Unix epoch
   */
  async verifyCustomer(
    // ownerAddress: string,
    kycProviderAddress: string,
    customerAddress: string,
    jurisdiction: string,
    role: CustomerRole,
    accredited: boolean,
    expires: BigNumber,
  ) {
    await this._contract.verifyCustomer(
      customerAddress,
      Web3.prototype.fromAscii(jurisdiction),
      new BigNumber(roleToNumber(role)),
      accredited,
      expires,
      {
        from: kycProviderAddress,
        gas: 2500000,
      },
    );
  }

  /**
   * Used to withdraw POLY from the contract to owner account
   * @param  ownerAddress
   * @param  addressToSendTo
   */
  async withdrawReservePoly(ownerAddress: string, addressToSendTo: string) {
    await this._contract.withdrawReservePoly(addressToSendTo, {
      from: ownerAddress,
    });
  }

  /**
   * Use to change the Registeration fee for Providers to register on platform
   * @param  ownerAddress
   * @param  newFee
   */
  async changeRegisterationFee(ownerAddress: string, newFee: number) {
    await this._contract.changeRegisterationFee(newFee, {
      from: ownerAddress,
    });
  }

  /**
   * Owner change the flag active to true or false
   * @param  ownerAddress
   * @param  providerList
   * @param  providerStatus
   */
  async changeStatusOfKYC(
    ownerAddress: string,
    providerList: Array<string>,
    providerStatus: Array<boolean>,
  ) {
    await this._contract.changeStatus(providerList, providerStatus, {
      from: ownerAddress,
    });
  }

  /**
   * Retrieve a Polymath user by their associated KYC provider and their Ethereum address. Users can be associated with multiple KYC providers.
   * @param  kycProviderAddress The Ethereum address of the associated KYC provider
   * @param  customerAddress    The Ethereum address of the user you're looking up
   * @return The user's `Customer` object
   */
  async getCustomer(
    kycProviderAddress: string,
    customerAddress: string,
  ): Promise<?Customer> {
    const customer = await this._contract.getCustomer.call(
      kycProviderAddress,
      customerAddress,
    );

    // Check if the role is 0. If so, the customer didn't exist.
    if (customer[2].equals(0)) {
      return null;
    }

    const role = numberToRole(customer[2].toNumber());

    if (role == null) {
      throw new Error('Unrecognized customer role.');
    }

    return {
      jurisdiction: Web3.prototype.toAscii(customer[0]).replace(/\u0000/g, ''),
      accredited: customer[1],
      role,
      verified: customer[3],
      expires: customer[4],
    };
  }
}
