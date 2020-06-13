const expect = require('chai').expect;

const Choices = require(process.cwd() + '/server/question/Choices.js');
const FastestFingerQuestion = require(process.cwd() + '/server/question/FastestFingerQuestion.js');
const GameServer = require(process.cwd() + '/server/game/GameServer.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const LocalizedStrings = require(process.cwd() + '/localization/LocalizedStrings.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
const ServerState = require(process.cwd() + '/server/game/ServerState.js');

const MONEY_STRINGS = require(process.cwd() + '/server/question/Question.js').MONEY_STRINGS;

function newGameServerWithPlayerShowHost(present) {
  var gameServer = new GameServer(new PlayerMap());
  gameServer.serverState = new ServerState(gameServer.playerMap);
  gameServer.serverState.playerShowHostPresent = () => { return present; };
  return gameServer;
}

describe('GameServerTest', () => {
  it('activateListenersForSocketShouldGiveExpectedResult', () => {
    var gameServer = new GameServer(new PlayerMap());
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'username');
    gameServer.playerMap.putPlayer(player);

    gameServer.activateListenersForSocket(socket);

    expect(Object.keys(socket.listeners)).to.deep.equal(GameServer.SOCKET_EVENTS);
  });

  it('deactivateListenersForSocketShouldGiveExpectedResult', () => {
    var gameServer = new GameServer(new PlayerMap());
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'username');
    gameServer.playerMap.putPlayer(player);
    gameServer.activateListenersForSocket(socket);

    gameServer.deactivateListenersForSocket(socket);

    expect(Object.keys(socket.listeners)).to.be.empty;
  });

  it('endGameShouldGiveExpectedResult', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.endGame();

    expect(gameServer.serverState).to.be.undefined;
  });

  it('gameOptionsAreValidShouldAllowNoShowHost', () => {
    var gameServer = new GameServer(new PlayerMap());
    var gameOptions = { showHostUsername: undefined };

    var result = gameServer.gameOptionsAreValid(gameOptions);

    expect(result).to.be.true;
  });

  it('gameOptionsAreValidShouldNotAllowShowHostForOnePlayer', () => {
    var gameServer = new GameServer(new PlayerMap());
    gameServer.playerMap.putPlayer(new Player(new MockSocket('socket_id'), 'username'));
    var gameOptions = { showHostUsername: 'username' };

    var result = gameServer.gameOptionsAreValid(gameOptions);

    expect(result).to.be.false;
  });

  it('gameOptionsAreValidShouldAllowShowHostForMoreThanOnePlayer', () => {
    var gameServer = new GameServer(new PlayerMap());
    gameServer.playerMap.putPlayer(new Player(new MockSocket('socket_id'), 'username'));
    gameServer.playerMap.putPlayer(new Player(new MockSocket('socket_id_2'), 'username_2'));
    var gameOptions = { showHostUsername: 'username' };

    var result = gameServer.gameOptionsAreValid(gameOptions);

    expect(result).to.be.true;
  });

  it('startGameShouldGiveExpectedResultAndShowFastestFingerRules', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    var showHostShowFastestFingerRulesCalled = false;
    gameServer.showHostShowFastestFingerRules = (data) => {
      showHostShowFastestFingerRulesCalled = true;
    };

    gameServer.startGame(/*gameOptions=*/{});

    expect(gameServer.serverState).to.not.be.undefined;
    expect(showHostShowFastestFingerRulesCalled).to.be.true;
  });

  it('showHostShowFastestFingerRulesShouldShowCorrectDialogForHumanShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.showHostShowFastestFingerRules(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostCueFastestFingerQuestion',
        text: LocalizedStrings.CUE_FASTEST_FINGER_MUSIC
      }],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.be.undefined;
  });

  it('showHostShowFastestFingerRulesShouldSetTimerForNoShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(false);

    gameServer.showHostShowFastestFingerRules(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.not.be.undefined;
    gameServer.serverState.showHostStepDialog.clearTimeout();
  });

  it('showHostCueFastestFingerQuestionShouldShowCorrectDialogForHumanShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.showHostCueFastestFingerQuestion(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostShowFastestFingerQuestionText',
        text: LocalizedStrings.SHOW_FASTEST_FINGER_QUESTION
      }],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.be.undefined;
  });

  it('showHostCueFastestFingerQuestionShouldSetTimerForNoShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(false);

    gameServer.showHostCueFastestFingerQuestion(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.not.be.undefined;
    gameServer.serverState.showHostStepDialog.clearTimeout();
  });

  it('showHostShowFastestFingerQuestionTextShouldShowCorrectDialogForHumanShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.showHostShowFastestFingerQuestionText(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostCueFastestFingerThreeStrikes',
        text: LocalizedStrings.REVEAL_FASTEST_FINGER_CHOICE
      }],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.be.undefined;
  });

  it('showHostShowFastestFingerQuestionTextShouldGenerateQuestion', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    var questionBefore, questionAfter;

    questionBefore = gameServer.serverState.fastestFingerQuestion;
    gameServer.showHostShowFastestFingerQuestionText(new MockSocket(), /*data=*/{});
    questionAfter = gameServer.serverState.fastestFingerQuestion;

    expect(questionBefore).to.be.undefined;
    expect(questionAfter).to.not.be.undefined;
  });

  it('showHostCueFastestFingerThreeStrikesShouldGiveExpectedResult', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.showHostCueFastestFingerThreeStrikes(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog).to.be.undefined;
    expect(gameServer.currentForcedTimer._onTimeout).to.not.be.undefined;
    clearTimeout(gameServer.currentForcedTimer);
  });

  it('showHostRevealFastestFingerQuestionChoicesShouldGiveExpectedResult', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'questionText',
      orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
    });

    gameServer.showHostRevealFastestFingerQuestionChoices(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog).to.be.undefined;
    expect(gameServer.serverState.fastestFingerQuestion.revealedChoices).to.have.lengthOf(
      Choices.MAX_CHOICES);
    expect(gameServer.currentForcedTimer._onTimeout).to.not.be.undefined;
    clearTimeout(gameServer.currentForcedTimer);
  });

  it('showHostRevealFastestFingerQuestionChoicesShouldSetFastestFingerStartTime', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'questionText',
      orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
    });

    gameServer.showHostRevealFastestFingerQuestionChoices(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.fastestFingerQuestion.startTime).to.not.be.undefined;
    clearTimeout(gameServer.currentForcedTimer);
  });

  it('contestantFastestFingerChooseShouldNotCompleteIfChoicesLeft', () => {
    var gameServer = newGameServerWithPlayerShowHost(false);
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'username');
    gameServer.playerMap.putPlayer(player);
    var fastestFingerTimeUpTriggered = false;
    gameServer.fastestFingerTimeUp = () => { fastestFingerTimeUpTriggered = true; };

    gameServer.contestantFastestFingerChoose(socket, /*data=*/{
      choice: Choices.A
    });

    expect(fastestFingerTimeUpTriggered).to.be.false;
  });

  it('contestantFastestFingerChooseShouldCompleteIfAllChoicesMade', () => {
    var gameServer = newGameServerWithPlayerShowHost(false);
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'username');
    player.fastestFingerChoices = [Choices.A, Choices.B, Choices.C];
    gameServer.playerMap.putPlayer(player);
    var fastestFingerTimeUpTriggered = false;
    gameServer.fastestFingerTimeUp = () => { fastestFingerTimeUpTriggered = true; };

    gameServer.contestantFastestFingerChoose(socket, /*data=*/{
      choice: Choices.D
    });

    expect(fastestFingerTimeUpTriggered).to.be.true;
    expect(gameServer.serverState.allPlayersDoneWithFastestFinger()).to.be.true;
  });

  it('fastestFingerTimeUpShouldShowCorrectDialogForHumanShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.fastestFingerTimeUp(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostCueFastestFingerAnswerRevealAudio',
        text: LocalizedStrings.CUE_FASTEST_FINGER_ANSWER_REVEAL_AUDIO
      }],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.be.undefined;
  });

  it('fastestFingerTimeUpShouldSetTimerForNoShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(false);

    gameServer.fastestFingerTimeUp(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.not.be.undefined;
    gameServer.serverState.showHostStepDialog.clearTimeout();
  });

  it('showHostRevealFastestFingerAnswerShouldRevealAnswer', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'questionText',
      orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
    });

    gameServer.showHostRevealFastestFingerAnswer(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.fastestFingerQuestion.revealedAnswers).to.have.lengthOf(1);
  });

  it('showHostRevealFastestFingerAnswerShouldSendSameDialogForAnswersLeft', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'questionText',
      orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
    });

    gameServer.showHostRevealFastestFingerAnswer(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostRevealFastestFingerAnswer',
        text: LocalizedStrings.REVEAL_FASTEST_FINGER_ANSWER
      }],
      header: ''
    });
  });

  it('showHostRevealFastestFingerAnswerShouldSendNewDialogForNoAnswersLeft', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'questionText',
      orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
    });
    gameServer.serverState.fastestFingerQuestion.shuffledChoices.forEach((choice, index) => {
      gameServer.serverState.fastestFingerQuestion.revealAnswer();
    });

    gameServer.showHostRevealFastestFingerAnswer(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostRevealFastestFingerResults',
        text: LocalizedStrings.REVEAL_FASTEST_FINGER_RESULTS
      }],
      header: ''
    });
  });

  it('showHostRevealFastestFingerResultsShouldSetPlayerAnswerScores', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'questionText',
      orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
    });
    gameServer.serverState.fastestFingerQuestion.shuffledChoices = [
      'choice 2', 'choice 1', 'choice 4', 'choice 3'
    ];
    var player = new Player(new MockSocket('socket_id'), 'username');
    player.fastestFingerChoices = [Choices.B, Choices.A, Choices.D, Choices.C];
    gameServer.playerMap.putPlayer(player);

    gameServer.showHostRevealFastestFingerResults(new MockSocket('socket_id'), /*data=*/{});

    expect(player.fastestFingerScore).to.equal(4);
  });

  it('showHostRevealFastestFingerResultsShouldSetExpectedDialog', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);
    gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'questionText',
      orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
    });

    gameServer.showHostRevealFastestFingerResults(new MockSocket(), /*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostAcceptHotSeatPlayer',
        text: LocalizedStrings.ACCEPT_HOT_SEAT_PLAYER
      }],
      header: ''
    });
  });

  describe('showHostAcceptHotSeatPlayer', function () {
    it('shouldSetExpectedCelebrationBanner', () => {
      var gameServer = newGameServerWithPlayerShowHost(true);
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      gameServer.serverState.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);

      gameServer.showHostAcceptHotSeatPlayer(mockSocket, /*data=*/{});

      expect(gameServer.serverState.celebrationBanner).to.deep.equal({
        header: LocalizedStrings.FASTEST_FINGER_WINNER,
        text: player.username
      });
    });

    it('shouldSetExpectedDialog', () => {
      var gameServer = newGameServerWithPlayerShowHost(true);
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      gameServer.serverState.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);
      gameServer.showHostAcceptHotSeatPlayer(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
        actions: [{
          socketEvent: 'showHostCueHotSeatRules',
          text: LocalizedStrings.SHOW_HOT_SEAT_RULES
        }],
        header: ''
      });
    });
  });

  describe('showHostCueHotSeatRules', function () {
    it('shouldSetExpectedDialog', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);

      gameServer.showHostCueHotSeatRules(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
        actions: [{
          socketEvent: 'showHostCueHotSeatQuestion',
          text: LocalizedStrings.CUE_HOT_SEAT_QUESTION
        }],
        header: ''
      });
    });

    it('shouldResetFastestFingerQuestion', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.fastestFingerQuestion = new FastestFingerQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });

      gameServer.showHostCueHotSeatRules(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.fastestFingerQuestion).to.be.undefined;
    });

    it('shouldClearCelebrationBanner', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.celebrationBanner = {};

      gameServer.showHostCueHotSeatRules(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.celebrationBanner).to.be.undefined;
    });
  });

  describe('showHostCueHotSeatQuestion', function () {
    it('shouldSetExpectedDialog', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);

      gameServer.showHostCueHotSeatQuestion(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
        actions: [{
          socketEvent: 'showHostShowHotSeatQuestionText',
          text: LocalizedStrings.SHOW_HOT_SEAT_QUESTION
        }],
        header: ''
      });
    });

    it('shouldClearCelebrationBanner', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.celebrationBanner = {};

      gameServer.showHostCueHotSeatQuestion(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.celebrationBanner).to.be.undefined;
    });

    it('shouldIncrementHotSeatQuestionIndex', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestionIndex = 0;

      gameServer.showHostCueHotSeatQuestion(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.hotSeatQuestionIndex).to.equal(1);
    });
  });

  describe('showHostShowHotSeatQuestionText', function () {
    it('shouldSetExpectedDialog', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);

      gameServer.showHostShowHotSeatQuestionText(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
        actions: [{
          socketEvent: 'showHostRevealHotSeatChoice',
          text: LocalizedStrings.REVEAL_HOT_SEAT_CHOICE
        }],
        header: ''
      });
    });

    it('shouldSetHotSeatQuestion', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);

      gameServer.showHostShowHotSeatQuestionText(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.hotSeatQuestion).to.not.be.undefined;
    });
  });

  describe('showHostRevealHotSeatChoicehoice', function () {
    it('shouldRevealChoice', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      var player = new Player(new MockSocket(), 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);

      gameServer.showHostRevealHotSeatChoice(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.hotSeatQuestion.revealedChoices).to.have.lengthOf(1);
    });

    it('shouldSetExpectedDialogWhenChoicesLeft', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      var player = new Player(new MockSocket(), 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);

      gameServer.showHostRevealHotSeatChoice(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
        actions: [{
          socketEvent: 'showHostRevealHotSeatChoice',
          text: LocalizedStrings.REVEAL_HOT_SEAT_CHOICE
        }],
        header: ''
      });
    });

    it('shouldSetNoShowHostStepDialogWhenNoChoicesLeft', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      var player = new Player(new MockSocket(), 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);
      gameServer.serverState.hotSeatQuestion.revealAllChoices();

      gameServer.showHostRevealHotSeatChoice(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog).to.be.undefined;
    });

    it('shouldSetNoHotSeatStepDialogWhenNoChoicesLeft', function () {
      var gameServer = newGameServerWithPlayerShowHost(false);
      gameServer.serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      var player = new Player(new MockSocket(), 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);
      gameServer.serverState.hotSeatQuestion.revealAllChoices();
      gameServer.serverState.hotSeatStepDialog = {};

      gameServer.showHostRevealHotSeatChoice(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.hotSeatStepDialog).to.be.undefined;
    });
  });

  describe('hotSeatChoose', function () {
    it('shouldChooseHotSeatChoiceForPlayer', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);

      gameServer.hotSeatChoose(mockSocket, { choice: Choices.A });

      expect(player.hotSeatChoice).to.equal(Choices.A);
    });

    it('shouldSetHostDialogWhenShowHostPresent', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);

      gameServer.hotSeatChoose(mockSocket, { choice: Choices.A });

      expect(gameServer.serverState.showHostStepDialog).to.deep.equal({
        actions: [{
          socketEvent: 'hotSeatFinalAnswer',
          text: LocalizedStrings.YES
        }, {
          socketEvent: 'showHostRevealHotSeatChoice',
          text: LocalizedStrings.NO
        }],
        header: LocalizedStrings.HOT_SEAT_FINAL_ANSWER
      });
      expect(gameServer.serverState.hotSeatStepDialog).to.be.undefined;
    });

    it('shouldHotSeatDialogWhenShowHostNotPresent', function () {
      var gameServer = newGameServerWithPlayerShowHost(false);
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);

      gameServer.hotSeatChoose(mockSocket, { choice: Choices.A });

      expect(gameServer.serverState.hotSeatStepDialog).to.deep.equal({
        actions: [{
          socketEvent: 'hotSeatFinalAnswer',
          text: LocalizedStrings.YES
        }, {
          socketEvent: 'showHostRevealHotSeatChoice',
          text: LocalizedStrings.NO
        }],
        header: LocalizedStrings.HOT_SEAT_FINAL_ANSWER
      });
      expect(gameServer.serverState.showHostStepDialog).to.be.undefined;
    });
  });

  describe('contestantChoose', function () {
    it('shouldChooseForGivenPlayer', () => {
      var gameServer = newGameServerWithPlayerShowHost(false);
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      gameServer.playerMap.putPlayer(player);

      gameServer.contestantChoose(mockSocket, { choice: Choices.A });

      expect(player.hotSeatChoice).to.equal(Choices.A);
    });
  });

  describe('hotSeatFinalAnswer', function () {
    it('shouldSetExpectedDialogForCorrectAnswer', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      gameServer.serverState.hotSeatQuestion.shuffledChoices = [
        'choice 2', 'choice 1', 'choice 4', 'choice 3'
      ];
      var player = new Player(new MockSocket(), 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);
      gameServer.serverState.hotSeatQuestion.revealAllChoices();
      player.chooseHotSeat(Choices.B);

      gameServer.hotSeatFinalAnswer(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog).to.deep.equal({
        actions: [{
          socketEvent: 'showHostRevealHotSeatQuestionVictory',
          text: LocalizedStrings.HOT_SEAT_VICTORY
        }],
        header: ''
      });
    });

    it('shouldSetExpectedDialogForIncorrectAnswer', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });
      gameServer.serverState.hotSeatQuestion.shuffledChoices = [
        'choice 2', 'choice 1', 'choice 4', 'choice 3'
      ];
      var player = new Player(new MockSocket(), 'username');
      gameServer.playerMap.putPlayer(player);
      gameServer.serverState.setHotSeatPlayerByUsername(player.username);
      gameServer.serverState.hotSeatQuestion.revealAllChoices();
      player.chooseHotSeat(Choices.A);

      gameServer.hotSeatFinalAnswer(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.showHostStepDialog).to.deep.equal({
        actions: [{
          socketEvent: 'showHostRevealHotSeatQuestionLoss',
          text: LocalizedStrings.HOT_SEAT_LOSS
        }],
        header: ''
      });
    });
  });

  describe('showHostRevealHotSeatQuestionVictory', function () {
    it('shouldRevealCorrectChoiceForAll', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'questionText',
        orderedChoices: ['choice 1', 'choice 2', 'choice 3', 'choice 4']
      });

      gameServer.showHostRevealHotSeatQuestionVictory(new MockSocket(), /*data=*/{});

      expect(gameServer.serverState.hotSeatQuestion.correctChoiceRevealedAll).to.be.true;
      clearTimeout(gameServer.currentForcedTimer);
    });

    it('continuationShouldSetCelebrationBanner', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestionIndex = 0;

      gameServer.showHostRevealHotSeatQuestionVictory_Continuation();

      expect(gameServer.serverState.celebrationBanner).to.deep.equal({
        header: '',
        text: MONEY_STRINGS[gameServer.serverState.hotSeatQuestionIndex]
      });
    });

    it('continuationShouldResetHotSeatQuestion', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);
      gameServer.serverState.hotSeatQuestion = {};

      gameServer.showHostRevealHotSeatQuestionVictory_Continuation();

      expect(gameServer.serverState.hotSeatQuestion).to.be.undefined;
    });

    it('continuationShouldSetShowHostStepDialog', function () {
      var gameServer = newGameServerWithPlayerShowHost(true);

      gameServer.showHostRevealHotSeatQuestionVictory_Continuation();

      expect(gameServer.serverState.showHostStepDialog).to.not.be.undefined;
    });
  });
});