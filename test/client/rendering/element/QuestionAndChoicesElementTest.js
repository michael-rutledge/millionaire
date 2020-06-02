const expect = require('chai').expect;

const MockCanvas = require(process.cwd() + '/client/js/test/MockCanvas.js');
const QuestionAndChoicesElement = require(process.cwd() + '/client/js/rendering/element/QuestionAndChoicesElement.js');

describe('QuestionAndChoicesElementTest', () => {
  it('setQuestionShouldNotActivateOnClickWhenNotAllChoicesRevealed', () => {
    var element = new QuestionAndChoicesElement(new MockCanvas());

    element.setQuestion(/*question=*/{
      text: 'questionText',
      revealedChoices: [
        'choice 1',
        'choice 2',
        'choice 3'
      ]
    });

    expect(element.onClick).to.be.undefined;
  });

  it('setQuestionShouldNotActivateOnClickWhenNotAllChoicesRevealed', () => {
    var element = new QuestionAndChoicesElement(new MockCanvas());

    element.setQuestion(/*question=*/{
      text: 'questionText',
      revealedChoices: [
        'choice 1',
        'choice 2',
        'choice 3',
        'choice 4'
      ]
    });

    expect(element.onClick).to.not.be.undefined;
  });
});