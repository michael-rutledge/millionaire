// This file is the clientside entry point for Millionaire With Friends.

const AppClient = require('./game/AppClient.js');

// Instantiating an AppClient readies the game.
const appClient = new AppClient(io(), document, window);
