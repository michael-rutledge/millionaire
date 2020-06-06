const LifelineIndex = require(process.cwd() + '/server/question/LifelineIndex.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');

const contestantChoosableEvents = new Set([
  'showHostShowHotSeatOptionD',
  'hotSeatChoose',
  'hotSeatUseLifeline'
]);
const hotSeatChoosableEvents = new Set(['showHostShowHotSeatOptionD']);
const fastestFingerChoosableEvents = new Set(['showHostRevealFastestFingerQuestionChoices']);

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


  // PRIVATE METHODS

  // Returns a list of all Players, compressed for transfer over a socket message.
  _getCompressedPlayerList() {
    var compressedPlayerList = [];

    this.playerMap.getPlayerList().forEach((player, index) => {
      compressedPlayerList.push(player.toCompressed());
    });

    return compressedPlayerList;
  }


  // PUBLIC METHODS

  // Adds a username to the list of players done with their respective fastest finger choices.
  addPlayerDoneWithFastestFinger(player) {
    var now = new Date().getTime();

    if (this.fastestFingerResults[player.username] === undefined) {
      this.fastestFingerResults[player.username] = {
        elapsedTimeMs: now - player.fastestFingerTime,
        choices: player.fastestFingerChoices
      };
    }
  }

  // Returns whether all contestant players are done with their fastest finger choices.
  allPlayersDoneWithFastestFinger() {
    var showHostOffset = this.showHost === undefined ? 0 : 1;
    return Object.keys(this.fastestFingerResults).length >=
      this.playerMap.getPlayerCount() - showHostOffset;
  }

  // Clears all player answers, regardless of question type.
  clearAllPlayerAnswers() {
    this.fastestFingerResults = {};
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

  // Sets the hot seat player of this game using the given username.
  setHotSeatPlayerByUsername(hotSeatPlayerUsername) {
    this.hotSeatPlayer = this.playerMap.getPlayerByUsername(hotSeatPlayerUsername);
  }

  // Sets the next action to be taken when the host steps the game.
  //
  // Expected action format: {
  //   array actions,
  //   string header
  // }
  setHotSeatStepDialog(action) {
    this.hotSeatStepDialog = action;
  }

  // Sets the show host of this game using the given username.
  setShowHostByUsername(showHostUsername) {
    this.showHost = this.playerMap.getPlayerByUsername(showHostUsername);
  }

  // Sets the next action to be taken when the host steps the game.
  //
  // Expected action format: {
  //   array actions,
  //   string header
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

    // Set of all usernames done with fastest finger.
    //
    // Used in triggering of fastest finger end.
    this.fastestFingerResults = {};
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
    if (compressed.clientIsHotSeat && this.hotSeatStepDialog !== undefined) {
      compressed.hotSeatStepDialog = this.hotSeatStepDialog.toCompressed();
    }
    // If we are in an event that allows for fastest finger choosing, make choice buttons active by
    // setting choice actions.
    if (!compressed.clientIsShowHost && fastestFingerChoosableEvents.has(currentSocketEvent)) {
      compressed.choiceAction = 'contestantFastestFingerChoose';
    }
    // If we are in an event that allows for choosing, make choice buttons active by setting choice
    // actions.
    if (compressed.clientIsHotSeat && hotSeatChoosableEvents.has(currentSocketEvent)) {
      compressed.choiceAction = 'hotSeatChoose';
    } else if (!compressed.clientIsShowHost && contestantChoosableEvents.has(currentSocketEvent)) {
      compressed.choiceAction = 'contestantChoose';
    }
    // Fastest finger question
    if (this.fastestFingerQuestion) {
      compressed.question = {
        text: this.fastestFingerQuestion.text,
        revealedChoices: this.fastestFingerQuestion.revealedChoices,
        madeChoices: player.fastestFingerChoices
      };
    }
    // Player list will always show up.
    compressed.playerList = this._getCompressedPlayerList();

    return compressed;
  }
}

module.exports = ServerState;