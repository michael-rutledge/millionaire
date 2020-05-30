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
  'showHostRevealFastestFingerQuestionChoices',
  'showHostReshowFastestFingerQuestionText',
  'showHostShowFastestFingerAnswer',
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
  'contestantFastestFingerChoose',
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

    // Reference to a setTimeout function that can be cancelled
    this.cancellableTimer = undefined;
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
  _updateGame(currentSocketEvent) {
    this.playerMap.emitCustomToAll('updateGame', (socket) => {
      return this.serverState.toCompressedClientState(socket, currentSocketEvent);
    });
  }


  // PUBLIC METHODS

  // Activates all game-related socket listeners for the given socket.
  activateListenersForSocket(socket) {
    SOCKET_EVENTS.forEach((socketEvent, index) => {
      socket.on(socketEvent, (data) => { this[message](data) });
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
    this.serverState.clearTimers();
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


  // SOCKET LISTENERS

  // Response to client asking to show fastest finger rules.
  showHostShowFastestFingerRules(data) {
    var currentSocketEvent = 'showHostShowFastestFingerRules';
    Logger.logInfo(currentSocketEvent);

    // This is the first part of any game, so we start a new round for the server state
    this.serverState.startNewRound();

    // Human host will control flow, or 5 seconds are allotted for the rules to be shown
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostCueFastestFingerQuestion',
      hostButtonMessage: LocalizedStrings.CUE_FASTEST_FINGER_MUSIC,
      aiTimeout: 5000
    }));
    this._updateGame(currentSocketEvent);
  }

  // Response to client asking to cue the fastest finger question.
  //
  // This should not really do much other than remove any rules on the screen and do an audio cue.
  showHostCueFastestFingerQuestion(data) {
    var currentSocketEvent = 'showHostCueFastestFingerQuestion';
    Logger.logInfo(currentSocketEvent);

    // Human host will control flow, or 3 seconds until question text is shown
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostShowFastestFingerQuestionText',
      hostButtonMessage: LocalizedStrings.SHOW_FASTEST_FINGER_QUESTION,
      aiTimeout: 3000
    }));
    this._updateGame(currentSocketEvent);
  }

  // Response to client asking to show fastest finger question text.
  //
  // This should query fastestFingerSession for a new question, as this is the first time
  // information from a new question is to be shown.
  showHostShowFastestFingerQuestionText(data) {
    var currentSocketEvent = 'showHostShowFastestFingerQuestionText';
    Logger.logInfo(currentSocketEvent);

    this.serverState.fastestFingerQuestion = this.fastestFingerSession.getNewQuestion();

    // Human host will control flow, or 8 seconds will pass until choices are revealed
    this.serverState.setShowHostStepDialog(this._getOneChoiceHostStepDialog({
      nextSocketEvent: 'showHostRevealFastestFingerQuestionChoices',
      hostButtonMessage: LocalizedStrings.REVEAL_FASTEST_FINGER_CHOICE,
      aiTimeout: 8000
    }));
    this._updateGame(currentSocketEvent);
  }

  // Response to client asking to reveal fastest finger choices.
  //
  // This should cue the three strikes audio cue and wait accordingly before starting the fastest
  // finger background music and revealing the choices.
  showHostRevealFastestFingerQuestionChoices(data, currentSocketEvent) {
    Logger.logInfo(currentSocketEvent);

    // First we cue the audio with no possible host step action.
    this.serverState.setShowHostStepDialog(undefined);
    this._updateGame(currentSocketEvent);

    // Next we reveal all choices on the fastest finger question, and update the client again once
    // the timer for allowance of the three strike audio cue is done.
    this.serverState.fastestFingerQuestion.revealAllChoices();
  }
}

module.exports = GameServer;
GameServer.SOCKET_EVENTS = SOCKET_EVENTS;