// Encapsulates the state of the running game on the server side.
class ServerState {

  constructor (playerMap) {
    this.playerMap = playerMap;
    this.showHost = undefined;
    this.hotSeatPlayer = undefined;
  }


  // PUBLIC METHODS
  setShowHostByUsername(showHostUsername) {
    this.showHost = this.playerMap.getPlayerByUsername(showHostUsername);
  }
}

module.exports = ServerState;