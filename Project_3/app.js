const express = require('express');
const bodyParser = require('body-parser');
const { Block, Blockchain } = require('./simpleChain.js');

// Init chain
const blockchain = new Blockchain();

// Init app
const app = express();
// Middleware to parse body
app.use(bodyParser.json());

/* Routes defination */
// Get block at heighy
app.get('/block/:blockHeight', async ({ params: { blockHeight } }, res) => {
  const block = await blockchain.getBlock(blockHeight);
  if (!block) {
    return res.json({ error: 'Block not found' });
  }
  return res.json(block);
});

// Create new block
app.post('/block', async ({ body: { body } }, res) => {
  const newBlock = await blockchain.addBlock(new Block(body));
  if (!newBlock) {
    return res.json({ error: 'Block not created' });
  }
  return res.json(newBlock);
});

app.listen(8000, () => {
  console.log('App listening on port 8000');
});
