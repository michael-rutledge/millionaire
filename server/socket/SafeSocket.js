// Functions defined here are to allow for safe socket operations within code that will sometimes
// run with empty sockets (e.g. during unit tests).

// Attempts to emit a message from the given socket.
function emit(socket, message, data) {
  if (socket.emit) {
    socket.emit(message, data);
  }
}

// Attempts to set a listener for all sockets for a given socket.io instance.
//
// Typically used to set the 'connection' message.
function socketsOn(socketIoInstance, message, callback) {
  if (socketIoInstance && socketIoInstance.sockets) {
    socketIoInstance.sockets.on(message, callback);
  }
}

module.exports.emit = emit;
module.exports.socketsOn = socketsOn;
