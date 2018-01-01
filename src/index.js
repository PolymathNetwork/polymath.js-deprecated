// @flow
/* eslint-disable */

// import { ContractNotFoundError } from './types';
import type { PolymathConfig, Web3Provider } from './types';

/** Polymath class
 * @param provider The web3 provider
 */
// eslint-disable-next-line import/prefer-default-export
export class Polymath {
  constructor(provider: Web3Provider, config: ?PolymathConfig) {
    config =
      config != null
        ? config
        : {
            networkId: 1,
          };
  }
}
