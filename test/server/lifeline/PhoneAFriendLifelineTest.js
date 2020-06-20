const expect = require('chai').expect;
const should = require('chai').should();

const Choices = require(process.cwd() + '/server/question/Choices.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const PhoneAFriendLifeline = require(process.cwd() + '/server/lifeline/PhoneAFriendLifeline.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

describe('PhoneAFriendLifelineTest', function () {
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
  });
});