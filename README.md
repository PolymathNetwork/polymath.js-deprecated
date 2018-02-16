<a href="https://t.me/polymathnetwork"><img src="https://img.shields.io/badge/50k+-telegram-blue.svg" target="_blank"></a>
[![Build Status](https://travis-ci.org/PolymathNetwork/polymath.js.svg?branch=master)](https://travis-ci.org/PolymathNetwork/polymath.js)
[![Known Vulnerabilities](https://snyk.io/test/github/priom/polymath.js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/priom/polymath.js?targetFile=package.json)

![Polymath](Polymath.png)

# Polymath.js

Polymath.js is the main library for interacting with Polymath's smart contracts on the client side. It is written in javascript using flow, babel and eslint. The documentation is automatically generated using documentationjs. Checkout the [docs](https://docs.polymath.network)

[Read the whitepaper](whitepaper.pdf)


## How to Use the Polymath.js Library

The best way to use Polymath.js is to download the [polymathjs npm module](https://www.npmjs.com/package/polymathjs). Go into your project and run `npm install polymathjs`. Once you do that, you can check out the docs at https://docs.polymath.network to see decriptions of every single function call in the library.

There is an example client side app located at https://github.com/PolymathNetwork/example-app-polymathjs. It is built with create-react-app, and shows how you would wire up your project in order to use the library to make calls to the ropsten testnet and mainnet polymath core contracts. (Please note, polymathjs will work on the client side only).

The polymath.js library will automatically figure out which network you are on in the browser when you are connected through metamask. If you select mainnet or ropsten, it will connect to the correct contracts, just make sure you have ether to be able to test the function calls.

Currently polymathjs is connected to the v1 launched instances of the polymath core contracts for both ropsten and mainnet. Please see the contract addresses below:


## V1 on Ethereum Mainnet

| Contract                                                         | Address                                                                                                                       |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [PolyToken](./contracts/PolyToken.sol)                           | [0x9992eC3cF6A55b00978cdDF2b27BC6882d88D1eC](https://ropsten.etherscan.io/address/0x9992eC3cF6A55b00978cdDF2b27BC6882d88D1eC) |
| [Compliance](./contracts/Compliance.sol)                         | [0x076719c05961a0c3398e558e2199085d32717ca6](https://ropsten.etherscan.io/address/0x076719c05961a0c3398e558e2199085d32717ca6) |
| [Customers](./contracts/Customers.sol)                           | [0xeb30a60c199664ab84dec3f8b72de3badf1837f5](https://ropsten.etherscan.io/address/0xeb30a60c199664ab84dec3f8b72de3badf1837f5) |
| [SecurityTokenRegistrar](./contracts/SecurityTokenRegistrar.sol) | [0x56e30b617c8b4798955b6be6fec706de91352ed0](https://ropsten.etherscan.io/address/0x56e30b617c8b4798955b6be6fec706de91352ed0) |


## V1 on Ropsten testnet

| Contract                                                         | Address                                                                                                                       |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [PolyToken](./contracts/PolyToken.sol)                           | [0x96a62428509002a7ae5f6ad29e4750d852a3f3d7](https://ropsten.etherscan.io/address/0x96a62428509002a7ae5f6ad29e4750d852a3f3d7) |
| [Compliance](./contracts/Compliance.sol)                         | [0x238aa304fd1331a591c63e624453f4aeb08bc4b0](https://ropsten.etherscan.io/address/0x238aa304fd1331a591c63e624453f4aeb08bc4b0) |
| [Customers](./contracts/Customers.sol)                           | [0x9d27f258663957f13fd2804b6c985797b8ca132e](https://ropsten.etherscan.io/address/0x9d27f258663957f13fd2804b6c985797b8ca132e) |
| [SecurityTokenRegistrar](./contracts/SecurityTokenRegistrar.sol) | [0x7eD744cdE284417740bCF758795d54dd14DD08dA](https://ropsten.etherscan.io/address/0x7eD744cdE284417740bCF758795d54dd14DD08dA) |



If you want to use testrpc for faster testing with the polymath contracts, you will have to clone this github repo in order to properly migrate the contracts to your testrpc. Once you clone this repo, you can run the following steps to get the contracts migrated to the testrpc:

- `yarn install` to install the npm modules
- `yarn testrpc` (keep this terminal running. This command is a custom npm script to set up an easier dev environment, see the package.json for more details on the ganache cli custom npm script)

In a new terminal
- `yarn compile` to compile the contracts and create truffle artifacts (ensure the testrpc stuff will still work)
- `yarn migrate-testrpc` to migrate the contracts onto your testrpc

Then you can use metamask to connected to localhost:8545. You will have to import the private keys from the testrpc into metamask. if you use `yarn testrpc` to start testrpc, then it will use the same 10 private keys everytime, which will be located in the terminal. They will be pre loaded with testrpc ether.

## Contributing

We're always looking for developers to join the polymath network. To do so we
encourage developers to contribute by creating Security Token Offering contracts
(STO) which can be used by issuers to raise funds. If your contract is used, you
can earn POLY fees directly through the contract, and additional bonuses through
the Polymath reserve fund.

If you would like to apply directly to our STO contract development team, please
send your resume and/or portfolio to careers@polymath.network.

Please also see the [contributing file](CONTRIBUTING.md) if you want to help with working on the polymathjs library source code!

### Styleguide

The polymath-core repo follows the style guide overviewed here:
http://solidity.readthedocs.io/en/develop/style-guide.html

[polymath]: https://polymath.network
[ethereum]: https://www.ethereum.org/
[solidity]: https://solidity.readthedocs.io/en/develop/
[truffle]: http://truffleframework.com/
[testrpc]: https://github.com/ethereumjs/testrpc
