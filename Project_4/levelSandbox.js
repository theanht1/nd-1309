/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Key to store db length
const DB_LENGTH_KEY = 'LENGTH';

// Init database
function initDB() {
  return db.put(DB_LENGTH_KEY, 0);
}

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  return db.batch()
    .put(key, value)
    .put(DB_LENGTH_KEY, Number(key) + 1)
    .write();
}

// Get data from levelDB with key
function getLevelDBData(key) {
  return db.get(key).catch(err => console.log(err));
}

// Get number of key in db
function getDBLength() {
  return new Promise(function(resolve, reject) {
    db.get(DB_LENGTH_KEY)
      .then(height => resolve(height))
      .catch(err => {
        if (err.notFound) {
          resolve(0);
        } else {
          reject(err);
        }
      });
  })
}

// Add data to levelDB with value
async function addDataToLevelDB(value) {
  const height = await getDBLength().catch(error => {
    console.log('Can not get db length', error);
  });
  console.log('Block #' + height);
  return addLevelDBData(height, value);
}

// Add other (not chain) data to levelDB
function addNonChainData(key, value) {
  return db.batch()
    .put(key, value)
    .write();
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);

// Export db functions
module.exports = {
  initDB,
  getDBLength,
  getLevelDBData,
  addDataToLevelDB,
  addNonChainData,
};
