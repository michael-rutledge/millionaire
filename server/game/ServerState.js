const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
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

  // Returns the amount of money to give to a contestant for their answer to a hot seat question.
  _getContestantHotSeatPayout(elapsedTime, hotSeatQuestionIndex) {
    const payoutRatioCap = 0.5;
    const payoutRatioFloor = 0.2;
    const bestWindowMs = 1000;
    const timeWindowMs = 10000;

    var trimmedElapsedTime = Math.max(0, Math.min(elapsedTime - bestWindowMs, timeWindowMs));
    var timeRatio = 1 - (trimmedElapsedTime / timeWindowMs);
    var payoutRatio = payoutRatioFloor + timeRatio * (payoutRatioCap - payoutRatioFloor);
    return Math.floor(HotSeatQuestion.PAYOUTS[hotSeatQuestionIndex] * payoutRatio);
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
  getFastestFingerResults(playerMap, question) {
    var fastestFingerResults = [];

    playerMap.doAll((player) => {
      if (!this.playerIsShowHost(player)) {
        var elapsedTime = player.fastestFingerTime - question.startTime;

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

  // Assigns cash winnings per contestant according to the current hot seat question.
  //
  // The money given will be inversely proportional to the amount of time it takes for an answer to
  // be put down. Whoever answer correctly in the fastest time, no matter what, will get the highest
  // modifier possible.
  //
  // Expects hotSeatQuestion to be defined.
  gradeHotSeatQuestionForContestants() {
    this.playerMap.doAll((player) => {
      if (this.playerIsContestant(player) && player.hotSeatTime !== undefined &&
          this.hotSeatQuestion.answerIsCorrect(player.hotSeatChoice)) {
        var elapsedTime = player.hotSeatTime - this.hotSeatQuestion.startTime;
        player.money += this._getContestantHotSeatPayout(elapsedTime, this.hotSeatQuestionIndex);
      }
    });
  }

  // Returns whether the hot seat player can choose during the given socket event.
  hotSeatPlayerCanChoose(currentSocketEvent) {
    return hotSeatChoosableEvents.has(currentSocketEvent) &&
      this.hotSeatQuestion !== undefined && this.hotSeatQuestion.allChoicesRevealed();
  }

  // Returns whether the given player is a contestant (i.e not in the hot seat or show hosting).
  playerIsContestant(player) {
    return !this.playerIsShowHost(player) && !this.playerIsHotSeatPlayer(player);
  }

  // Returns whether the given player is the hot seat player.
  playerIsHotSeatPlayer(player) {
    return this.hotSeatPlayer !== undefined && player == this.hotSeatPlayer;
  }

  // Returns whether the given player is host.
  playerIsShowHost(player) {
    return this.showHost !== undefined && player == this.showHost;
  }

  // Returns whether a player is acting as show host.
  playerShowHostPresent() {
    return this.showHost !== undefined;
  }

  // Resets the fastest finger question state back to default.
  resetFastestFinger() {
    this.fastestFingerQuestion = undefined;
    this.clearAllPlayerAnswers();
  }

  // Resets the hot seat question.
  resetHotSeatQuestion() {
    this.hotSeatQuestion = undefined;
    this.clearAllPlayerAnswers();
  }

  // Sets the current celebration banner.
  setCelebrationBanner(celebrationBanner) {
    this.celebrationBanner = celebrationBanner;
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
    //
    // Set to -1 for default state, as it will be incremented before first use.
    this.hotSeatQuestionIndex = -1;

    // Reference to the current fastest finger question
    this.fastestFingerQuestion = undefined;

    // Banner element that appears on a celebration moment
    this.celebrationBanner = undefined;
  }

  // Returns a compressed, JSON-formatted version of client state to pass to the client via socket.
  toCompressedClientState(socket, currentSocketEvent) {
    var compressed = {};
    var player = this.playerMap.getPlayerBySocket(socket);

    compressed.clientIsShowHost = this.playerIsShowHost(player);
    compressed.clientIsHotSeat = this.playerIsHotSeatPlayer(player);
    compressed.clientIsContestant = this.playerIsContestant(player);

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
      compressed.question = this.fastestFingerQuestion.toCompressed(
        /*madeChoices=*/player.fastestFingerChoices);
      // Fastest finger answer results
      if (this.fastestFingerQuestion.revealedAnswers.length > 0) {
        compressed.fastestFingerRevealedAnswers = this.fastestFingerQuestion.revealedAnswers;
      }
    }
    // Fastest finger results
    if (showFastestFingerResultsEvents.has(currentSocketEvent)) {
      compressed.fastestFingerRevealedAnswers = undefined;
      compressed.fastestFingerResults = this.getFastestFingerResults(this.playerMap,
        this.fastestFingerQuestion);
      this.hotSeatPlayer = this.getHotSeatPlayerFromFastestFingerResults(
        compressed.fastestFingerResults);
      compressed.fastestFingerBestScore = this.hotSeatPlayer.fastestFingerScore;
    }
    // Hot seat rules
    if (currentSocketEvent == 'showHostCueHotSeatRules') {
      compressed.infoText = LocalizedStrings.HOT_SEAT_RULES;
    }
    // Hot seat question
    if (this.hotSeatQuestion !== undefined) {
      var madeChoiceToDisplay = compressed.clientIsShowHost ?
        this.hotSeatPlayer.hotSeatChoice :
        player.hotSeatChoice;
      var showCorrectChoice = compressed.clientIsShowHost ?
        this.hotSeatQuestion.correctChoiceRevealedForShowHost :
        this.hotSeatQuestion.correctChoiceRevealedForAll;
      compressed.question = this.hotSeatQuestion.toCompressed(madeChoiceToDisplay,
        showCorrectChoice);
    }
    // Player list will always show up.
    compressed.playerList = this._getCompressedPlayerList();
    // Hot seat question index will always be set to configure money tree.
    compressed.hotSeatQuestionIndex = this.hotSeatQuestionIndex;
    // Celebration banner will show up as long as it is defined.
    compressed.celebrationBanner = this.celebrationBanner;

    return compressed;
  }
}

module.exports = ServerState;