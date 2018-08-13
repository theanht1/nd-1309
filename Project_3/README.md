# RESTful web API with Node.js Framework

Building RESTful web API with Node.js framework that will interface with the private blockchain.

### Web framework and endpoint
* I chose Express.js for its simplicity and flexibility
* Endpoints
  1. GET `http://localhost:8000/block/{BLOCK_HEIGHT}`
    Get block at block height
  2. POST `http://localhost:8000/block` - with data: `{ body: BLOCK_BODY }` 

### Install and run app

```
# Install npm packages
npm install

# Start server
node app.js
```

### Example
```
# Get block
curl "http://localhost:8000/block/0"

# Create block
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json' \
     -d $'{
  "body": "Testing block with test string data"
}'

```
