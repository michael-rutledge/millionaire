// Encapsulates a player and their possible actions in Millionaire With Friends.
class Player {

  // Constructs a new Player from the given information.
  constructor(socket, username) {
    this.socket = socket;
    this.username = username;
  }
}

module.exports = Player;
