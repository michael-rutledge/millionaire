const GameServer = require(process.cwd() + '/server/game/GameServer.js');
const Player = require(process.cwd() + '/server/game/Player.js');

// Encapsulates a room of Millionaire With Friends.
class Room {

  // Constructs a new Room using the given room code.
  constructor(roomCode) {
    this.roomCode = roomCode;         // Room code (e.g. 'abcd' or 'foo1')
    this.usernameToPlayerMap = {};    // Map of usernames to Players
    this.socketIdToUsernameMap = {};  // Map of socket ids to usernames
    this.host = undefined;            // Reference to host player
    this.gameServer =                 // Game server that will handle game interactions
        new GameServer(this.usernameToPlayerMap, this.socketIdToUsernameMap);
  }


  // PRIVATE METHODS

  // Returns whether the given sock is presently connected to the room.
  _socketExistsInRoom(socket) {
    return this.socketIdToUsernameMap.hasOwnProperty(socket.id);
  }

  // Returns whether the given username is being used in the room.
  _usernameExistsInRoom(username) {
    return this.usernameToPlayerMap.hasOwnProperty(username);
  }


  // PUBLIC METHODS

  // Attempts to add a Player identified by the given information to the current Room.
  //
  // Returns true if successful, false if unsuccessful.
  addPlayer(socket, username) {
    if (!this._usernameExistsInRoom(username) && !this.gameServer.isInGame()) {
      var player = new Player(socket, username);
      this.usernameToPlayerMap[username] = player;
      this.socketIdToUsernameMap[socket.id] = username;
      if (this.host === undefined) {
        this.host = player;
      }
      return true;
    } else if (this._usernameExistsInRoom(username) && this.gameServer.isInGame() &&
               this.getPlayerByUsername(username).socket === undefined) {
      this.getPlayerByUsername(username).socket = socket;
      this.socketIdToUsernameMap[socket.id] = username;
      return true;
    }

    return false;
  }

  // Disconnects the player associated with the given socket.
  //
  // Note that this does not necessarily entail removing the player from the room. A disconnect
  // while the game is running should merely disconnect the socket, making the player appear
  // offline.
  disconnectPlayer(socket) {
    var username = this.getUsernameBySocket(socket);

    if (this._socketExistsInRoom(socket)) {
      var player = this.getPlayerBySocket(socket);
      // Host leaving means a new host is needed.
      if (this.socketIsHost(socket)) {
        this.host = undefined;
        delete this.socketIdToUsernameMap[socket.id];
        this.reassignHost();
        player.socket = undefined;
      } else {
        delete this.socketIdToUsernameMap[socket.id];
        player.socket = undefined;
      }
    }
    if (this._usernameExistsInRoom(username) && !this.gameServer.isInGame()) {
      delete this.usernameToPlayerMap[username];
    }
  }

  // Returns the username associated with the given socket.
  getUsernameBySocket(socket) {
    return this.socketIdToUsernameMap[socket.id];
  }

  // Returns the player associated with the given socket.
  getPlayerBySocket(socket) {
    return this.getPlayerByUsername(this.socketIdToUsernameMap[socket.id]);
  }

  // Returns the player associated with the given username.
  getPlayerByUsername(username) {
    return this.usernameToPlayerMap[username];
  }

  // Assigns the role of room host to a new socket if possible.
  reassignHost() {
    this.host = undefined;
    if (!this.socketsEmpty()) {
      this.host = this.usernameToPlayerMap[
          this.socketIdToUsernameMap[Object.keys(this.socketIdToUsernameMap)[0]]];
    }
  }

  // Returns whether the amount of sockets connected is empty.
  socketsEmpty() {
    return Object.keys(this.socketIdToUsernameMap).length < 1;
  }

  // Returns whether the given socket is the socket of the Room's host.
  socketIsHost(socket) {
    return this._socketExistsInRoom(socket) && this.getPlayerBySocket(socket) == this.host;
  }
}

module.exports = Room;
