const expect = require('chai').expect;

const Choices = require(process.cwd() + '/server/question/Choices.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
const ServerState = require(process.cwd() + '/server/game/ServerState.js');
const StepDialog = require(process.cwd() + '/server/game/StepDialog.js');

describe('ServerStateTest', () => {
  it('addPlayerDoneWithFastestFingerShouldAddForPlayerNotDoneYet', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id_1'), 'username1');
    serverState.playerMap.putPlayer(player);

    serverState.addPlayerDoneWithFastestFinger(player);

    expect(serverState.fastestFingerResults[player.username]).to.not.be.undefined;
  });

  it('addPlayerDoneWithFastestFingerShouldNotAddForPlayerAlreadyDone', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id_1'), 'username1');
    serverState.playerMap.putPlayer(player);
    player.fastestFingerTime = 1;
    serverState.addPlayerDoneWithFastestFinger(player);
    var originalTime = serverState.fastestFingerResults[player.username].elapsedTimeMs;
    player.fastestFingerTime = 0;

    serverState.addPlayerDoneWithFastestFinger(player);

    expect(serverState.fastestFingerResults[player.username].elapsedTimeMs).to.equal(originalTime);
  });

  it('allPlayersDoneWithFastestFingerShouldGiveExpectedResultForShowHostAbsent', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id_1'), 'username1');
    serverState.playerMap.putPlayer(player);

    var beforeResult = serverState.allPlayersDoneWithFastestFinger();
    serverState.addPlayerDoneWithFastestFinger(player);
    var afterResult = serverState.allPlayersDoneWithFastestFinger();

    expect(beforeResult).to.be.false;
    expect(afterResult).to.be.true;
  });

  it('allPlayersDoneWithFastestFingerShouldGiveExpectedResultForShowHostPresent', () => {
    var serverState = new ServerState(new PlayerMap());
    var hostPlayer = new Player(new MockSocket('host_socket'), 'host');
    var otherPlayer = new Player(new MockSocket('other_socket'), 'other');
    serverState.playerMap.putPlayer(hostPlayer);
    serverState.playerMap.putPlayer(otherPlayer);
    serverState.showHost = hostPlayer;

    var beforeResult = serverState.allPlayersDoneWithFastestFinger();
    serverState.addPlayerDoneWithFastestFinger(otherPlayer);
    var afterResult = serverState.allPlayersDoneWithFastestFinger();

    expect(beforeResult).to.be.false;
    expect(afterResult).to.be.true;
  });

  it('clearAllPlayerAnswersShouldGiveExpectedResult', () => {
    var serverState = new ServerState(new PlayerMap());
    serverState.playerMap.putPlayer(new Player(new MockSocket('socket_id_1'), 'username1'));
    serverState.playerMap.putPlayer(new Player(new MockSocket('socket_id_2'), 'username2'));
    serverState.playerMap.doAll((player) => {
      player.chooseFastestFinger(Choices.A);
      player.chooseHotSeat(Choices.A);
    });

    serverState.clearAllPlayerAnswers();

    serverState.playerMap.getPlayerList().forEach((player, index) => {
      expect(player.fastestFingerChoices).to.be.empty;
      expect(player.hotSeatChoice).to.be.undefined;
    });
  });

  it('clearTimersShouldGiveExpectedResult', () => {
    var serverState = new ServerState(new PlayerMap());
    serverState.showHostStepDialog = new StepDialog(
        /*actions=*/[],
        /*timeoutFunc=*/() => {},
        /*timeoutMs=*/1000);

    serverState.clearTimers();

    expect(serverState.showHostStepDialog.timeoutActive()).to.be.false;
  });

  it('setShowHostByUsernameShouldGiveExpectedResult', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id'), 'player');
    serverState.playerMap.putPlayer(player);

    serverState.setShowHostByUsername('player');

    expect(serverState.showHost).to.equal(player);
  });

  it('startNewRoundShouldGiveExpectedResult', () => {
    var serverState = new ServerState(new PlayerMap());

    serverState.startNewRound();

    expect(serverState.hotSeatPlayer).to.be.undefined;
    expect(serverState.showHostStepDialog).to.be.undefined;
    expect(serverState.hotSeatStepDialog).to.be.undefined;
    expect(serverState.hotSeatQuestion).to.be.undefined;
    expect(serverState.hotSeatQuestionIndex).to.equal(0);
    expect(serverState.fastestFingerQuestion).to.be.undefined;
  });

  it('toCompressedClientStateShouldOnlyGiveShowHostStepDialogForShowHost', () => {
    var serverState = new ServerState(new PlayerMap());
    var hostSocket = new MockSocket('socket_host');
    var hostPlayer = new Player(hostSocket, 'host');
    var otherSocket = new MockSocket('socket_other');
    var otherPlayer = new Player(otherSocket, 'other');
    serverState.playerMap.putPlayer(hostPlayer);
    serverState.playerMap.putPlayer(otherPlayer);
    serverState.setShowHostByUsername('host');
    serverState.setShowHostStepDialog(new StepDialog(/*actions=*/[]));

    var compressedHostClientState = serverState.toCompressedClientState(hostSocket,
      /*currenSocketEvent=*/undefined);
    var compressedOtherClientState = serverState.toCompressedClientState(otherSocket,
      /*currenSocketEvent=*/undefined);

    expect(compressedHostClientState.showHostStepDialog).to.not.be.undefined;
    expect(compressedOtherClientState.showHostStepDialog).to.be.undefined;
  });
});