const Hasher = require(process.cwd() + '/server/string/Hasher.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');
const Room = require(process.cwd() + '/server/game/Room.js');

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

      // Default socket.io actions
      socket.on('disconnect', () => { this.onDisconnect(socket); });
      socket.on('disconnecting', () => { this.onDisconnecting(socket); });
      // Custom actions
      socket.on('userAttemptCreateRoom', (data) => { this.userAttemptCreateRoom(socket, data) });
      socket.on('userAttemptJoinRoom', (data) => { this.userAttemptJoinRoom(socket, data) });
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

  // Attempts to create a room for a user using the given socket and data.
  //
  // Expected data format:
  //  {
  //    string username
  //  }
  userAttemptCreateRoom(socket, data) {
    Logger.logInfo('userAttemptCreateRoom');
  }

  // Attempts to join a user to a room using the given socket and data.
  //
  // Expected data format:
  //  {
  //    string username,
  //    string roomCode
  //  }
  userAttemptJoinRoom(socket, data) {
    Logger.logInfo('userAttemptJoinRoom');
  }
}

module.exports = RoomPool;
