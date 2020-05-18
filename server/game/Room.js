const Player = require(process.cwd() + '/server/game/Player.js');

// Encapsulates a room of Millionaire With Friends.
class Room {

  // Constructs a new Room using the given room code.
  constructor(roomCode) {
    this.roomCode = roomCode;         // Room code (e.g. 'abcd' or 'foo1')
    this.usernameToPlayerMap = {};    // Map of usernames to Players
    this.socketIdToUsernameMap = {};  // Map of socket ids to usernames
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
    // TODO: deal with games that are underway (i.e. allow people reconnecting)
    if (!this._usernameExistsInRoom(username)) {
      this.usernameToPlayerMap[username] = new Player(socket, username);
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
    // TODO: deal with games that are underway
    var username = this.getUsernameBySocket(socket);

    if (this._socketExistsInRoom(socket)) {
      delete this.socketIdToUsernameMap[socket.id];
    }
    if (this._usernameExistsInRoom(username)) {
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

  // Returns whether the amount of sockets connected is empty.
  socketsEmpty() {
    return Object.keys(this.socketIdToUsernameMap).length < 1;
  }
}

module.exports = Room;
