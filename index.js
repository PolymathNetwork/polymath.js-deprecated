'use strict';

let ethers = require('ethers');

/*
Pieces to have:
- getUsers
  - Gets all users in the system (sort by date added, date verified).
- getIssuances
  - Gets list of all issuances, their statues, and related docs
- getDelegates
  - List of all delegates and related fields.
- getKYCProviders
  - List of KYC providers
- getDevelopers
  - List of developers
- getIssuanceInfo
  - All info that can be found about issuance, include details about token ownership

Utilities:
(X) Hashing
- Encryption
- IPFS (stretch goal, integration for docs)

 */

module.exports = {
  parseHexStringTo256: function(str) {
    let result = [];
    while (str.length >= 8) {
      if(str.substring(0, 2) === '0x') {
        str = str.substring(2, str.length);
        continue;
      }

      result.push(parseInt(str.substring(0, 2), 16));
      str = str.substring(2, str.length);
    }

    return result;
  },

  hash: function (contents) {
    let buf = new Buffer(contents);
    return ethers.utils.keccak256(buf);
  },

  combineHashes: function(left, right) {

    let combined = ethers.utils.toUtf8Bytes(left + right);

    return combined;

  }
}