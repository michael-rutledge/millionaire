const should = require('chai').should();

const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const Lifeline = require(process.cwd() + '/server/lifeline/Lifeline.js');

describe('LifelineTest', function () {
  describe('startForQuestion', function () {
    it('shouldSetQuestion', function () {
      var lifeline = new Lifeline();
      var expectedQuestion = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });

      lifeline.startForQuestion(expectedQuestion);

      lifeline.question.should.equal(expectedQuestion);
    });

    it('shouldSetUsedToTrue', function () {
      var lifeline = new Lifeline();

      lifeline.startForQuestion(new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      }));

      lifeline.used.should.be.true;
    });
  });

  describe('toCompressedHotSeatActionButton', function () {
    it('shouldGiveExpectedResult', function () {
      var lifeline = new Lifeline('socketEvent');

      lifeline.toCompressedHotSeatActionButton(/*available=*/true).should.deep.equal({
        used: false,
        socketEvent: 'socketEvent',
        available: true
      });
    });
  });
});