const Player = require(process.cwd() + '/server/game/Player.js');

// Encapsulates a room of Millionaire With Friends.
class Room {

  // Constructs a new Room using the given room code.
  constructor(roomCode) {
    this.roomCode = roomCode;   // Room code (e.g. 'abcd' or 'foo1')
    this.playerMap = {};        // Map of socket ids to Players
  }


  // PRIVATE METHODS

  // Returns whether the given username is being used in the room.
  _usernameExistsInRoom(username) {
    for (const socketId in this.playerMap) {
      if (this.playerMap[socketId].username == username) {
        return true;
      }
    }

    return false;
  }


  // PUBLIC METHODS

  // Attempts to add a user identified by the given information to the current Room.
  //
  // Returns true if successful, false if unsuccessful.
  addUser(socket, username) {
    // TODO: deal with games that are underway (i.e. allow people reconnecting)
    if (!this._usernameExistsInRoom(username)) {
      this.playerMap[socket.id] = new Player(socket, username);
      return true;
    }

    return false;
  }
}

module.exports = Room;
