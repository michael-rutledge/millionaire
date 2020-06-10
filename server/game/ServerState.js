const LifelineIndex = require(process.cwd() + '/server/question/LifelineIndex.js');
const LocalizedStrings = require(process.cwd() + '/localization/LocalizedStrings.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');

const contestantChoosableEvents = new Set([
  'showHostRevealHotSeatChoice',
  'hotSeatChoose',
  'hotSeatUseLifeline'
]);
const hotSeatChoosableEvents = new Set(['showHostRevealHotSeatChoice']);
const fastestFingerChoosableEvents = new Set(['showHostRevealFastestFingerQuestionChoices']);
const showFastestFingerResultsEvents = new Set([
  'showHostRevealFastestFingerResults',
  'showHostAcceptHotSeatPlayer'
  ]);

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

  // Returns whether all contestant players are done with their fastest finger choices.
  allPlayersDoneWithFastestFinger() {
    var showHostOffset = this.showHost === undefined ? 0 : 1;
    var doneCount = 0;

    this.playerMap.doAll((player) => {
      if (!player.hasFastestFingerChoicesLeft()) {
        doneCount++;
      }
    });

    return doneCount >= this.playerMap.getPlayerCount() - showHostOffset;
  }

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

  // Returns whether a contestant can choose during the given socket event.
  contestantCanChoose(currentSocketEvent) {
    return contestantChoosableEvents.has(currentSocketEvent) &&
      this.hotSeatQuestion !== undefined && this.hotSeatQuestion.allChoicesRevealed();
  }

  // Returns an array of fastest finger player results for client display using the given player
  // map.
  getFastestFingerResults(playerMap, startTime) {
    var fastestFingerResults = [];

    playerMap.doAll((player) => {
      if (!this.playerIsShowHost(player)) {
        var elapsedTime = player.fastestFingerTime - startTime;

        fastestFingerResults.push({
          username: player.username,
          score: player.fastestFingerScore,
          time: elapsedTime
        });
      }
    });

    return fastestFingerResults;
  }

  // Returns the winning player from the given fastest finger results so they can become the hot
  // seat player.
  getHotSeatPlayerFromFastestFingerResults(fastestFingerResults) {
    var hotSeatPlayer = undefined;
    var bestScore = 0;
    var bestTime = undefined;

    fastestFingerResults.forEach((result, index) => {
      if (result.score >= bestScore) {
        bestScore = result.score;
        if (bestTime === undefined || result.time < bestTime) {
          bestTime = result.time;
          hotSeatPlayer = this.playerMap.getPlayerByUsername(result.username);
        }
      }
    });

    return hotSeatPlayer;
  }

  // Returns whether the hot seat player can choose during the given socket event.
  hotSeatPlayerCanChoose(currentSocketEvent) {
    return hotSeatChoosableEvents.has(currentSocketEvent) &&
      this.hotSeatQuestion !== undefined && this.hotSeatQuestion.allChoicesRevealed();
  }

  // Returns whether the given player is host.
  playerIsShowHost(player) {
    return player == this.showHost;
  }

  // Returns whether a player is acting as show host.
  playerShowHostPresent() {
    return this.showHost !== undefined;
  }

  // Resets the fastest finger question state back to default.
  resetFastestFinger() {
    this.fastestFingerQuestion = undefined;
    this.fastestFingerStartTime = undefined;
    this.clearAllPlayerAnswers();
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

    this.fastestFingerStartTime = undefined;
  }

  // Returns a compressed, JSON-formatted version of client state to pass to the client via socket.
  toCompressedClientState(socket, currentSocketEvent) {
    var compressed = {};
    var player = this.playerMap.getPlayerBySocket(socket);

    compressed.clientIsShowHost = (this.showHost !== undefined && player == this.showHost);
    compressed.clientIsHotSeat = (this.hotSeatPlayer !== undefined && player == this.hotSeatPlayer);
    compressed.clientIsContestant = !compressed.clientIsShowHost && !compressed.clientIsHotSeat;
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
    if (compressed.clientIsHotSeat && this.hotSeatPlayerCanChoose(currentSocketEvent)) {
      compressed.choiceAction = 'hotSeatChoose';
    } else if (compressed.clientIsContestant && this.contestantCanChoose(currentSocketEvent)) {
      compressed.choiceAction = 'contestantChoose';
    }
    // Fastest finger question
    if (this.fastestFingerQuestion !== undefined) {
      compressed.question = {
        text: this.fastestFingerQuestion.text,
        revealedChoices: this.fastestFingerQuestion.revealedChoices,
        madeChoices: player.fastestFingerChoices
      };
      // Fastest finger answer results
      if (this.fastestFingerQuestion.revealedAnswers.length > 0) {
        compressed.fastestFingerRevealedAnswers = this.fastestFingerQuestion.revealedAnswers;
      }
    }
    // Fastest finger results
    if (showFastestFingerResultsEvents.has(currentSocketEvent)) {
      compressed.fastestFingerRevealedAnswers = undefined;
      compressed.fastestFingerResults = this.getFastestFingerResults(this.playerMap,
        this.fastestFingerStartTime);
      this.hotSeatPlayer = this.getHotSeatPlayerFromFastestFingerResults(
        compressed.fastestFingerResults);
      compressed.fastestFingerBestScore = this.hotSeatPlayer.fastestFingerScore;
    }
    // New player in the hot seat
    if (currentSocketEvent == 'showHostAcceptHotSeatPlayer') {
      compressed.celebrationBanner = {
        header: LocalizedStrings.FASTEST_FINGER_WINNER,
        text: this.hotSeatPlayer.username
      };
    }
    // Hot seat rules
    if (currentSocketEvent == 'showHostCueHotSeatRules') {
      compressed.infoText = LocalizedStrings.HOT_SEAT_RULES;
    }
    // Hot seat question
    if (this.hotSeatQuestion !== undefined) {
      compressed.question = {
        text: this.hotSeatQuestion.text,
        revealedChoices: this.hotSeatQuestion.revealedChoices,
        madeChoices: [ player.hotSeatChoice ]
      };
    }
    // Player list will always show up.
    compressed.playerList = this._getCompressedPlayerList();

    return compressed;
  }
}

module.exports = ServerState;