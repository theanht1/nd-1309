# RESTful web API with Node.js Framework

Building RESTful web API with Node.js framework that will interface with the private blockchain.

### Web framework and endpoint
* I chose Express.js for its simplicity and flexibility
* Endpoints
  1. GET `http://localhost:8000/block/{BLOCK_HEIGHT}`
    Get block at block height
  2. POST `http://localhost:8000/block`
    Create new block with star information
  3. POST `http://localhost:8000/requestValidation`
    Make validation request
  4. POST `http://localhost:8000/message-signature/validate`
    Validate signature for message return from API 3
  5. GET `http://localhost:8000/stars/hash:[HASH]`
    Get block by hash
  6. GET `http://localhost:8000/stars/address:[ADDRESS]`
    Get blocks by address

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

# Request validation
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}'

# Validate signature
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": [SIGNED_MESSAGE]
}'

# Create block
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```
