const ServerState = require(process.cwd() + '/server/game/ServerState.js');

// Socket event names to allow for dynamic activation and deactivation of listeners.
const SOCKET_EVENTS = [
  'showHostShowFastestFingerRules',
  'showHostCueFastestFingerQuestion',
  'showHostShowFasterFingerQuestionText',
  'showHostStartFastestFingerQuestion',
  'showHostReshowFastestFingerQuestionText',
  'showHostShowFastestFingerAnswer',
  'showHostAcceptHotSeatPlayer',
  'showHostCueHotSeatRules',
  'showHostHighlightLifeline',
  'showHostCueHotSeatQuestion',
  'showHostShowHotSeatQuestionText',
  'showHostShowHotSeatOption',
  'showHostAskTheAudience',
  'showHostDoFiftyFifty',
  'showHostPhoneAFriend',
  'showHostRevealHotSeatQuestionOutcome',
  'showHostShowScores',
  'contestantFastestFingerChoose',
  'contestantChoose',
  'contestantFinalAnswer',
  'contestantSetConfidence',
  'hotSeatChoose',
  'hotSeatFinalAnswer',
  'hotSeatUseLifeline',
  'hotSeatConfirmLifeline',
  'hotSeatPickPhoneAFriend',
];

// Handles game-related socket interactions on the server side.
class GameServer {

  constructor(playerMap) {
    // Assign fields
    this.playerMap = playerMap;     // PlayerMap of the game
    this.serverState = undefined;   // ServerState of this game
  }


  // PUBLIC METHODS

  // Activates all game-related socket listeners for the given socket.
  activateListenersForSocket(socket) {
    for (var i = 0; i < SOCKET_EVENTS.length; i++) {
      socket.on(SOCKET_EVENTS[i], (data) => { this[SOCKET_EVENTS[i]](data) });
    }
  }

  // Deactivates all game-related socket listeners for the given socket.
  deactivateListenersForSocket(socket) {
    for (var i = 0; i < SOCKET_EVENTS.length; i++) {
      socket.removeAllListeners(SOCKET_EVENTS[i]);
    }
  }

  // Ends the game for this GameServer.
  endGame() {
    this.serverState = undefined;
    this.playerMap.removeInactivePlayers();
  }

  // Returns whether the given game options are valid.
  gameOptionsAreValid(gameOptions) {
    return gameOptions.showHostUsername === undefined || this.playerMap.getActivePlayerCount() > 1;
  }

  // Returns whether the GameServer is ingame.
  isInGame() {
    return this.serverState !== undefined;
  }

  // Starts the game for this GameServer.
  startGame(gameOptions) {
    this.serverState = new ServerState(this.playerMap);
    this.serverState.setShowHostByUsername(gameOptions.showHostUsername);
  }
}

module.exports = GameServer;
GameServer.SOCKET_EVENTS = SOCKET_EVENTS;