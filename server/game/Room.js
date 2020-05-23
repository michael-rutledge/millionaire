const GameServer = require(process.cwd() + '/server/game/GameServer.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

// Encapsulates a room of Millionaire With Friends.
class Room {

  // Constructs a new Room using the given room code.
  constructor(roomCode) {
    this.roomCode = roomCode;           // Room code (e.g. 'abcd' or 'foo1')
    this.playerMap = new PlayerMap();   // PlayerMap of the room
    this.hostSocket = undefined;        // Reference to host socket
    this.gameServer =                   // Game server that will handle game interactions
        new GameServer(this.playerMap);
  }


  // PUBLIC METHODS

  // Attempts to add a Player identified by the given information to the current Room.
  //
  // Returns true if successful, false if unsuccessful.
  addPlayer(socket, username) {
    if (!this.playerMap.containsUsername(username) && !this.gameServer.isInGame()) {
      this.playerMap.putPlayer(new Player(socket, username));

      if (this.hostSocket === undefined) {
        this.hostSocket = socket;
      }
      return true;
    } else if (this.playerMap.containsUsername(username) && this.gameServer.isInGame() &&
               !this.playerMap.isUsernameActive(username)) {
      this.playerMap.updatePlayerSocket(username, socket);
      return true;
    }

    return false;
  }

  //  Attempts to start a game, as triggered by the given socket with the given game options.
  //
  //  Returns true if successful, false if unsuccessful.
  attemptStartGame(socket, gameOptions) {
    if (this.socketIsHost(socket) && !this.gameServer.isInGame() &&
        this.gameOptionsAreValid(gameOptions)) {
      this.gameServer.startGame(gameOptions);
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
    var username = this.playerMap.getUsernameBySocket(socket);

    this.playerMap.removePlayerSocket(username);

    if (this.socketIsHost(socket)) {
      this.reassignHostSocket();
    }
    if (!this.gameServer.isInGame()) {
      this.playerMap.removePlayerByUsername(username);
    }
  }

  // Returns whether the given game options are valid.
  gameOptionsAreValid(gameOptions) {
    return gameOptions.showHostUsername === undefined || this.playerMap.getActivePlayerCount() > 1;
  }

  // Assigns the role of room host to a new socket if possible.
  reassignHostSocket() {
    this.hostSocket = undefined;

    if (this.playerMap.getActivePlayerCount() > 0) {
      this.hostSocket = this.playerMap.getActivePlayerList()[0].socket;
    }
  }

  // Returns whether the given socket is the socket of the Room's host.
  socketIsHost(socket) {
    return socket == this.hostSocket;
  }

  // Returns whether no sockets are currently present in the PlayerMap.
  socketsEmpty() {
    return this.playerMap.getActivePlayerCount() < 1;
  }
}

module.exports = Room;
