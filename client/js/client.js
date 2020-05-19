// This file is the clientside entry point for Millionaire With Friends.

const MillionaireClient = require('./game/MillionaireClient.js');

// Instantiating a MillionaireClient readies the game.
const millionaireClient = new MillionaireClient(io(), document, window);
