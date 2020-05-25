const expect = require('chai').expect;

const FastestFingerSession = require(process.cwd() + '/server/question/FastestFingerSession.js');

describe('FastestFingerSessionTest', () => {
  it('constructorShouldRefreshQuestions', () => {
    var session = new FastestFingerSession();

    expect(session.questionsAvailable()).to.equal(FastestFingerSession.QUESTIONS.length);
  });

  it('getNewQuestionShouldGiveExpectedResult', () => {
    var session = new FastestFingerSession();

    var question = session.getNewQuestion();

    expect(question.text).to.not.be.undefined;
    expect(question.orderedChoices).to.not.be.undefined;
  });

  it('getNewQuestionShouldNotRepeatQuestionsAndRefreshQuestionsWhenOut', () => {
    var session = new FastestFingerSession();
    var seenTexts = {};
    var question;

    for (var i = 0; i < FastestFingerSession.QUESTIONS.length; i++) {
      question = session.getNewQuestion();
      expect(seenTexts.hasOwnProperty(question.text)).to.be.false;
      seenTexts[question.text] = true;
    }
    expect(Object.keys(session.openQuestions).length).to.equal(
        FastestFingerSession.QUESTIONS.length);
  });
});