const expect = require('chai').expect;

const GameServer = require(process.cwd() + '/server/game/GameServer.js');
const LocalizedStrings = require(process.cwd() + '/localization/LocalizedStrings.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
const ServerState = require(process.cwd() + '/server/game/ServerState.js');

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

    gameServer.showHostShowFastestFingerRules(/*data=*/{});

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

    gameServer.showHostShowFastestFingerRules(/*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.not.be.undefined;
    gameServer.serverState.showHostStepDialog.clearTimeout();
  });

  it('showHostCueFastestFingerQuestionShouldShowCorrectDialogForHumanShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.showHostCueFastestFingerQuestion(/*data=*/{});

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

    gameServer.showHostCueFastestFingerQuestion(/*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [],
      header: ''
    });
    expect(gameServer.serverState.showHostStepDialog.timeout).to.not.be.undefined;
    gameServer.serverState.showHostStepDialog.clearTimeout();
  });

  it('showHostShowFastestFingerQuestionTextShouldShowCorrectDialogForHumanShowHost', () => {
    var gameServer = newGameServerWithPlayerShowHost(true);

    gameServer.showHostShowFastestFingerQuestionText(/*data=*/{});

    expect(gameServer.serverState.showHostStepDialog.toCompressed()).to.deep.equal({
      actions: [{
        socketEvent: 'showHostRevealFastestFingerQuestionChoices',
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
    gameServer.showHostShowFastestFingerQuestionText(/*data=*/{});
    questionAfter = gameServer.serverState.fastestFingerQuestion;

    expect(questionBefore).to.be.undefined;
    expect(questionAfter).to.not.be.undefined;
  });
});