const expect = require('chai').expect;
const should = require('chai').should();

const Choices = require(process.cwd() + '/server/question/Choices.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const PhoneAFriendLifeline = require(process.cwd() + '/server/lifeline/PhoneAFriendLifeline.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

describe('PhoneAFriendLifelineTest', function () {
  describe('getResults', function () {
    var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
    phoneAFriend.friendChoice = Choices.A;
    phoneAFriend.friendConfidence = 0.5;

    phoneAFriend.getResults().should.deep.equal({
      choice: phoneAFriend.friendChoice,
      confidence: phoneAFriend.friendConfidence
    });
  });

  describe('hasResultsForQuestionIndex', function () {
    it('shouldReturnFalseForLifelineNotActive', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      phoneAFriend.isActiveForQuestionIndex = () => { return false; };

      phoneAFriend.hasResultsForQuestionIndex(0).should.be.false;
    });

    it('shouldReturnFalseForNoChoiceOrConfidenceMade', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      }, /*questionIndex=*/0);
      phoneAFriend.startForQuestion(question);

      phoneAFriend.hasResultsForQuestionIndex(0).should.be.false;
    });

    it('shouldReturnTrueForGoodInput', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      }, /*questionIndex=*/0);
      phoneAFriend.startForQuestion(question);
      // Set AI choice and confidence
      phoneAFriend.pickFriend(undefined);

      phoneAFriend.hasResultsForQuestionIndex(0).should.be.true;
    });
  });

  describe('isActiveForQuestionIndex', function () {
    it('shouldReturnFalseForLifelineNotUsedYet', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());

      phoneAFriend.isActiveForQuestionIndex(0).should.be.false;
    });

    it('shouldReturnFalseForDifferentQuestionIndex', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      }, /*questionIndex=*/0);
      phoneAFriend.startForQuestion(question);
      // Set AI choice and confidence
      phoneAFriend.pickFriend(undefined);

      phoneAFriend.isActiveForQuestionIndex(1).should.be.false;
    });

    it('shouldReturnTrueForGoodInput', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      }, /*questionIndex=*/0);
      phoneAFriend.startForQuestion(question);
      // Set AI choice and confidence
      phoneAFriend.pickFriend(undefined);

      phoneAFriend.isActiveForQuestionIndex(0).should.be.true;
    });
  });

  describe('maybeSetFriendConfidence', function () {
    it('shouldSetValuesIfNotDefined', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      phoneAFriend.friend = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friend.hotSeatChoice = Choices.A;

      phoneAFriend.maybeSetFriendConfidence(0.5);

      phoneAFriend.friendChoice.should.equal(Choices.A);
      phoneAFriend.friendConfidence.should.equal(0.5);
    });

    it('shouldNotOverwriteExistingConfidence', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      phoneAFriend.friend = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friend.hotSeatChoice = Choices.A;
      phoneAFriend.friendConfidence = 0.75;

      phoneAFriend.maybeSetFriendConfidence(0.5);

      phoneAFriend.friendConfidence.should.equal(0.75);
    });

    it('shouldResetSelectedStateForFriend', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friend = player;
      player.hotSeatChoice = Choices.A;

      phoneAFriend.maybeSetFriendConfidence(0.5);

      phoneAFriend.friend.selectedForPhoneAFriend.should.be.false;
    });
  });

  describe('pickFriend', function () {
    it('shouldSetFriendAndChoiceForHumanPlayer', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.playerMap.putPlayer(player);
      question.revealAllChoices();
      player.chooseHotSeat(Choices.A);
      phoneAFriend.startForQuestion(question);

      phoneAFriend.pickFriend('player');

      phoneAFriend.friend.should.equal(player);
      phoneAFriend.friendChoice.should.equal(Choices.A);
    });

    it('shouldSetChoiceAndConfidenceForAIFriend', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });
      question.revealAllChoices();
      phoneAFriend.startForQuestion(question);

      phoneAFriend.pickFriend(undefined);

      expect(phoneAFriend.friend).to.be.undefined;
      phoneAFriend.friendChoice.should.not.be.undefined;
      phoneAFriend.friendConfidence.should.not.be.undefined;
    });

    it('shouldSetSelectedStateForFriend', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.playerMap.putPlayer(player);

      phoneAFriend.pickFriend('player');

      phoneAFriend.friend.selectedForPhoneAFriend.should.be.true;
    });
  });

  describe('waitingForChoiceFromPlayer', function () {
    it('shouldReturnFalseForChoiceMade', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friendChoice = Choices.A;
      phoneAFriend.friend = player;

      phoneAFriend.waitingForChoiceFromPlayer(player).should.be.false;
    });

    it('shouldReturnFalseForUnexpectedPlayer', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friend = new Player(new MockSocket('socket_id_2'), 'player2');

      phoneAFriend.waitingForChoiceFromPlayer(player).should.be.false;
    });

    it('shouldReturnTrueForFriendWithNoChoiceMade', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friend = player;

      phoneAFriend.waitingForChoiceFromPlayer(player).should.be.true;
    });
  });

  describe('waitingForConfidenceFromPlayer', function () {
    it('shouldReturnFalseForConfidenceSet', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friendConfidence = 0.5;
      phoneAFriend.friend = player;

      phoneAFriend.waitingForConfidenceFromPlayer(player).should.be.false;
    });

    it('shouldReturnFalseForUnexpectedPlayer', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friend = new Player(new MockSocket('socket_id_2'), 'player2');

      phoneAFriend.waitingForConfidenceFromPlayer(player).should.be.false;
    });

    it('shouldReturnTrueForFriendWithNoConfidenceSet', function () {
      var phoneAFriend = new PhoneAFriendLifeline(new PlayerMap());
      var player = new Player(new MockSocket('socket_id'), 'player');
      phoneAFriend.friend = player;

      phoneAFriend.waitingForConfidenceFromPlayer(player).should.be.true;
    });
  });
});