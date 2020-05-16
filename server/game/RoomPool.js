const Hasher = require(process.cwd() + '/server/string/Hasher.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');
const Room = require(process.cwd() + '/server/game/Room.js');

const ROOM_CODE_LENGTH= 4;

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

  // Attempts to add a user identified by the given username and socket to the room identified by
  // the given room code.
  addUserToRoom(socket, username, roomCode) {
    // TODO: implement this.
  }

  // Reserves a new room with a new, random, and unused room code.
  //
  // Returns the new room code.
  reserveNewRoom() {
    var newRoomCode;

    do {
      newRoomCode = Hasher.genHash(ROOM_CODE_LENGTH);
    } while(this.roomExists(newRoomCode));

    this.rooms[newRoomCode] = new Room(newRoomCode);
    return newRoomCode;
  }

  // Returns whether a room exists for the given room code.
  roomExists(roomCode) {
    return this.rooms.hasOwnProperty(roomCode);
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
    // TODO: report failure back to user
    if (!data || data.username.length < 1) { return; }
    var newRoomCode = this.reserveNewRoom();
    Logger.logInfo('new room code generated: ' + newRoomCode);
    this.addUserToRoom(socket, data.username, newRoomCode);
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
