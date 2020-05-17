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
      socket.on('playerAttemptCreateRoom', (data) => {
        this.playerAttemptCreateRoom(socket, data)
      });
      socket.on('playerAttemptJoinRoom', (data) => { this.playerAttemptJoinRoom(socket, data) });
    });
  }


  // PRIVATE METHODS

  // Attempts to add a player identified by the given username and socket to the room identified by
  // the given room code.
  //
  // Returns true if successful, false if unsuccessful.
  _addPlayerToRoom(socket, username, roomCode) {
    if (!this.roomExists(roomCode)) {
      return false;
    }

    return this.rooms[roomCode].addPlayer(socket, username);
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

  // Attempts to create a room as requested by the Player indentified by the given socket and data.
  //
  // Expected data format:
  //  {
  //    string username
  //  }
  playerAttemptCreateRoom(socket, data) {
    if (!data || data.username.length < 1) {
      Logger.logWarning('Socket ' + socket.id + ' gave invalid data when creating new Room');
      SafeSocket.emit(socket, 'playerCreateRoomFailue', {
        reason: 'Invalid data'
      });
      return;
    }

    var newRoomCode = this.reserveNewRoom();
    Logger.logInfo('New room code generated: ' + newRoomCode);
    if (this._addPlayerToRoom(socket, data.username, newRoomCode)) {
      SafeSocket.emit(socket, 'playerCreateRoomSuccess', {
        username: data.username,
        roomCode: newRoomCode
      });
    } else {
      Logger.logWarning('Socket ' + socket.id + ' failed to create new Room: ' + newRoomCode);
      SafeSocket.emit(socket, 'playerCreateRoomFailure', {
        reason: 'Unknown Room creation failure'
      });
    }
  }

  // Attempts to join a Player to a room using the given socket and data.
  //
  // Expected data format:
  //  {
  //    string username,
  //    string roomCode
  //  }
  playerAttemptJoinRoom(socket, data) {
    // TODO: implement this.
    Logger.logInfo('playerAttemptJoinRoom');
  }
}

module.exports = RoomPool;
