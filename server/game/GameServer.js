const LocalizedStrings = require(process.cwd() + '/localization/LocalizedStrings.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');
const FastestFingerSession = require(process.cwd() + '/server/question/FastestFingerSession.js');
const ServerState = require(process.cwd() + '/server/game/ServerState.js');
const StepDialog = require(process.cwd() + '/server/game/StepDialog.js');

// Socket event names to allow for dynamic activation and deactivation of listeners.
const SOCKET_EVENTS = [
  'showHostShowFastestFingerRules',
  'showHostCueFastestFingerQuestion',
  'showHostShowFastestFingerQuestionText',
  'showHostCueFastestFingerThreeStrikes',
  'showHostRevealFastestFingerQuestionChoices',
  'contestantFastestFingerChoose',
  'fastestFingerTimeUp',
  'showHostCueFastestFingerAnswerRevealAudio',
  'showHostRevealFastestFingerAnswer',
  'showHostRevealFastestFingerResults',
  'showHostAcceptHotSeatPlayer',
  'showHostCueHotSeatRules',
  'showHostHighlightLifeline',
  'showHostCueHotSeatQuestion',
  'showHostShowHotSeatQuestionText',
  'showHostRevealHotSeatChoiceA',
  'showHostRevealHotSeatChoiceB',
  'showHostRevealHotSeatChoiceC',
  'showHostRevealHotSeatChoiceD',
  'showHostAskTheAudience',
  'showHostDoFiftyFifty',
  'showHostPhoneAFriend',
  'showHostRevealHotSeatQuestionOutcome',
  'showHostShowScores',
  'contestantChoose',
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
    // PlayerMap of the game
    this.playerMap = playerMap;

    // ServerState of this game
    this.serverState = undefined;

    // FastestFingerSession which can keep generating unused questions for this server
    this.fastestFingerSession = new FastestFingerSession();

    // Reference to a setTimeout function that is forced upon the GameServer.
    this.currentForcedTimer = undefined;

    // Whatever socket event was last listened to. Stored so people who left can rejoin without a
    // problem.
    this.currentSocketEvent = undefined;
  }


  // PRIVATE METHODS

  // Returns a one-choice StepDialog for the host that steps to the next socket event expected, or
  // sets a timer to trigger that same expected socket.
  //
  // Expected data format {
  //   string nextSocketEvent
  //   string hostButtonMessage
  //   string aiTimeout
  // }
  _getOneChoiceHostStepDialog(data) {
    // Human host will control flow, or timeout will automatically step the game
    if (this.serverState.playerShowHostPresent()) {
      return new StepDialog(/*actions=*/[{
        socketEvent: data.nextSocketEvent,
        text: data.hostButtonMessage
      }]);
    } else {
      return new StepDialog(
        /*actions=*/[],
        /*timeoutFunc=*/() => {
          this[data.nextSocketEvent]({}, data.nextSocketEvent)
        },
        /*timeoutMs=*/data.aiTimeout);
    }
  }

  // Updates the game client-side by emitting a customized, compressed ClientState to each player.
  _updateGame() {
    this.playerMap.emitCustomToAll('updateGame', (socket) => {
      return this.serverState.toCompressedClientState(socket, this.currentSocketEvent);
    });
  }


  // PUBLIC METHODS

  // Activates all game-related socket listeners for the given socket.
  activateListenersForSocket(socket) {
    SOCKET_EVENTS.forEach((socketEvent, index) => {
      socket.on(socketEvent, (data) => { this[socketEvent](socket, data) });
    });
  }

  // Deactivates all game-related socket listeners for the given socket.
  deactivateListenersForSocket(socket) {
    SOCKET_EVENTS.forEach((socketEvent, index) => {
      socket.removeAllListeners(socketEvent);
    });
  }

  // Ends the game for this GameServer.
  endGame() {
    // All timers must be cleared to prevent against server crashes during prematurely ended games.
    if (this.serverState !== undefined) {
      this.serverState.clearTimers();
      clearTimeout(this.currentForcedTimer);
    }

    this.serverState = undefined;
    this.playerMap.removeInactivePlayers();
    this.playerMap.doAll((player) => { player.reset(); });
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
    this.serverState.startNewRound();
    this.showHostShowFastestFingerRules();
  }

  // Updates the game solely for the given socket.
  updateGameForSocket(socket) {
    socket.emit('updateGame',
      this.serverState.toCompressedClientState(socket, this.currentSocketEvent));
  }


  // SOCKET LISTENERS

  // Response to client asking to show fastest finger rules.
  showHostShowFastestFingerRules(socket, data) {
    this.currentSocketEvent = 'showHostShowFastestFingerRules';
    Logger.logInfo(this.currentSocketEvent);

    // This is the first part of any game, so we start a new round for the server state
    this.serverState.startNewRound();

    // Human host will control flow, or 5 seconds are allotted for the rules to be shown
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostCueFastestFingerQuestion',
      hostButtonMessage: LocalizedStrings.CUE_FASTEST_FINGER_MUSIC,
      aiTimeout: 5000
    }));
    this._updateGame();
  }

  // Response to client asking to cue the fastest finger question.
  //
  // This should not really do much other than remove any rules on the screen and do an audio cue.
  showHostCueFastestFingerQuestion(socket, data) {
    this.currentSocketEvent = 'showHostCueFastestFingerQuestion';
    Logger.logInfo(this.currentSocketEvent);

    // Human host will control flow, or 3 seconds until question text is shown
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostShowFastestFingerQuestionText',
      hostButtonMessage: LocalizedStrings.SHOW_FASTEST_FINGER_QUESTION,
      aiTimeout: 3000
    }));
    this._updateGame();
  }

  // Response to client asking to show fastest finger question text.
  //
  // This should query fastestFingerSession for a new question, as this is the first time
  // information from a new question is to be shown.
  showHostShowFastestFingerQuestionText(socket, data) {
    this.currentSocketEvent = 'showHostShowFastestFingerQuestionText';
    Logger.logInfo(this.currentSocketEvent);

    this.serverState.fastestFingerQuestion = this.fastestFingerSession.getNewQuestion();

    // Human host will control flow, or 8 seconds will pass until choices are revealed
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostCueFastestFingerThreeStrikes',
      hostButtonMessage: LocalizedStrings.REVEAL_FASTEST_FINGER_CHOICE,
      aiTimeout: 8000
    }));
    this._updateGame();
  }

  // Response to client asking to cue the three strikes audio for fastest finger.
  showHostCueFastestFingerThreeStrikes(socket, data) {
    this.currentSocketEvent = 'showHostCueFastestFingerThreeStrikes';
    Logger.logInfo(this.currentSocketEvent);

    // First we cue the audio with no possible host step action.
    this.serverState.setShowHostStepDialog(undefined);
    this._updateGame();

    // After a small waiting period, we reveal all choices.
    this.currentForcedTimer = setTimeout(() => {
      this.showHostRevealFastestFingerQuestionChoices(data);
    }, /*timeoutMs*/2500);
  }

  // Response to client asking to reveal fastest finger choices.
  showHostRevealFastestFingerQuestionChoices(socket, data) {
    this.currentSocketEvent = 'showHostRevealFastestFingerQuestionChoices';
    Logger.logInfo(this.currentSocketEvent);

    this.serverState.fastestFingerQuestion.revealAllChoices();
    this.serverState.fastestFingerStartTime = Date.now();
    this._updateGame();

    this.currentForcedTimer = setTimeout(() => {
      this.fastestFingerTimeUp(data);
    }, /*timeoutMs*/10000);
  }

  // Response to contestant from client locking in a fastest finger choice.
  //
  // Expected data format: {
  //   Choice choice
  // }
  contestantFastestFingerChoose(socket, data) {
    Logger.logInfo('contestantFastestFingerChoose: ' + data.choice);

    var player = this.playerMap.getPlayerBySocket(socket);
    player.chooseFastestFinger(data.choice);
    this.updateGameForSocket(socket);

    if (this.serverState.allPlayersDoneWithFastestFinger()) {
      this.fastestFingerTimeUp(socket, data);
    }
  }

  // Response to client reaching the end of fastest finger.
  //
  // Can be triggered before timer runs out by everyone getting in answers.
  fastestFingerTimeUp(socket, data) {
    this.currentSocketEvent = 'fastestFingerTimeUp';
    Logger.logInfo(this.currentSocketEvent);

    // Even if this was triggered by the timeout expiring, we will be safe and clear the timeout, as
    // it may have been triggered by everyone answering.
    clearTimeout(this.currentForcedTimer);

    // Human host will control flow, or 8 seconds will pass until choices are revealed
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostCueFastestFingerAnswerRevealAudio',
      hostButtonMessage: LocalizedStrings.CUE_FASTEST_FINGER_ANSWER_REVEAL_AUDIO,
      aiTimeout: 2500
    }));
    this._updateGame();
  }

  // Response to client asking to cue fastest finger reveal background audio.
  showHostCueFastestFingerAnswerRevealAudio(socket, data) {
    this.currentSocketEvent = 'showHostCueFastestFingerAnswerRevealAudio';
    Logger.logInfo(this.currentSocketEvent);

    // Human host will control flow, or 2.5 seconds until question text is shown
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostRevealFastestFingerAnswer',
      hostButtonMessage: LocalizedStrings.REVEAL_FASTEST_FINGER_ANSWER,
      aiTimeout: 2500
    }));
    this._updateGame();
  }

  // Response to client asking to reveal a fastest finger answer.
  showHostRevealFastestFingerAnswer(socket, data) {
    this.currentSocketEvent = 'showHostRevealFastestFingerAnswer';
    Logger.logInfo(this.currentSocketEvent);

    this.serverState.fastestFingerQuestion.revealAnswer();

    if (this.serverState.fastestFingerQuestion.revealedAllAnswers()) {
      // If all answers are revealed, move on to the results.
      this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
        nextSocketEvent: 'showHostRevealFastestFingerResults',
        hostButtonMessage: LocalizedStrings.REVEAL_FASTEST_FINGER_RESULTS,
        aiTimeout: 2000
      }));
    } else {
      // Otherwise, repeat the same logic.
      this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
        nextSocketEvent: 'showHostRevealFastestFingerAnswer',
        hostButtonMessage: LocalizedStrings.REVEAL_FASTEST_FINGER_ANSWER,
        aiTimeout: 2000
      }));
    }
    this._updateGame();
  }

  // Response to client asking to reveal fastest finger results.
  showHostRevealFastestFingerResults(socket, data) {
    this.currentSocketEvent = 'showHostRevealFastestFingerResults';
    Logger.logInfo(this.currentSocketEvent);

    // Grade every answer; the winner will be determined by whoever gets the highest score.
    // Tiebreaker is on answer time.
    this.playerMap.doAll((player) => {
      player.fastestFingerScore = this.serverState.fastestFingerQuestion.getAnswerScore(
        player.fastestFingerChoices);
    });

    // Human host will control flow, or 3 seconds until hot seat player is accepted.
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostAcceptHotSeatPlayer',
      hostButtonMessage: LocalizedStrings.ACCEPT_HOT_SEAT_PLAYER,
      aiTimeout: 3000
    }));
    this._updateGame();
  }

  // Response to client asking to accept the hot seat player.
  //
  // This is a celebration screen where fanfare should play.
  showHostAcceptHotSeatPlayer(socket, data) {
    this.currentSocketEvent = 'showHostAcceptHotSeatPlayer';
    Logger.logInfo(this.currentSocketEvent);

    // Nothing much happens here other than triggering the audio cue.

    // Human host will control flow, or 10 seconds until hot seat rules start.
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostCueHotSeatRules',
      hostButtonMessage: LocalizedStrings.SHOW_HOT_SEAT_RULES,
      aiTimeout: 10000
    }));
    this._updateGame();
  }

  // Response to client asking to show hot seat rules to all players.
  //
  // This should not really do much other than show text on screen and do an audio cue.
  showHostCueHotSeatRules(socket, data) {
    this.currentSocketEvent = 'showHostCueHotSeatRules';
    Logger.logInfo(this.currentSocketEvent);

    // Nothing much happens here other than triggering the audio cue.
    this.serverState.resetFastestFinger();

    // Human host will control flow, or 3 seconds until question text is shown
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostCueHotSeatQuestion',
      hostButtonMessage: LocalizedStrings.CUE_HOT_SEAT_QUESTION,
      aiTimeout: 5000
    }));
    this._updateGame();
  }
}

module.exports = GameServer;
GameServer.SOCKET_EVENTS = SOCKET_EVENTS;