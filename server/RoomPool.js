const Logger = require('./Logger.js');
const Room = require('./Room.js');

// Holds all active rooms of Millionaire With Friends.
class RoomPool {

  // Constructs a new RoomPool and sets listeners and emitters from the given socket.io instance.
  constructor(socketIoInstance) {
    this.rooms = {};

    socketIoInstance.sockets.on('connection', (socket) => {
      Logger.logInfo('socket ' + socket.id + ' connected');

      socket.emit('clientConnectedToServer', {
        socketId: socket.id
      });

      socket.on('disconnect', () => { this.onDisconnect(socket); });
      socket.on('disconnecting', () => { this.onDisconnecting(socket); });
    });
  }

  // Executes desired actions upon finished disconnect of the given socket.
  onDisconnect(socket) {
    Logger.logInfo('socket ' + socket.id + ' disconnected...');
  }

  // Executes desired actions upon disconnecting the given socket.
  onDisconnecting(socket) {
    Logger.logInfo('socket ' + socket.id + ' disconnecting');
  }
}

module.exports = RoomPool;
