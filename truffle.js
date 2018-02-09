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
    },
    testrpc: {
      host: 'localhost',
      port: 8545,
      network_id: '50',
    },
    mainnet: {
      host: 'localhost',
      port: 1337,
      network_id: '1',
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
