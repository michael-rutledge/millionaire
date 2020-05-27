const expect = require('chai').expect;

const Choices = require(process.cwd() + '/server/question/Choices.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');

describe('HotSeatQuestionTest', () => {
  it('getAnswerScoreShouldGiveExpectedResult', () => {
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