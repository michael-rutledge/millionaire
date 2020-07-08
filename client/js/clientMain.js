// This file is the clientside entry point for Millionaire With Friends.

const AppClient = require('./game/AppClient.js');

// Socket setup.
const socket = io();

// Ensures no repeat emissions are made from the client while their emission is processing.
socket.safeEmit = (message, data) => {
  if (!socket.emitting) {
    socket.emitting = true;
    socket.emit(message, data);
  }
};

// Instantiating an AppClient readies the game.
const appClient = new AppClient(socket, document, window);
