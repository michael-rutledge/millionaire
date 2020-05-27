const expect = require('chai').expect;

const Question = require(process.cwd() + '/server/question/Question.js');

describe('QuestionTest', () => {
  it('constructorShouldGiveExpectedResult', () => {
    var question = new Question({
      text: 'question_text',
      orderedChoices: ['a', 'b', 'c', 'd']
    });

    expect(question.text).to.equal('question_text');
    expect(question.orderedChoices).to.deep.equal(['a', 'b', 'c', 'd']);
    expect(question.shuffledChoices).to.have.lengthOf(4);
    expect(question.revealedChoices).to.be.empty;
  });

  it('revealAllChoicesShouldGiveExpectedResult', () => {
    var question = new Question({
      text: 'question_text',
      orderedChoices: ['a', 'b', 'c', 'd']
    });

    question.revealAllChoices();

    expect(question.revealedChoices).to.deep.equal(question.shuffledChoices);
  });

  it('revealChoiceShouldGiveExpectedResultForChoicesLeft', () => {
    var question = new Question({
      text: 'question_text',
      orderedChoices: ['a', 'b', 'c', 'd']
    });

    question.revealChoice();

    expect(question.revealedChoices).to.deep.equal([question.shuffledChoices[0]]);
  });

  it('revealChoiceShouldGiveExpectedResultForChoicesLeft', () => {
    var question = new Question({
      text: 'question_text',
      orderedChoices: ['a', 'b', 'c', 'd']
    });
    question.revealAllChoices();

    question.revealChoice();

    expect(question.revealedChoices).to.deep.equal(question.shuffledChoices);
  });
});