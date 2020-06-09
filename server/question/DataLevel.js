const PROD = 0;
const DEV = 1;

// Returns the data level we are at for question db.
function getDataLevel() {
  if (process.argv.includes('data_level:dev')) {
    return DEV;
  }

  return PROD;
}

const LEVEL = getDataLevel();

// Returns whether the current build is dev or not.
function isDev() {
  return LEVEL == DEV;
}

module.exports.PROD = PROD;
module.exports.DEV = DEV;
module.exports.LEVEL = LEVEL;
module.exports.isDev = isDev;