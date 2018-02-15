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

If you want to use testrpc for faster testing with the polymath contracts, you will have to clone this github repo in order to properly migrate the contracts to your testrpc. Once you clone this repo, you can run the following steps to get the contracts migrated to the testrpc:

- `yarn install` to install the npm modules
- `yarn testrpc` (keep this terminal running. This command is a custom npm script to set up an easier dev environment, see the package.json for more details on the ganache cli custom npm script)

In a new terminal
- `yarn compile` to compile the contracts and create truffle artifacts (ensure the testrpc stuff will still work)
- `yarn migrate-testrpc` to migrate the contracts onto your testrpc

Then you can use metamask to connected to localhost:8545. You will have to import the private keys from the testrpc into metamask. if you use `yarn testrpc` to start testrpc, then it will use the same 10 private keys everytime, which will be located in the terminal. They will be pre loaded with testrpc ether.


## Developement Testing on local machine with truffle and mocha

For testing polymathjs source code, clone this repo, then run the following commands. This will set up the environment to run tests on the polymath.js library functionality.

- `yarn prepack`to compile the javascript down to vanilla javascript
- `yarn testrpc` (keep this terminal running)

In a new terminal
- `yarn compile` to compile the contracts and create truffle artifacts
- `yarn migrate-testrpc` to migrate the contracts onto your testrpc
- `yarn start `(babel compiling) (keep this terminal running)

In a new terminal
- `yarn test` to test all files
- `yarn mocha lib/test/{FILENAME.js}` to test a single file

Note: If make changes to source files being compiled by babel, run `yarn clean` to remove the old compiled babel files, and then run `yarn start` to get an updated version with the new code.

## Updating the polymath core contracts into polymath.js

This should only be done when the npm module is ready to be upgraded to a new version of polymath core on the mainnet. The new contracts should be pulled into polymathjs repo, and then worked on in a branch. Once it is known that polymathjs is correctly working on new core contracts, the npm module can be published to reflect this.

The following occurs:
- Checks that polymath-core is on the master branch
- Executes git pull on the polymath-core
- Copies the polymath-core/contract directory into polymath-js directory
- Removes the polymath-js/build directory

In polymath-js
- `yarn contracts`

Note: Ensure you have the following file structure
```
- polymath (root dir name doesn't matter)
|-- polymath-js
|-- polymath-core
```

## Serving and building documentation

The documentation should be built when the npm module is updated. When you build the docs, the build folder will update, and this repo is connected to netlify which will automatically serve the new documentation to https://docs.polymath.network. So building should only be done when the npm package is ready to upgrade, so that they are in sync.

To serve the docs locally, run:

- `yarn install`
- `yarn start` to run babel to compile the source code and have it watching for updates (leave this terminal open)
- `yarn serve-poly-docs`

To build the docs run `yarn build-poly-docs`. Make sure when you make edits, you rebuild the docs so they are added in!

## Contributing

We're always looking for developers to join the polymath network. To do so we
encourage developers to contribute by creating Security Token Offering contracts
(STO) which can be used by issuers to raise funds. If your contract is used, you
can earn POLY fees directly through the contract, and additional bonuses through
the Polymath reserve fund.

If you would like to apply directly to our STO contract development team, please
send your resume and/or portfolio to careers@polymath.network.

### Styleguide

The polymath-core repo follows the style guide overviewed here:
http://solidity.readthedocs.io/en/develop/style-guide.html

[polymath]: https://polymath.network
[ethereum]: https://www.ethereum.org/
[solidity]: https://solidity.readthedocs.io/en/develop/
[truffle]: http://truffleframework.com/
[testrpc]: https://github.com/ethereumjs/testrpc
