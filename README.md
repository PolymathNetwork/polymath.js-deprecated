[![Build Status](https://travis-ci.com/PolymathNetwork/polymath-core.svg?token=Urvmqzpy4pAxp6EpzZd6&branch=master)](https://travis-ci.com/PolymathNetwork/polymath.js)
<a href="https://t.me/polymathnetwork"><img src="https://img.shields.io/badge/50k+-telegram-blue.svg" target="_blank"></a>

<!--img src="https://img.shields.io/badge/bounties-1,000,000-green.svg" href="/issues-->

![Polymath](Polymath.png)

# Polymath.js

Polymath.js is the main library for interacting with Polymath's smart contracts. It is written in javascript using flow, babel and eslint. The documentation is automatically generated using documentationjs. See the docs here(insert link when live).

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

## Serving and building documentation

- `yarn start` to run babel to compile the source code
- `yarn docs-copy-babel-ignored` to copy the ignored files into the /lib folder

Then choose to serve or build with the following commands:
- `yarn docs-serve` - served on localhost:4001
- `yarn docs-build` files will output to /docs folder

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

