const getAccounts = async (web3) => {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
};
export default getAccounts;
