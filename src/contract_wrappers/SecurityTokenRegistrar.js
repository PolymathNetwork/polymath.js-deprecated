// @flow

import { Web3Wrapper } from '@0xproject/web3-wrapper';

import ContractWrapper from './ContractWrapper';
import Compliance from './Compliance';
import Customers from './Customers';
import PolyToken from './PolyToken';

import securityTokenRegistrarArtifact from '../artifacts/SecurityTokenRegistrar.json';

/**
 * Wrapper for the SecurityTokenRegistrar Solidity contract
 */
export default class SecurityTokenRegistrar extends ContractWrapper {
  polyToken: PolyToken;
  customers: Customers;
  compliance: Compliance;

  /**
   * @hideconstructor
   */
  constructor(
    web3Wrapper: Web3Wrapper,
    polyToken: PolyToken,
    customers: Customers,
    compliance: Compliance,
    deployedAddress?: string,
  ) {
    super(web3Wrapper, securityTokenRegistrarArtifact, deployedAddress);

    this.polyToken = polyToken;
    this.customers = customers;
    this.compliance = compliance;
  }
}
