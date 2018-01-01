// @flow

import * as Web3 from 'web3';

/** A Web3 provider */
export type Web3Provider = Web3.Provider;

/** PolymathConfig thing
 * @param networkId The network id
 */
export type PolymathConfig = {
  networkId: number,
};

export class PolymathError extends Error {}

export class ContractNotFoundError extends PolymathError {
  constructor(address: ?string) {
    const message: string =
      address != null
        ? `Could not find contract "${address}".`
        : 'Could not find contract.';
    super(message);
    this.name = 'ContractNotFound';
  }
}
