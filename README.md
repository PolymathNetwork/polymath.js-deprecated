# Polymath.js

Polymath.js is the main library for interacting with Polymath's smart contracts.

## Testing locally

Clone the repo, then
- yarn install
- yarn testrpc (keep running)
In a new terminal
- yarn compile
- yarn migrate-testrpc
- yarn start (babel) (keep running)
In a new terminal
- yarn test

Note: if you are noticing that you fixed a bug and it hasnt changed anything, try deleting the lib folder created by babel, and reruning yarn start. Sometimes the babel files are not updated, and the library points to these files so even if you updated the flow version of js, the babel compiled version may not have been updated.

## Generating documentation

To run the documentationjs docs on localhost with default theme, download documentationjs and run the following command from polymath.js folder:

`documentation serve src/contract_wrappers/`
