import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Polymath } from 'polymathjs';


class App extends Component {


  componentDidMount() {

    const polymath = new Polymath(window.web3.currentProvider);

    const test = async () => {
      await polymath.initializedPromise;

      /*
       * Test connection to Polytoken contract
       * Mainnet = 0x9992eC3cF6A55b00978cdDF2b27BC6882d88D1eC
       * Ropsten = 0x96a62428509002a7ae5f6ad29e4750d852a3f3d7
      */
      console.log(await polymath.polyToken.getSymbol());
      console.log(await polymath.polyToken.getTotalSupply());

      /*
       * Test connection to SecurityTokenRegistrar contract
       * Mainnet = 0x56e30b617c8b4798955b6be6fec706de91352ed0
       * Ropsten = 	0x86535a0f5d0fa9552295b021ff95bca3fb74f523
      */
      console.log(await polymath.securityTokenRegistrar.getCustomersAddress())

      /*
       * Test connection to Compliance contract
       * Mainnet = 0x076719c05961a0c3398e558e2199085d32717ca6
       * Ropsten = 0xc7cff0abbdb57ed2204077d53836bcfbd05fe474
      */
     console.log(await polymath.compliance.getTemplateReputation('0xc7cff0abbdb57ed2204077d53836bcfbd05fe474')) //should return null struct TemplateReputation


           /*
       * Test connection to Customers contract
       * Mainnet = 	0xeb30a60c199664ab84dec3f8b72de3badf1837f5
       * Ropsten = 	0x6ae8cb236a2badec68c030c9cef252a68989002f
      */
     console.log(await polymath.customers.getKYCProviderByAddress('0xc7cff0abbdb57ed2204077d53836bcfbd05fe474')) //should return null



    }

    test()


  }


  render() {



    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;



