const LifelineIndex = require(process.cwd() + '/server/question/LifelineIndex.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');

const contestantChoosableEvents = new Set([
  'showHostShowHotSeatOptionD',
  'hotSeatChoose',
  'hotSeatUseLifeline'
]);
const hotSeatChoosableEvents = new Set(['showHostShowHotSeatOptionD']);

// Encapsulates the state of a running game on the server side.
class ServerState {

  constructor (playerMap) {
    // PlayerMap of the game
    this.playerMap = playerMap;

    // Reference to player who is show host
    this.showHost = undefined;

    // More fields declared in this method
    this.startNewRound();
  }


  // PUBLIC METHODS

  // Clears all player answers, regardless of question type.
  clearAllPlayerAnswers() {
    this.playerMap.doAll((player) => { player.clearAllAnswers(); });
  }

  // Clears the timers associated with this server state.
  clearTimers() {
    if (this.showHostStepDialog !== undefined) {
      this.showHostStepDialog.clearTimeout();
    }
  }

  // Returns whether a player is acting as show host.
  playerShowHostPresent() {
    return this.showHost !== undefined;
  }

  // Sets the show host of this game using the given username.
  setShowHostByUsername(showHostUsername) {
    this.showHost = this.playerMap.getPlayerByUsername(showHostUsername);
  }

  // Sets the next action to be taken when the host steps the game.
  //
  // Expected action format: {
  //   string socketMessage,
  //   string buttonMessage
  // }
  setShowHostStepDialog(action) {
    this.showHostStepDialog = action;
  }

  // Starts a fresh round with the same show host.
  startNewRound() {
    // Reference to player in hot seat
    this.hotSeatPlayer = undefined;

    // Map of availability of lifelines
    this.lifelinesAvailable = {};
    this.lifelinesAvailable[LifelineIndex.FIFTY_FIFTY] = true;
    this.lifelinesAvailable[LifelineIndex.PHONE_A_FRIEND] = true;
    this.lifelinesAvailable[LifelineIndex.ASK_THE_AUDIENCE] = true;

    // StepDialog to be shown to the host
    this.showHostStepDialog = undefined;

    // StepDialog to be shown to the hot seat player
    this.hotSeatStepDialog = undefined;

    // Reference to the current hot seat question
    this.hotSeatQuestion = undefined;

    // What question this server is on (e.g. 0 = $100, 14 = $1 million)
    this.hotSeatQuestionIndex = 0;

    // Reference to the current fastest finger question
    this.fastestFingerQuestion = undefined;
  }

  // Returns a compressed, JSON-formatted version of ClientState to pass to the client via socket.
  toCompressedClientState(socket, currentSocketEvent) {
    var compressed = {};
    var player = this.playerMap.getPlayerBySocket(socket);

    compressed.clientIsShowHost = (this.showHost !== undefined && player == this.showHost);
    compressed.clientIsHotSeat = (this.hotSeatPlayer !== undefined && player == this.hotSeatPlayer);
    // The host might need to have a dialog that can step the game through.
    if (compressed.clientIsShowHost && this.showHostStepDialog !== undefined) {
      compressed.showHostStepDialog = this.showHostStepDialog.toCompressed();
    }
    // The hot seat player might need to have a dialog that can step the game through.
    if (compressed.clientIsHotSeat) {
      compressed.hotSeatStepDialog = this.hotSeatStepDialog.toCompressed();
    }
    // If we are in an event that allows for choosing, make choice buttons active by setting choice
    // actions.
    if (compressed.clientIsHotSeat && hotSeatChoosableEvents.has(currentSocketEvent)) {
      compressed.choiceAction = 'hotSeatChoose';
    } else if (!compressed.clientIsShowHost && contestantChoosableEvents.has(currentSocketEvent)) {
      compressed.choiceAction = 'contestantChoose';
    }

    return compressed;
  }
}

module.exports = ServerState;