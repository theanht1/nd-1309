const express = require('express');
const bodyParser = require('body-parser');
const bitcoinMessage = require('bitcoinjs-message');

const { addNonChainData, getLevelDBData, getDBLength } = require('./levelSandbox');
const { Block, Blockchain } = require('./simpleChain.js');
const VALIDATION_WINDOW = 300;

// Init chain
const blockchain = new Blockchain();

// Init app
const app = express();
// Middleware to parse body
app.use(bodyParser.json());

/* Routes definition */

// Create new block
app.post('/block', async ({
  body: {
    address,
    star,
  },
}, res) => {
  // Validate data
  if (!address || !star || !star.ra || !star.dec || !star.story) {
    return res.status(400).json({ error: 'Invalid information' })
  }

  // Check address validation
  const { registerStar } = JSON.parse(await getLevelDBData(address));
  if (!registerStar) {
    return res.status(401).json({ error: 'Please request validation first' });
  }

  const { dec, ra, story, mag, con } = star;
  const newBlock = await blockchain.addBlock(new Block({
    address,
    star: { dec, ra, story, mag, con }
  }));

  if (!newBlock) {
    return res.json({ error: 'Block not created' });
  }
  return res.json(newBlock);
});

// Request validation
app.post('/requestValidation', async ({
  body: { address },
}, res) => {
  const timeStamp = new Date().getTime();
  const message =  `${address}:${timeStamp}:starRegistry`;

  const result = {
    requestTimeStamp: timeStamp,
    message,
    validationWindow: VALIDATION_WINDOW,
  };

  // Save message to db
  await addNonChainData(address, JSON.stringify(result));

  // Return result
  return res.status(200).json({
    ...result,
    address,
  });
});

// Validate signature
app.post('/message-signature/validate', async ({
  body: { address, signature },
}, res) => {
  const addressInfo = JSON.parse(await getLevelDBData(address));
  const {
    message,
    requestTimeStamp,
    validationWindow,
  } = addressInfo;

  const currentTime = new Date().getTime();
  const remainTime = requestTimeStamp + validationWindow * 1000 - currentTime;
  const status = {
    address,
    validationWindow: Math.trunc(Math.max(remainTime, 0) / 1000),
  };

  // Return false if expired
  if (remainTime < 0) {
    return res.status(400).json({
      registerStar: false,
      status,
    });
  }

  // Return false if signature validation failed
  try {
    if (!bitcoinMessage.verify(message, address, signature)) {
      return res.status(400).json({
        registerStar: false,
        status: {
          ...status,
          messageSignature: 'invalid',
        },
      });
    }
  } catch (e) {
    return res.status(400).json({
      registerStar: false,
      status: {
        ...status,
        messageSignature: 'invalid',
      },
    });
  }

  // Mark as valid address
  await addNonChainData(address, JSON.stringify({
    ...addressInfo,
    registerStar: true,
  }));

  return res.status(200).json({
    registerStar: true,
    status: {
      ...status,
      requestTimeStamp,
      message,
      messageSignature: 'valid',
    },
  });
});

// Get list blocks of an address
app.get('/stars/address::address', async ({ params: { address } }, res) => {
  const nBlock = await getDBLength();
  const blockList = [];
  for (let i = 1; i < nBlock; i++) {
    const block = await blockchain.getBlock(i);
    if (block && block.body && block.body.address === address) {
      blockList.push(block);
    }
  }
  return res.status(200).json(blockList);
});

// Get block by hash
app.get('/stars/hash::hash', async ({ params: { hash } }, res) => {
  const nBlock = await getDBLength();
  for (let i = 1; i < nBlock; i++) {
    const block = await blockchain.getBlock(i);
    if (block && block.hash === hash) {
      return res.status(200).json(block);
    }
  }
  return res.status(404).json({ error: 'Block not found' });
});

// Get block by height
app.get('/block/:blockHeight', async ({ params: { blockHeight } }, res) => {
  const block = await blockchain.getBlock(blockHeight);
  if (!block) {
    return res.json({ error: 'Block not found' });
  }
  return res.json(block);
});

/* End routes */

// Start app
app.listen(8000, () => {
  console.log('App listening on port 8000');
});
