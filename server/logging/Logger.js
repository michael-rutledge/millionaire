const colors = require('colors');

const NONE = 0;
const ERROR = 1;
const WARN = 2;
const INFO = 3;

function getDebugLevel() {
  if (process.argv.length < 3) {
    return NONE;
  }

  if (process.argv[2] == 'debug:error') {
    return ERROR;
  } else if (process.argv[2] == 'debug:warn') {
    return WARN;
  } else if (process.argv[2] == 'debug:info') {
    return INFO;
  }

  return NONE;
}

const DEBUG_LEVEL = getDebugLevel();


function logError(message) {
  if (DEBUG_LEVEL >= ERROR) {
    console.log('ERROR: '.red.bold + message);
  }
}

function logWarning(message) {
  if (DEBUG_LEVEL >= WARN) {
    console.log('WARN: '.yellow.bold + message);
  }
}

function logInfo(message) {
  if (DEBUG_LEVEL >= INFO) {
    console.log('INFO: '.cyan.bold + message);
  }
}

// node exports
module.exports.logError = logError;
module.exports.logWarning = logWarning;
module.exports.logInfo = logInfo;
