# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```

## Testing

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Import blockchain code
```javascript
const { Block, Blockchain } = require('./simpleChain');
```
4: Instantiate blockchain with blockchain variable
```javascript
const blockchain = new Blockchain();
```
5: Generate 10 test blocks
```javascript
blockchain.generateTestBlocks(10);
```
6: Validate blockchain
```javascript
blockchain.validateChain().then(result => console.log(result));
```
7: Get block height
```javascript
blockchain.getBlockHeight();
```
