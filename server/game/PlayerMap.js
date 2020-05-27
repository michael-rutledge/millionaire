// Holds Players by username and socket, thus giving information on their respective statuses.
class PlayerMap {

  constructor() {
    this.usernameToPlayerMap = {};    // Map of usernames to Players
    this.socketIdToUsernameMap = {};  // Map of socket ids to usernames
  }


  // PUBLIC METHODS

  // Returns whether the given socket links to a Player in this PlayerMap.
  containsSocket(socket) {
    return socket !== undefined && this.socketIdToUsernameMap.hasOwnProperty(socket.id);
  }

  // Returns whether the given username links to a Player in this PlayerMap.
  containsUsername(username) {
    return this.usernameToPlayerMap.hasOwnProperty(username);
  }

  // Executes the given function for all Players present in the map.
  //
  // Expected form of func: (player) => {...}
  doAll(func) {
    for (const username in this.usernameToPlayerMap) {
      func(this.getPlayerByUsername(username));
    }
  }

  // Emits a message to all active players in the map, customized using the given data function,
  // which expects a socket as input.
  //
  // Expected form of dataFunc: (socket) => {...}
  emitCustomToAll(message, dataFunc) {
    var activePlayers = this.getActivePlayerList();

    for (var i = 0; i < activePlayers.length; i++) {
      activePlayers[i].socket.emit(message, dataFunc(activePlayers[i].socket));
    }
  }

  // Emits a message to all active Players in the map.
  emitToAll(message, data) {
    var activePlayers = this.getActivePlayerList();

    for (var i = 0; i < activePlayers.length; i++) {
      activePlayers[i].socket.emit(message, data);
    }
  }

  // Returns the count of active Players.
  getActivePlayerCount() {
    return this.getActivePlayerList().length;
  }

  // Returns all active Players present in the map in list form.
  getActivePlayerList() {
    var activePlayers = [];

    for (const username in this.usernameToPlayerMap) {
      if (this.isUsernameActive(username)) {
        activePlayers.push(this.getPlayerByUsername(username));
      }
    }

    return activePlayers;
  }

  // Returns the player associated with the given socket, if it exists.
  //
  // Returns undefined if no such Player exists.
  getPlayerBySocket(socket) {
    if (this.containsSocket(socket)) {
      return this.getPlayerByUsername(this.socketIdToUsernameMap[socket.id]);
    }

    return undefined;
  }

  // Returns the player associated with the given username, if it exists.
  //
  // Returns undefined if no such Player exists.
  getPlayerByUsername(username) {
    if (this.containsUsername(username)) {
      return this.usernameToPlayerMap[username];
    }

    return undefined;
  }

  // Returns the count of all players in the PlayerMap.
  getPlayerCount() {
    return this.getPlayerList().length;
  }

  // Returns all Players present in the map in list form.
  getPlayerList() {
    var activePlayers = [];

    for (const username in this.usernameToPlayerMap) {
      activePlayers.push(this.getPlayerByUsername(username));
    }

    return activePlayers;
  }

  // Returns the username of the Player associated with the given socket.
  //
  // Returns undefined if no such Player exists.
  getUsernameBySocket(socket) {
    if (this.containsSocket(socket)) {
      return this.socketIdToUsernameMap[socket.id];
    }

    return undefined;
  }

  // Returns a list of the usernames present in the PlayerMap.
  getUsernameList() {
    return Object.keys(this.usernameToPlayerMap);
  }

  // Returns whether the given username has an active Player associated with it.
  isUsernameActive(username) {
    return this.containsUsername(username) &&
        this.getPlayerByUsername(username).socket !== undefined;
  }

  // Puts the given Player into the map, overwriting any previous player if present.
  putPlayer(player) {
    if (player.username !== undefined) {
      this.removePlayerByUsername(player.username);
      this.usernameToPlayerMap[player.username] = player;
      if (player.socket !== undefined) {
        this.socketIdToUsernameMap[player.socket.id] = player.username;
      }
    }
  }

  // Removes all inactive players from the PlayerMap.
  removeInactivePlayers() {
    for (const username in this.usernameToPlayerMap) {
      if (!this.isUsernameActive(username)) {
        this.removePlayerByUsername(username);
      }
    }
  }

  // Removes the Player associated with the given username from the PlayerMap.
  removePlayerByUsername(username) {
    var player = this.getPlayerByUsername(username);

    if (player !== undefined) {
      if (player.socket !== undefined) {
        delete this.socketIdToUsernameMap[player.socket.id];
        player.socket = undefined;
      }
      delete this.usernameToPlayerMap[username];
    }
  }

  // Removes the socket of the Player associated with the given username, if possible.
  removePlayerSocket(username) {
    if (this.containsUsername(username)) {
      this.getPlayerByUsername(username).socket = undefined;
    }
  }

  // Updates the socket of the Player associated with the given username, if possible.
  updatePlayerSocket(username, socket) {
    if (this.containsUsername(username)) {
      this.getPlayerByUsername(username).socket = socket;
      this.socketIdToUsernameMap[socket.id] = username;
    }
  }
}

module.exports = PlayerMap;