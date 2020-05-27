const expect = require('chai').expect;

const Choices = require(process.cwd() + '/server/question/Choices.js');
const FastestFingerQuestion = require(process.cwd() + '/server/question/FastestFingerQuestion.js');

describe('FastestFingerQuestionTest', () => {
  it('getAnswerScoreShouldGiveExpectedResult', () => {
    var ffq = new FastestFingerQuestion({
      text: 'question_text',
      orderedChoices: ['choice_1', 'choice_2', 'choice_3', 'choice_4']
    });
    ffq.shuffledChoices = ['choice_2', 'choice_1', 'choice_4', 'choice_3'];

    var correctResult = ffq.getAnswerScore([Choices.B, Choices.A, Choices.D, Choices.C]);
    var incorrectResult = ffq.getAnswerScore([Choices.B, Choices.C, Choices.D, Choices.A]);

    expect(correctResult).to.equal(4);
    expect(incorrectResult).to.equal(2);
  });
});