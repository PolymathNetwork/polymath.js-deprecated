<a href="https://t.me/polymathnetwork"><img src="https://img.shields.io/badge/50k+-telegram-blue.svg" target="_blank"></a>
[![Build Status](https://travis-ci.org/PolymathNetwork/polymath.js.svg?branch=master)](https://travis-ci.org/PolymathNetwork/polymath.js)
[![Known Vulnerabilities](https://snyk.io/test/github/priom/polymath.js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/priom/polymath.js?targetFile=package.json)

![Polymath](Polymath.png)

# Polymath.js

Polymath.js is the main library for interacting with Polymath's smart contracts. It is written in javascript using flow, babel and eslint. The documentation is automatically generated using documentationjs. Checkout the [docs](https://docs.polymath.network)

[Read the whitepaper](whitepaper.pdf)

## Testing locally

Clone the repo, then run
- `yarn install`
- `yarn testrpc` (keep this terminal running)

In a new terminal
- `yarn compile`
- `yarn migrate-testrpc`
- `yarn start `(babel compiling) (keep this terminal running)

In a new terminal
- `yarn test` to test all files
- `yarn mocha lib/test/{FILENAME.js}` to test a single file

Note: If make changes to source files being compiled by babel, run `yarn clean` to remove the old compiled babel files, and then run `yarn start` to get an updated version with the new code.

## Updating the contracts

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
