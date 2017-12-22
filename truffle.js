module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      host: 'localhost',
      port: 1337,
      network_id: '3',
      // At some point it would be nice not to hard-code this address.
      // In the meantime, get password file from Sukhveer.
      from: '0xb571be0e1876dc43345cfb08e1ad2792f678aefd',
    },
  },
};
