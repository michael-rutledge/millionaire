const expect = require('chai').expect;

const Choices = require(process.cwd() + '/server/question/Choices.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');

describe('HotSeatQuestionTest', function () {
  describe('answerIsCorrect', function () {
    it('shouldGiveExpectedResult', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      var correctResult = hsq.answerIsCorrect(Choices.C);
      var incorrectResult = hsq.answerIsCorrect(Choices.A);

      expect(correctResult).to.be.true;
      expect(incorrectResult).to.be.false;
    });
  });

  describe('toCompressed', function () {
    it('shouldSetCorrectChoiceIfRequested', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      var result = hsq.toCompressed(/*madeChoice=*/Choices.A, /*showCorrectChoice=*/true);

      expect(result.correctChoice).to.equal(Choices.C);
    });

    it('shouldNotSetCorrectChoiceIfNotRequested', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      var result = hsq.toCompressed(/*madeChoice=*/Choices.A, /*showCorrectChoice=*/false);

      expect(result.correctChoice).to.be.undefined;
    });
  });
});