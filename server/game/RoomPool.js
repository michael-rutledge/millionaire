const Hasher = require(process.cwd() + '/server/string/Hasher.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');
const Room = require(process.cwd() + '/server/game/Room.js');
const SafeSocket = require(process.cwd() + '/server/socket/SafeSocket.js');
const StringSanitizer = require(process.cwd() + '/server/string/StringSanitizer.js');

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
      socket.on('disconnecting', () => { this.playerAttemptLeaveRoom(socket, {}); });
      // Custom actions
      socket.on('hostAttemptEndGame', (data) => { this.hostAttemptEndGame(socket, data) });
      socket.on('hostAttemptStartGame', (data) => { this.hostAttemptStartGame(socket, data) });
      socket.on('playerAttemptCreateRoom', (data) => {
        this.playerAttemptCreateRoom(socket, data)
      });
      socket.on('playerAttemptJoinRoom', (data) => { this.playerAttemptJoinRoom(socket, data) });
      socket.on('playerAttemptLeaveRoom', (data) => { this.playerAttemptLeaveRoom(socket, data) });
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

  // Returns the room code associated with the given socket.
  //
  // Returns undefined if none exists.
  _getRoomCodeFromSocket(socket) {
    if (socket && socket.rooms) {
      return socket.rooms[Object.keys(socket.rooms)[1]];
    }

    return undefined;
  }

  // Returns the sanitized username from the given data object.
  //
  // Returns empty string if unsuccessful.
  _getSanitizedUsername(data) {
    if (!data || !data.username) {
      return "";
    }

    return StringSanitizer.getHtmlSanitized(data.username);
  }


  // PUBLIC METHODS

  // Returns the number of active rooms within the RoomPool.
  getNumRooms() {
    return Object.keys(this.rooms).length;
  }

  // Returns the room associated with the given room code.
  getRoom(roomCode) {
    return this.rooms[roomCode];
  }

  // Removes the Room associated with the given room code from the pool.
  removeRoom(roomCode) {
    Logger.logInfo('Removing room: ' + roomCode);
    delete this.rooms[roomCode];
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


  // SOCKET LISTENERS

  // Attempts to end a game for the Room associated with the given socket.
  hostAttemptEndGame(socket, data) {
    Logger.logInfo('Socket ' + socket.id + ' attempting to end game');
    var roomCode = this._getRoomCodeFromSocket(socket);

    if (this.roomExists(roomCode)) {
      var room = this.getRoom(roomCode);
      if (room.attemptEndGame(socket)) {
        Logger.logInfo('Game at room ' + roomCode + ' ended');
        room.playerMap.emitCustomToAll('hostEndGameSuccess', (socket) => {
          return {
            thisClientIsHost: room.socketIsHost(socket)
          }
        });
        room.playerMap.emitCustomToAll('updateLobby', (socket) => {
          return room.getLobbyData(socket);
        });
      } else {
        Logger.logWarning('Socket ' + socket.id + ' failed to end game');
        socket.emit('hostEndGameFailure', {
          reason: 'room.attemptEndGame() failed'
        });
      }
    } else {
      Logger.logWarning('Socket ' + socket.id + ' failed to end game');
      socket.emit('hostEndGameFailure', {
        reason: 'Room does not exist'
      });
    }
  }

  // Attempts to start a game for the Room associated with the given socket.
  //
  // Expected data format for data:
  // {
  //   obj    gameOptions {
  //     string: showHostUsername
  //   }
  // }
  hostAttemptStartGame(socket, data) {
    Logger.logInfo('Socket ' + socket.id + ' attempting to start game');
    var roomCode = this._getRoomCodeFromSocket(socket);

    if (this.roomExists(roomCode)) {
      var room = this.getRoom(roomCode);
      if (room.attemptStartGame(socket, data.gameOptions)) {
        Logger.logInfo('Game at room ' + roomCode + ' started');
        room.playerMap.emitCustomToAll('hostStartGameSuccess', (socket) => {
            return {
              thisClientIsHost: room.socketIsHost(socket)
            }
          });
      } else {
        Logger.logWarning('Socket ' + socket.id + ' failed to start game');
        socket.emit('hostStartGameFailure', {
          reason: 'room.attemptStartGame() failed'
        });
      }
    } else {
      Logger.logWarning('Socket ' + socket.id + ' failed to start game');
      socket.emit('hostStartGameFailure', {
        reason: 'Room does not exist'
      });
    }
  }

  // Executes desired actions upon finished disconnect of the given socket.
  onDisconnect(socket) {
    Logger.logInfo('socket ' + socket.id + ' disconnected');
  }

  // Attempts to create a room as requested by the Player indentified by the given socket and data.
  //
  // Expected data format:
  //  {
  //    string username
  //  }
  playerAttemptCreateRoom(socket, data) {
    var username = this._getSanitizedUsername(data);

    if (username.length < 1) {
      Logger.logWarning('Socket ' + socket.id + ' gave invalid data when creating new Room');
      SafeSocket.emit(socket, 'playerCreateRoomFailure', {
        reason: 'Invalid data'
      });
      return;
    }

    var newRoomCode = this.reserveNewRoom();
    Logger.logInfo('New room code generated: ' + newRoomCode);

    if (this._addPlayerToRoom(socket, username, newRoomCode)) {
      Logger.logInfo('Socket ' + socket.id + ' created and joined room: ' + newRoomCode);
      SafeSocket.join(socket, newRoomCode, () => {
        SafeSocket.emit(socket, 'playerCreateRoomSuccess', {
          username: username,
          roomCode: newRoomCode
        });
        this.getRoom(newRoomCode).playerMap.emitCustomToAll('updateLobby', (socket) => {
          return this.getRoom(newRoomCode).getLobbyData(socket);
        });
      });
    } else {
      Logger.logWarning('Socket ' + socket.id + ' failed to create new Room: ' + newRoomCode);
      this.removeRoom(newRoomCode);
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
    var username = this._getSanitizedUsername(data);

    if (username.length < 1) {
      Logger.logWarning('Socket ' + socket.id + ' gave invalid data when joining room ' +
          data.roomCode);
      SafeSocket.emit(socket, 'playerJoinRoomFailure', {
        reason: 'Invalid data'
      });
      return;
    }

    if (this._addPlayerToRoom(socket, username, data.roomCode)) {
      Logger.logInfo('Socket ' + socket.id + ' joined room: ' + data.roomCode);
      SafeSocket.join(socket, data.roomCode, () => {
        SafeSocket.emit(socket, 'playerJoinRoomSuccess', {
          username: username,
          roomCode: data.roomCode
        });
        this.getRoom(data.roomCode).playerMap.emitCustomToAll('updateLobby', (socket) => {
          return this.getRoom(data.roomCode).getLobbyData(socket);
        });
      });
    } else {
      Logger.logWarning('Socket ' + socket.id + ' failed to join room ' + data.roomCode);
      SafeSocket.emit(socket, 'playerJoinRoomFailure', {
        reason: 'Room code does not exist or username already exists in Room'
      });
    }
  }

  // Attempts to disconnect the player from their respective room.
  //
  // If the room no longer has any socket connections, remove it.
  playerAttemptLeaveRoom(socket, data) {
    Logger.logInfo('socket ' + socket.id + ' disconnecting...');
    var roomCode = this._getRoomCodeFromSocket(socket);

    if (this.roomExists(roomCode)) {
      this.getRoom(roomCode).disconnectPlayer(socket);
      socket.leave(roomCode, () =>  {
        socket.emit('playerLeaveRoomSuccess', {});
      });
      this.getRoom(roomCode).playerMap.emitCustomToAll('updateLobby', (socket) => {
          return this.getRoom(roomCode).getLobbyData(socket);
        });
    } else {
      socket.emit('playerLeaveRoomFailure', {
        reason: 'Room does not exist'
      });
      return;
    }

    if (this.getRoom(roomCode).socketsEmpty()) {
      this.removeRoom(roomCode);
    }
  }
}

module.exports = RoomPool;
