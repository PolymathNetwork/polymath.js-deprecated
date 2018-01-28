const PolyToken = artifacts.require('./PolyToken.sol');
const Compliance = artifacts.require('./Compliance.sol');
const Customers = artifacts.require('./Customers.sol');
const SecurityTokenRegistrar = artifacts.require(
  './SecurityTokenRegistrar.sol'
);

module.exports = (deployer, network) => {
  console.log(`Deploying Polymath Network Smart contracts to ${network}...`);

  // async/await syntax does NOT work here because truffle-deployer returns some
  // weird thing that looks like a promise but has a `then` method with side
  // effects.
  return deployer.deploy(PolyToken).then(() => {
    return deployer.deploy(Customers, PolyToken.address);
  }).then(() => {
    return deployer.deploy(Compliance, Customers.address);
  }).then(() => {
    return deployer.deploy(
      SecurityTokenRegistrar,
      PolyToken.address,
      Customers.address,
      Compliance.address
    );
  });

  console.log(`\nPolymath Network Smart Contracts Deployed:\n
    PolyToken: ${PolyToken.address}\n
    Compliance: ${Compliance.address}\n
    Customers: ${Customers.address}\n
    SecurityTokenRegistrar: ${SecurityTokenRegistrar.address}\n
  `);
};
