const expect = require('chai').expect;
const should = require('chai').should();

const Choices = require(process.cwd() + '/server/question/Choices.js');
const FastestFingerQuestion = require(process.cwd() + '/server/question/FastestFingerQuestion.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const LocalizedStrings = require(process.cwd() + '/localization/LocalizedStrings.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerDisplay = require(process.cwd() + '/server/game/PlayerDisplay.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
const ServerState = require(process.cwd() + '/server/game/ServerState.js');
const StepDialog = require(process.cwd() + '/server/game/StepDialog.js');

describe('ServerStateTest', () => {
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

  describe('clearTimers', function () {
    it('shouldClearShowHostAndHotSeatStepDialogTimers', () => {
      var serverState = new ServerState(new PlayerMap());
      serverState.showHostStepDialog = new StepDialog(
        /*actions=*/[],
        /*timeoutFunc=*/() => {},
        /*timeoutMs=*/1000);
      serverState.hotSeatStepDialog = new StepDialog(
        /*actions=*/[],
        /*timeoutFunc=*/() => {},
        /*timeoutMs=*/1000);

      serverState.clearTimers();

      serverState.showHostStepDialog.timeoutActive().should.be.false;
      serverState.hotSeatStepDialog.timeoutActive().should.be.false;
    });
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
    expect(serverState.hotSeatQuestionIndex).to.equal(-1);
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

  it('toCompressedClientStateShouldSetExpectedShowHostInfoText', function () {
    var serverState = new ServerState(new PlayerMap());
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'player');
    player.isShowHost = true;
    serverState.showHost = player;
    serverState.showHostInfoText = 'infoText';
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(socket);

    compressedClientState.infoText.should.equal(serverState.showHostInfoText);
  });

  it('toCompressedClientStateShouldSetExpectedHotSeatInfoText', function () {
    var serverState = new ServerState(new PlayerMap());
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'player');
    player.isHotSeatPlayer = true;
    serverState.hotSeatPlayer = player;
    serverState.hotSeatInfoText = 'infoText';
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(socket);

    compressedClientState.infoText.should.equal(serverState.hotSeatInfoText);
  });

  it('toCompressedClientStateShouldSetExpectedContestantInfoText', function () {
    var serverState = new ServerState(new PlayerMap());
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'player');
    serverState.contestantInfoText = 'infoText';
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(socket);

    compressedClientState.infoText.should.equal(serverState.contestantInfoText);
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

  it('toCompressedClientStateShouldSetExpectedWalkAwayActionButtonForContestant', function () {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.hotSeatQuestion = new HotSeatQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.hotSeatQuestion.revealAllChoices();
    serverState.playerMap.putPlayer(player);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealHotSeatChoice');

    compressedClientState.walkAwayActionButton.should.deep.equal({
      used: false,
      socketEvent: 'hotSeatWalkAway',
      available: false
    });
  });

  it('toCompressedClientStateShouldSetExpectedWalkAwayActionButtonForHotSeatPlayer', function () {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.hotSeatQuestion = new HotSeatQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.hotSeatQuestion.revealAllChoices();
    serverState.playerMap.putPlayer(player);
    serverState.setHotSeatPlayerByUsername(player.username);

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealHotSeatChoice');

    compressedClientState.walkAwayActionButton.should.deep.equal({
      used: false,
      socketEvent: 'hotSeatWalkAway',
      available: true
    });
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
    var playerMap = new PlayerMap();
    var serverState = new ServerState(playerMap);
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.playerMap.putPlayer(player);
    serverState.fastestFingerQuestion = new FastestFingerQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    }, playerMap);
    serverState.fastestFingerQuestion.getResults = () => {
      player.fastestFingerScore = 4;
      return {
        playerResults: [{
          username: player.username,
          score: 4,
          time: 10000
        }],
        hotSeatPlayer: player
      };
    };

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      'showHostRevealFastestFingerResults');

    expect(compressedClientState.fastestFingerResults).to.not.be.undefined;
    expect(compressedClientState.fastestFingerBestScore).to.equal(4);
  });

  it('toCompressedClientStateShouldSetCelebrationBannerIfPresent', () => {
    var serverState = new ServerState(new PlayerMap());
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    serverState.celebrationBanner = {
      header: 'header',
      text: 'text'
    };

    var compressedClientState = serverState.toCompressedClientState(mockSocket,
      /*currentSocketEvent=*/undefined);

    expect(compressedClientState.celebrationBanner).to.deep.equal(serverState.celebrationBanner);
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
      madeChoices: [ player.hotSeatChoice ],
      choiceLocked: player.hotSeatChoice !== undefined
    });
  });

  it('toCompressedClientStateShouldGiveHostHotSeatPlayerChoiceOnHotSeatQuestion', () => {
    var serverState = new ServerState(new PlayerMap());
    var hotSeatSocket = new MockSocket('socket_hot_seat');
    var hotSeatPlayer = new Player(hotSeatSocket, 'hot_seat');
    var showHostSocket = new MockSocket('socket_show_host');
    var showHostPlayer = new Player(showHostSocket, 'show_host');
    serverState.playerMap.putPlayer(hotSeatPlayer);
    serverState.playerMap.putPlayer(showHostPlayer);
    serverState.hotSeatQuestion = new HotSeatQuestion({
      text: 'question',
      orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
    });
    serverState.hotSeatQuestion.revealAllChoices();
    serverState.setShowHostByUsername(showHostPlayer.username);
    serverState.setHotSeatPlayerByUsername(hotSeatPlayer.username);
    hotSeatPlayer.chooseHotSeat(Choices.A);

    var compressedClientState = serverState.toCompressedClientState(showHostSocket,
      /*currentSocketEvent=*/undefined);

    expect(compressedClientState.question.madeChoices).to.deep.equal([
      hotSeatPlayer.hotSeatChoice
    ]);
  });

  it('toCompressedClientStateShouldSetHotSeatQuestionIndex', function () {
    var serverState = new ServerState(new PlayerMap());
    serverState.hotSeatQuestionIndex = 1;

    var compressedClientState = serverState.toCompressedClientState(new MockSocket());

    expect(compressedClientState.hotSeatQuestionIndex).to.equal(1);
  });

  describe('toCompressedClientState', function () {
    it('shouldSetLifelineActionButtons', function () {
      var serverState = new ServerState(new PlayerMap());
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      serverState.playerMap.putPlayer(player);

      var compressedClientState = serverState.toCompressedClientState(mockSocket);

      compressedClientState.fiftyFiftyActionButton.should.not.be.undefined;
      compressedClientState.phoneAFriendActionButton.should.not.be.undefined;
      compressedClientState.askTheAudienceActionButton.should.not.be.undefined;
    });

    it('shouldSetExpectedInfoTextIfPhoneAFriendWaitingOnChoice', function () {
      var serverState = new ServerState(new PlayerMap());
      var mockSocket = new MockSocket('socket');
      var player = new Player(mockSocket, 'player');
      serverState.playerMap.putPlayer(player);
      serverState.phoneAFriend.friend = player;
      serverState.phoneAFriend.isActiveForQuestionIndex = () => { return true; };
      serverState.phoneAFriend.waitingForChoiceFromPlayer = () => { return true; };

      var compressedClientState = serverState.toCompressedClientState(mockSocket);

      compressedClientState.infoText.should.equal(
        LocalizedStrings.CONTESTANT_PHONE_A_FRIEND_NO_CHOICE);
    });

    it('shouldSetShowPhoneConfidenceMeterToTrueIfPhoneAFriendWaitingOnConfidence', function () {
      var serverState = new ServerState(new PlayerMap());
      var mockSocket = new MockSocket('socket');
      var player = new Player(mockSocket, 'player');
      serverState.playerMap.putPlayer(player);
      serverState.phoneAFriend.friend = player;
      serverState.phoneAFriend.isActiveForQuestionIndex = () => { return true; };
      serverState.phoneAFriend.waitingForChoiceFromPlayer = () => { return false; };
      serverState.phoneAFriend.waitingForConfidenceFromPlayer = () => { return true; };

      var compressedClientState = serverState.toCompressedClientState(mockSocket);

      compressedClientState.showPhoneConfidenceMeter.should.be.true;
    });

    it('shouldSetExpectedInfoTextForNonFriendWaitingOnPhoneAFriendChoice', function () {
      var serverState = new ServerState(new PlayerMap());
      var mockSocket = new MockSocket('socket');
      var player = new Player(mockSocket, 'player');
      var phonedFriend = new Player(new MockSocket('phone_socket'), 'friend');
      serverState.playerMap.putPlayer(player);
      serverState.playerMap.putPlayer(phonedFriend);
      serverState.phoneAFriend.friend = phonedFriend;
      serverState.phoneAFriend.isActiveForQuestionIndex = () => { return true; };

      var compressedClientState = serverState.toCompressedClientState(mockSocket,
        /*currentSocketEvent=*/'showHostRevealHotSeatChoice');

      compressedClientState.infoText.should.equal(LocalizedStrings.CONTESTANT_PHONE_A_FRIEND_WAIT);
    });

    it('shouldSetPhoneAFriendResultsWhenResultsAreAvailableForQuestionIndex', function () {
      var serverState = new ServerState(new PlayerMap());
      serverState.phoneAFriend.hasResultsForQuestionIndex = () => {  return true; };

      var compressedClientState = serverState.toCompressedClientState(new MockSocket(),
        /*currentSocketEvent=*/'showHostRevealHotSeatChoice');

      compressedClientState.phoneAFriendResults.should.deep.equal(
        serverState.phoneAFriend.getResults());
    });

    it('shouldSetAskTheAudienceResultsWhenResultsAreAvailableForQuestionIndex', function () {
      var serverState = new ServerState(new PlayerMap());
      serverState.askTheAudience.hasResultsForQuestionIndex = () => {  return true; };

      var compressedClientState = serverState.toCompressedClientState(new MockSocket(),
        /*currentSocketEvent=*/'showHostRevealHotSeatChoice');

      compressedClientState.askTheAudienceResults.should.deep.equal(
        serverState.askTheAudience.getResults());
    });

    it('shouldSetPlayerList', () => {
      var serverState = new ServerState(new PlayerMap());
      var mockSocket = new MockSocket('socket_id');
      var player = new Player(mockSocket, 'username');
      serverState.playerMap.putPlayer(player);

      var compressedClientState = serverState.toCompressedClientState(mockSocket,
        /*currentSocketEvent=*/undefined);

      expect(compressedClientState.playerList).to.deep.equal([player.toCompressed()]);
    });

    it('shouldSetExpectedClickActionsForPlayerListDuringPhoneAFriend', function () {
      var serverState = new ServerState(new PlayerMap());
      var showHostSocket = new MockSocket('socket_show_host');
      var hotSeatSocket = new MockSocket('socket_hot_seat');
      var playerSocket = new MockSocket('socket');
      var showHost = new Player(showHostSocket, 'showHost');
      var hotSeatPlayer = new Player(hotSeatSocket, 'hotSeat');
      var player = new Player(playerSocket, 'player');
      serverState.playerMap.putPlayer(showHost);
      serverState.playerMap.putPlayer(hotSeatPlayer);
      serverState.playerMap.putPlayer(player);
      serverState.setShowHostByUsername(showHost.username);
      serverState.setHotSeatPlayerByUsername(hotSeatPlayer.username);

      var showHostState = serverState.toCompressedClientState(showHostSocket,
        /*currentSocketEvent=*/'hotSeatConfirmPhoneAFriend');
      var hotSeatState = serverState.toCompressedClientState(hotSeatSocket,
        /*currentSocketEvent=*/'hotSeatConfirmPhoneAFriend');
      var playerState = serverState.toCompressedClientState(playerSocket,
        /*currentSocketEvent=*/'hotSeatConfirmPhoneAFriend');

      showHostState.playerList.should.deep.equal([
        hotSeatPlayer.toCompressed(), player.toCompressed()]);
      hotSeatState.playerList.should.deep.equal([
        hotSeatPlayer.toCompressed(), player.toCompressed('hotSeatPickPhoneAFriend')]);
      playerState.playerList.should.deep.equal([
        hotSeatPlayer.toCompressed(), player.toCompressed()]);
    });
  });
});