const should = require('chai').should();

const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const FiftyFiftyLifeline = require(process.cwd() + '/server/lifeline/FiftyFiftyLifeline.js');

describe('FiftyFiftyLifelineTest', function () {
  describe('removeTwoRandomAnswers', function () {
    it('shouldAddTwoUniqueWrongChoiceIndicesToMaskedChoiceIndices', function () {
      var fiftyFifty = new FiftyFiftyLifeline();
      var question = new HotSeatQuestion({
        text: 'text',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      });
      question.revealAllChoices();
      fiftyFifty.startForQuestion(question);

      fiftyFifty.removeTwoRandomAnswers();

      question.maskedChoiceIndices.should.have.lengthOf(2);
      question.maskedChoiceIndices.should.not.include(question.getCorrectChoice());
      question.maskedChoiceIndices[0].should.not.equal(question.maskedChoiceIndices[1]);
    });
  });
});