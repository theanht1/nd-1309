const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');


let mnemonic = null;

if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
  ({ mnemonic } = secrets);
}

module.exports = {
  networks: {
    mainnet: {
      provider: new HDWalletProvider(mnemonic, 'https://mainnet.infura.io'),
      network_id: '1',
      gas: 4500000,
      gasPrice: 10000000000,
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000,
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000,
    },
    ganache: {
      provider: new HDWalletProvider(mnemonic, 'http://localhost:8545'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000,
    },
  },
};

