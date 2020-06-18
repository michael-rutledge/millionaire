const expect = require('chai').expect;
const should = require('chai').should();

const Choices = require(process.cwd() + '/server/question/Choices.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const FiftyFiftyLifeline = require(process.cwd() + '/server/lifeline/FiftyFiftyLifeline.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

function getUndefinedCountOf(arr) {
  var undefinedCount = 0;
  arr.forEach((element, index) => {
    undefinedCount += element === undefined ? 1 : 0;
  });
  return undefinedCount;
}

describe('FiftyFiftyLifelineTest', function () {
  describe('removeTwoWrongChoices', function () {
    it('shouldRemoveTwoRandomWrongChoices', function () {
      var fiftyFifty = new FiftyFiftyLifeline(new PlayerMap());
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });
      question.revealAllChoices();
      fiftyFifty.startForQuestion(question);

      fiftyFifty.removeTwoWrongChoices();

      getUndefinedCountOf(question.revealedChoices).should.equal(2);
      question.revealedChoices.should.include('choice1');
    });

    it('shouldResetAnswersForContestantsAffected', function () {
      var fiftyFifty = new FiftyFiftyLifeline(new PlayerMap());
      var rightPlayer = new Player(new MockSocket('rightSocket'), 'right');
      var wrongPlayer1 = new Player(new MockSocket('wrongSocket1'), 'wrong1');
      var wrongPlayer2 = new Player(new MockSocket('wrongSocket2'), 'wrong2');
      var wrongPlayer3 = new Player(new MockSocket('wrongSocket3'), 'wrong3');
      fiftyFifty.playerMap.putPlayer(rightPlayer);
      fiftyFifty.playerMap.putPlayer(wrongPlayer1);
      fiftyFifty.playerMap.putPlayer(wrongPlayer2);
      fiftyFifty.playerMap.putPlayer(wrongPlayer3);
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });
      question.shuffledChoices = ['choice1', 'choice2', 'choice3', 'choice4'];
      question.revealAllChoices();
      rightPlayer.chooseHotSeat(Choices.A);
      wrongPlayer1.chooseHotSeat(Choices.B);
      wrongPlayer2.chooseHotSeat(Choices.C);
      wrongPlayer3.chooseHotSeat(Choices.D);
      fiftyFifty.startForQuestion(question);

      fiftyFifty.removeTwoWrongChoices();

      rightPlayer.hotSeatChoice.should.equal(Choices.A);
      expect([wrongPlayer1.hotSeatChoice, wrongPlayer2.hotSeatChoice, wrongPlayer3.hotSeatChoice])
        .to.include(undefined);
    });
  });
});