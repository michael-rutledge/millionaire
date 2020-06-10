const expect = require('chai').expect;

const Choices = require(process.cwd() + '/server/question/Choices.js');
const FastestFingerQuestion = require(process.cwd() + '/server/question/FastestFingerQuestion.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const LocalizedStrings = require(process.cwd() + '/localization/LocalizedStrings.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
const ServerState = require(process.cwd() + '/server/game/ServerState.js');
const StepDialog = require(process.cwd() + '/server/game/StepDialog.js');

describe('ServerStateTest', () => {
  it('allPlayersDoneWithFastestFingerShouldGiveExpectedResultForShowHostAbsent', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id_1'), 'username1');
    serverState.playerMap.putPlayer(player);

    var beforeResult = serverState.allPlayersDoneWithFastestFinger();
    player.fastestFingerChoices = [Choices.A, Choices.B, Choices.C, Choices.D];
    player.fastestFingerTime = Date.now();
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
    otherPlayer.fastestFingerChoices = [Choices.A, Choices.B, Choices.C, Choices.D];
    otherPlayer.fastestFingerTime = Date.now();
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

  describe('contestantCanChoose', function () {
    it('shouldReturnFalseForBadEvent', function () {
      var serverState = new ServerState(new PlayerMap());

      expect(serverState.contestantCanChoose('badEvent')).to.be.false;
    });

    it('shouldReturnFalseForNotAllHotSeatChoicesRevealed', function () {
      var serverState = new ServerState(new PlayerMap());
      serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'question',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });

      expect(serverState.contestantCanChoose('showHostRevealHotSeatChoice')).to.be.false;
    });

    it('shouldReturnTrueForGoodEventAndAllHotSeatChoicesRevealed', function () {
      var serverState = new ServerState(new PlayerMap());
      serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'question',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });
      serverState.hotSeatQuestion.revealAllChoices();

      expect(serverState.contestantCanChoose('showHostRevealHotSeatChoice')).to.be.true;
    });
  });

  it('getFastestFingerResultsShouldGiveExpectedResultForPlayer', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id'), 'player');
    var startTime = new Date().getTime();
    player.fastestFingerScore = 2;
    player.fastestFingerTime = startTime + 2000;
    serverState.playerMap.putPlayer(player);

    var fastestFingerResults = serverState.getFastestFingerResults(serverState.playerMap,
      startTime);

    expect(fastestFingerResults).to.deep.equal([{
      username: player.username,
      score: 2,
      time: 2000
    }]);
  });

  it('getFastestFingerResultsShouldIgnoreShowHost', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id'), 'player');
    var timeNow = new Date().getTime();
    player.fastestFingerScore = 2;
    player.fastestFingerTime = timeNow - 2000;
    serverState.playerMap.putPlayer(player);
    serverState.setShowHostByUsername(player.username);

    var fastestFingerResults = serverState.getFastestFingerResults(serverState.playerMap, timeNow);

    expect(fastestFingerResults).to.be.empty;
  });

  it('getHotSeatPlayerFromFastestFingerResultsShouldPrioritizeScore', () => {
    var serverState = new ServerState(new PlayerMap());
    var winningPlayer = new Player(new MockSocket('socket_winner'), 'winner');
    var losingPlayer = new Player(new MockSocket('socket_loser'), 'loser');
    serverState.playerMap.putPlayer(winningPlayer);
    serverState.playerMap.putPlayer(losingPlayer);
    var fastestFingerResults = [{
      username: 'winner',
      score: 4,
      time: 2000
    }, {
      username: 'loser',
      score: 3,
      time: 1000
    }];

    var hotSeatPlayer = serverState.getHotSeatPlayerFromFastestFingerResults(fastestFingerResults);

    expect(hotSeatPlayer).to.equal(winningPlayer);
  });

  it('getHotSeatPlayerFromFastestFingerResultsShouldPrioritizeScore', () => {
    var serverState = new ServerState(new PlayerMap());
    var winningPlayer = new Player(new MockSocket('socket_winner'), 'winner');
    var losingPlayer = new Player(new MockSocket('socket_loser'), 'loser');
    serverState.playerMap.putPlayer(winningPlayer);
    serverState.playerMap.putPlayer(losingPlayer);
    var fastestFingerResults = [{
      username: 'loser',
      score: 4,
      time: 2000
    }, {
      username: 'winner',
      score: 4,
      time: 1000
    }];

    var hotSeatPlayer = serverState.getHotSeatPlayerFromFastestFingerResults(fastestFingerResults);

    expect(hotSeatPlayer).to.equal(winningPlayer);
  });

  describe('hotSeatPlayerCanChoose', function () {
    it('shouldReturnFalseForBadEvent', function () {
      var serverState = new ServerState(new PlayerMap());

      expect(serverState.hotSeatPlayerCanChoose('badEvent')).to.be.false;
    });

    it('shouldReturnFalseForNotAllHotSeatChoicesRevealed', function () {
      var serverState = new ServerState(new PlayerMap());
      serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'question',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });

      expect(serverState.hotSeatPlayerCanChoose('showHostRevealHotSeatChoice')).to.be.false;
    });

    it('shouldReturnTrueForGoodEventAndAllHotSeatChoicesRevealed', function () {
      var serverState = new ServerState(new PlayerMap());
      serverState.hotSeatQuestion = new HotSeatQuestion({
        text: 'question',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });
      serverState.hotSeatQuestion.revealAllChoices();

      expect(serverState.hotSeatPlayerCanChoose('showHostRevealHotSeatChoice')).to.be.true;
    });
  });

  it('setHotSeatPlayerByUsernameShouldGiveExpectedResult', () => {
    var serverState = new ServerState(new PlayerMap());
    var player = new Player(new MockSocket('socket_id'), 'player');
    serverState.playerMap.putPlayer(player);

    serverState.setHotSeatPlayerByUsername('player');

    expect(serverState.hotSeatPlayer).to.equal(player);
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

  it('toCompressedClientStateShouldOnlyGiveHotSeatStepDialogForHotSeatPlayer', () => {
    var serverState = new ServerState(new PlayerMap());
    var hotSeatSocket = new MockSocket('socket_hot_seat');
    var hotSeatPlayer = new Player(hotSeatSocket, 'hot_seat');
    var otherSocket = new MockSocket('socket_other');
    var otherPlayer = new Player(otherSocket, 'other');
    serverState.playerMap.putPlayer(hotSeatPlayer);
    serverState.playerMap.putPlayer(otherPlayer);
    serverState.setHotSeatPlayerByUsername('hot_seat');
    serverState.setHotSeatStepDialog(new StepDialog(/*actions=*/[]));

    var compressedHotSeatClientState = serverState.toCompressedClientState(hotSeatSocket,
      /*currenSocketEvent=*/undefined);
    var compressedOtherClientState = serverState.toCompressedClientState(otherSocket,
      /*currenSocketEvent=*/undefined);

    expect(compressedHotSeatClientState.hotSeatStepDialog).to.not.be.undefined;
    expect(compressedOtherClientState.hotSeatStepDialog).to.be.undefined;
  });

  it('toCompressedClientStateShouldSetFastestFingerChoiceActionOnGoodEvent', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealFastestFingerQuestionChoices');

    expect(compressedClientState.choiceAction).to.equal('contestantFastestFingerChoose');
  });

  it('toCompressedClientStateShouldNotSetFastestFingerChoiceActionOnBadEvent', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(mockSocket, 'badEvent');

    expect(compressedClientState.choiceAction).to.be.undefined;
  });

  it('toCompressedClientStateShouldNotSetFastestFingerChoiceActionForShowHost', () => {
    var serverState = new ServerState(new PlayerMap());
    var showHostSocket = new MockSocket('socket_show_host');
    var showHostPlayer = new Player(showHostSocket, 'showHost');
    serverState.playerMap.putPlayer(showHostPlayer);
    serverState.setShowHostByUsername('showHost');

    var compressedClientState = serverState.toCompressedClientState(showHostSocket,
      'showHostRevealFastestFingerQuestionChoices');

    expect(compressedClientState.choiceAction).to.be.undefined;
  });

  it('toCompressedClientStateShouldSetHotSeatChoiceActionOnGoodInputForHotSeatPlayer', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.setHotSeatPlayerByUsername('username');
    serverState.hotSeatQuestion = new HotSeatQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.hotSeatQuestion.revealAllChoices();

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealHotSeatChoice');

    expect(compressedClientState.choiceAction).to.equal('hotSeatChoose');
  });

  it('toCompressedClientStateShouldNotSetHotSeatChoiceActionOnBadEvent', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.setHotSeatPlayerByUsername('username');

    var compressedClientState = serverState.toCompressedClientState(mockSocket, 'badEvent');

    expect(compressedClientState.choiceAction).to.not.equal('hotSeatChoose');
  });

  it('toCompressedClientStateShouldNotSetHotSeatChoiceActionForNonHotSeatPlayer', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealHotSeatChoice');

    expect(compressedClientState.choiceAction).to.not.equal('hotSeatChoose');
  });

  it('toCompressedClientStateShouldSetContestantChooseActionOnGoodEventForContestant', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.hotSeatQuestion = new HotSeatQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.hotSeatQuestion.revealAllChoices();

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealHotSeatChoice');

    expect(compressedClientState.choiceAction).to.equal('contestantChoose');
  });

  it('toCompressedClientStateShouldNotSetContestantChooseActionOnBadEvent', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'badEvent');

    expect(compressedClientState.choiceAction).to.not.equal('contestantChoose');
  });

  it('toCompressedClientStateShouldNotSetContestantChooseActionForShowHost', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.setShowHostByUsername('username');

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealHotSeatChoice');

    expect(compressedClientState.choiceAction).to.not.equal('contestantChoose');
  });

  it('toCompressedClientStateShouldNotSetContestantChooseActionForHotSeatPlayer', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.setHotSeatPlayerByUsername('username');

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'hotSeatChoose');

    expect(compressedClientState.choiceAction).to.not.equal('contestantChoose');
  });

  it('toCompressedClientStateShouldSetQuestionForFastestFingerQuestion', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.fastestFingerQuestion.revealAllChoices();

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      /*currentSocketEvent=*/undefined);

    expect(compressedClientState.question).to.deep.equal({
      text: 'question',
      revealedChoices: serverState.fastestFingerQuestion.revealedChoices,
      madeChoices: player.fastestFingerChoices
    });
  });

  it('toCompressedClientStateShouldSetFastestFingerRevealedAnswersIfPresent', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.fastestFingerQuestion.revealAllChoices();
    serverState.fastestFingerQuestion.revealAnswer();

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      /*currentSocketEvent=*/undefined);

    expect(compressedClientState.fastestFingerRevealedAnswers).to.deep.equal(
      serverState.fastestFingerQuestion.revealedAnswers);
  });

  it('toCompressedClientStateShouldSetResultsIfPresent', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    player.fastestFingerScore = 4;
    player.fastestFingerTime = Date.now();

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealFastestFingerResults');

    expect(compressedClientState.fastestFingerResults).to.not.be.undefined;
    expect(compressedClientState.fastestFingerBestScore).to.equal(4);
  });

  it('toCompressedShouldSetPlayerList', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      /*currentSocketEvent=*/undefined);

    expect(compressedClientState.playerList).to.deep.equal([{
      username: player.username,
      money: player.money
    }]);
  });

  it('toCompressedClientStateShouldSetCelebrationBannerIfAcceptingHotSeatPlayer', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.setHotSeatPlayerByUsername(player.username);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostAcceptHotSeatPlayer');

    expect(compressedClientState.celebrationBanner).to.deep.equal({
      header: LocalizedStrings.FASTEST_FINGER_WINNER,
      text: player.username
    });
  });

  it('toCompressedClientStateShouldSetInfoTextOnCueHotSeatRules', function () {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostCueHotSeatRules');

    expect(compressedClientState.infoText).to.deep.equal(LocalizedStrings.HOT_SEAT_RULES,);
  });

  it('toCompressedClientStateShouldSetQuestionForHotSeatQuestion', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.hotSeatQuestion = new HotSeatQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.hotSeatQuestion.revealAllChoices();

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      /*currentSocketEvent=*/undefined);

    expect(compressedClientState.question).to.deep.equal({
      text: 'question',
      revealedChoices: serverState.hotSeatQuestion.revealedChoices,
      madeChoices: [ player.hotSeatChoice ]
    });
  });
});