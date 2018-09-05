const express = require('express');
const bodyParser = require('body-parser');
const bitcoinMessage = require('bitcoinjs-message');

const { addNonChainData, getLevelDBData } = require('./levelSandbox');
const { Block, Blockchain } = require('./simpleChain.js');
const VALIDATION_WINDOW = 300;

// Init chain
const blockchain = new Blockchain();

// Init app
const app = express();
// Middleware to parse body
app.use(bodyParser.json());

/* Routes definition */
// Get block at heighy
app.get('/block/:blockHeight', async ({ params: { blockHeight } }, res) => {
  const block = await blockchain.getBlock(blockHeight);
  if (!block) {
    return res.json({ error: 'Block not found' });
  }
  return res.json(block);
});

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
/* End routes */

// Start app
app.listen(8000, () => {
  console.log('App listening on port 8000');
});
