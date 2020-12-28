const expect = require('chai').expect;
const should = require('chai').should();

const AskTheAudienceLifeline = require(process.cwd() + '/server/lifeline/AskTheAudienceLifeline.js');
const Choices = require(process.cwd() + '/server/question/Choices.js');
const FiftyFiftyLifeline = require(process.cwd() + '/server/lifeline/FiftyFiftyLifeline.js');
const HotSeatQuestionGrader = require(process.cwd() + '/server/question/HotSeatQuestionGrader.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const PhoneAFriendLifeline = require(process.cwd() + '/server/lifeline/PhoneAFriendLifeline.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

// Delta of time meant to simulate a long time choosing.
const LONG_CHOICE_TIME = 20000;

describe('HotSeatQuestionGraderTest', function () {
  describe('grade', function () {
    it('shouldNotDoAnythingForHotSeatPlayer', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      player.isHotSeatPlayer = true;
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(0)  // $100
          .setStartTime(player.hotSeatTime);

      grader.grade();

      player.money.should.equal(0);
    });

    it('shouldNotDoAnythingForShowHost', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      player.isShowHost = true;
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(0)  // $100
          .setStartTime(player.hotSeatTime);

      grader.grade();

      player.money.should.equal(0);
    });

    it('shouldGiveExpectedPayoutToVanillaCorrectContestant', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(0)  // $100
          .setStartTime(player.hotSeatTime);

      grader.grade();

      player.money.should.equal(50);
    });

    it('shouldGiveExpectedPayoutToVanillaIncorrectContestant', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      player.chooseHotSeat(Choices.B);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(0)  // $100
          .setStartTime(player.hotSeatTime);

      grader.grade();

      player.money.should.equal(0);
    });

    it('shouldGiveExpectedPayoutToCorrectContestantOnWalkingAway', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(0)  // $100
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setWalkingAway(true);

      grader.grade();

      player.money.should.equal(50);
    });

    it('shouldGiveExpectedPayoutToIncorrectContestantOnWalkingAway', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      player.chooseHotSeat(Choices.B);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(0)  // $100
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setWalkingAway(true);

      grader.grade();

      player.money.should.equal(0);
    });

    it('shouldGiveExpectedPayoutToCorrectContestantOnFiftyFifty', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var fiftyFifty = new FiftyFiftyLifeline(playerMap);
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(4)  // $1000
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setFiftyFiftyLifeline(fiftyFifty);

      grader.grade();

      player.money.should.equal(100);
    });

    it('shouldGiveExpectedPayoutToIncorrectContestantOnFiftyFifty', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var fiftyFifty = new FiftyFiftyLifeline(playerMap);
      player.chooseHotSeat(Choices.B);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(0)  // $100
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setFiftyFiftyLifeline(fiftyFifty);

      grader.grade();

      player.money.should.equal(0);
    });

    it('shouldGiveExpectedPayoutToCorrectContestantWhoFullPhonePersuaded', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var phoneAFriend = new PhoneAFriendLifeline(playerMap);
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      phoneAFriend.pickFriend('player');
      phoneAFriend.maybeSetFriendConfidence(1);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(4)  // $1000
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setPhoneAFriendLifeline(phoneAFriend);

      grader.grade();

      player.money.should.equal(750);
    });

    it('shouldGiveExpectedPayoutToIncorrectContestantWhoFullPhonePersuaded', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var phoneAFriend = new PhoneAFriendLifeline(playerMap);
      player.chooseHotSeat(Choices.B);
      playerMap.putPlayer(player);
      phoneAFriend.pickFriend('player');
      phoneAFriend.maybeSetFriendConfidence(1);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(4)  // $1000
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setPhoneAFriendLifeline(phoneAFriend);

      grader.grade();

      player.money.should.equal(-750);
    });

    it('shouldGiveExpectedPayoutToCorrectContestantWhoZeroPhonePersuaded', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var phoneAFriend = new PhoneAFriendLifeline(playerMap);
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      phoneAFriend.pickFriend('player');
      phoneAFriend.maybeSetFriendConfidence(0);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(4)  // $1000
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setPhoneAFriendLifeline(phoneAFriend);

      grader.grade();

      player.money.should.equal(100);
    });

    it('shouldGiveExpectedPayoutToIncorrectContestantWhoZeroPhonePersuaded', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var phoneAFriend = new PhoneAFriendLifeline(playerMap);
      player.chooseHotSeat(Choices.B);
      playerMap.putPlayer(player);
      phoneAFriend.pickFriend('player');
      phoneAFriend.maybeSetFriendConfidence(0);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(4)  // $1000
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setPhoneAFriendLifeline(phoneAFriend);

      grader.grade();

      player.money.should.equal(0);
    });

    it('shouldGiveExpectedPayoutToCorrectContestantWhoAudiencePersuaded', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var askTheAudience = new AskTheAudienceLifeline(playerMap);
      player.chooseHotSeat(Choices.A);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(4)  // $1000
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setAskTheAudienceLifeline(askTheAudience);

      grader.grade();

      player.money.should.equal(500);
    });

    it('shouldGiveExpectedPayoutToIncorrectContestantWhoAudiencePersuaded', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      var askTheAudience = new AskTheAudienceLifeline(playerMap);
      player.chooseHotSeat(Choices.B);
      playerMap.putPlayer(player);
      var grader =
        new HotSeatQuestionGrader(playerMap)
          .setCorrectChoice(Choices.A)
          .setHotSeatPlayerChoice(player.hotSeatChoice)
          .setQuestionIndex(4)  // $1000
          .setStartTime(player.hotSeatTime - LONG_CHOICE_TIME)
          .setAskTheAudienceLifeline(askTheAudience);

      grader.grade();

      player.money.should.equal(-500);
    });
  });
});