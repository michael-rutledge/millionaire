const expect = require('chai').expect;

const HotSeatSession = require(process.cwd() + '/server/question/HotSeatSession.js');

describe('HotSeatSessionTest', () => {
  it('constructorShouldRefreshQuestions', () => {
    var session = new HotSeatSession();

    expect(session.openEasyQuestions).to.have.lengthOf(HotSeatSession.EASY_QUESTIONS.length);
    expect(session.openMediumQuestions).to.have.lengthOf(HotSeatSession.MEDIUM_QUESTIONS.length);
    expect(session.openHardQuestions).to.have.lengthOf(HotSeatSession.HARD_QUESTIONS.length);
  });

  it('getNewQuestionShouldGiveExpectedResult', () => {
    var session = new HotSeatSession();

    var easyQuestion = session.getNewQuestion(0);
    var mediumQuestion = session.getNewQuestion(5);
    var hardQuestion = session.getNewQuestion(10);

    expect(easyQuestion.text).to.not.be.undefined;
    expect(easyQuestion.orderedChoices).to.not.be.undefined;
    expect(session.openEasyQuestions).to.have.lengthOf(HotSeatSession.EASY_QUESTIONS.length - 1);
    expect(mediumQuestion.text).to.not.be.undefined;
    expect(mediumQuestion.orderedChoices).to.not.be.undefined;
    expect(session.openMediumQuestions).to.have.lengthOf(
        HotSeatSession.MEDIUM_QUESTIONS.length - 1);
    expect(hardQuestion.text).to.not.be.undefined;
    expect(hardQuestion.orderedChoices).to.not.be.undefined;
    expect(session.openHardQuestions).to.have.lengthOf(HotSeatSession.HARD_QUESTIONS.length - 1);
  });

  it('getNewQuestionShouldNotRepeatQuestionsAndRefreshQuestionsWhenOut', () => {
    var session = new HotSeatSession();
    var seenTexts = {};
    var question;

    for (let i = 0; i < HotSeatSession.EASY_QUESTIONS.length; i++) {
      question = session.getNewQuestion(0);
      expect(seenTexts.hasOwnProperty(question.text)).to.be.false;
      seenTexts[question.text] = true;
    }
    expect(Object.keys(session.openEasyQuestions)).to.have.lengthOf(
        HotSeatSession.EASY_QUESTIONS.length);
  });
});