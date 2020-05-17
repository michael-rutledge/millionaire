const Hasher = require(process.cwd() + '/server/string/Hasher.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');
const Room = require(process.cwd() + '/server/game/Room.js');
const SafeSocket = require(process.cwd() + '/server/socket/SafeSocket.js');

const ROOM_CODE_LENGTH = 4;

// Holds all active Rooms of Millionaire With Friends and handles socket communication between
// clients and their respective Rooms.
class RoomPool {

  // Constructs a new RoomPool and sets listeners and emitters from the given socket.io instance.
  constructor(socketIoInstance) {
    this.rooms = {};

    SafeSocket.socketsOn(socketIoInstance, 'connection', (socket) => {
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


  // PRIVATE METHODS

  // Attempts to add a user identified by the given username and socket to the room identified by
  // the given room code.
  //
  // Returns true if successful, false if unsuccessful.
  _addUserToRoom(socket, username, roomCode) {
    if (!this.roomExists(roomCode)) {
      return false;
    }

    return this.rooms[roomCode].addUser(socket, username);
  }


  // PUBLIC METHODS

  // Returns the number of active rooms within the RoomPool.
  getNumRooms() {
    return Object.keys(this.rooms).length;
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


  // LISTENERS

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
    if (!data || data.username.length < 1) {
      Logger.logWarning('Socket ' + socket.id + ' gave invalid data when creating new Room');
      SafeSocket.emit(socket, 'userCreateRoomFailue', {
        reason: 'Invalid data'
      });
      return;
    }

    var newRoomCode = this.reserveNewRoom();
    Logger.logInfo('New room code generated: ' + newRoomCode);
    if (this._addUserToRoom(socket, data.username, newRoomCode)) {
      SafeSocket.emit(socket, 'userCreateRoomSuccess', {
        username: data.username,
        roomCode: newRoomCode
      });
    } else {
      Logger.logWarning('Socket ' + socket.id + ' failed to create new Room: ' + newRoomCode);
      SafeSocket.emit(socket, 'userCreateRoomFailure', {
        reason: 'Unknown Room creation failure'
      });
    }
  }

  // Attempts to join a user to a room using the given socket and data.
  //
  // Expected data format:
  //  {
  //    string username,
  //    string roomCode
  //  }
  userAttemptJoinRoom(socket, data) {
    // TODO: implement this.
    Logger.logInfo('userAttemptJoinRoom');
  }
}

module.exports = RoomPool;
