const expect = require('chai').expect;

const BackgroundElement = require(process.cwd() + '/client/js/rendering/element/BackgroundElement.js');
const CanvasElement = require(process.cwd() + '/client/js/rendering/element/CanvasElement.js');
const CelebrationBanner = require(process.cwd() + '/client/js/rendering/element/CelebrationBanner.js');
const Choices = require(process.cwd() + '/server/question/Choices.js');
const FastestFingerAnswersElement = require(process.cwd() + '/client/js/rendering/element/FastestFingerAnswersElement.js');
const FastestFingerResultsElement = require(process.cwd() + '/client/js/rendering/element/FastestFingerResultsElement.js');
const GameClient = require(process.cwd() + '/client/js/game/GameClient.js');
const GameRenderer = require(process.cwd() + '/client/js/rendering/GameRenderer.js');
const MockCanvas = require(process.cwd() + '/client/js/test/MockCanvas.js');
const MockHtmlDocument = require(process.cwd() + '/client/js/test/MockHtmlDocument.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const QuestionAndChoicesElement = require(process.cwd() + '/client/js/rendering/element/QuestionAndChoicesElement.js');
const StepDialogElement = require(process.cwd() + '/client/js/rendering/element/StepDialogElement.js');

describe('GameClientTest', () => {
  it('getNewCanvasElementsShouldAddBackgroundElementNoMatterWhat', () => {
    var gameClient = new GameClient(new MockSocket('socket_id'),
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{});

    expect(newCanvasElements).to.deep.include(new BackgroundElement(canvas));
  });

  it('getNewCanvasElementsShouldAddQuestionAndChoicesElementNoMatterWhat', () => {
    var mockSocket = new MockSocket('socket_id');
    var gameClient = new GameClient(mockSocket,
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{});

    expect(newCanvasElements).to.deep.include(new QuestionAndChoicesElement(canvas, mockSocket));
  });

  // No test for show host step dialog because it doesn't work, even though e2e testing shows the
  // desired behavior is there.
  // TODO: figure out the showHostStepDialogTest.

  it('getNewCanvasElementsShouldSetQuestionForQuestionAndChoicesElementIfPresent', () => {
    var mockSocket = new MockSocket('socket_id');
    var gameClient = new GameClient(mockSocket,
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;
    var question = {
      text: 'text',
      revealedChoices: [ 'choice 1' ],
      madeChoices: []
    };
    var expectedQuestionAndChoicesElement = new QuestionAndChoicesElement(canvas, mockSocket);
    expectedQuestionAndChoicesElement.setQuestion(question);
    expectedQuestionAndChoicesElement.choiceAction = 'choiceAction';

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{
      question: question,
      choiceAction: 'choiceAction'
    });

    expect(newCanvasElements).to.deep.include(expectedQuestionAndChoicesElement);
  });

  it('getNewCanvasElementsShouldSetFastestFingerAnswersElementForRevealedAnswers', () => {
    var mockSocket = new MockSocket('socket_id');
    var gameClient = new GameClient(mockSocket,
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;
    var revealedAnswers = [{
      text: 'Answer',
      choice: Choices.A
    }];
    var expectedFastestFingerAnswersElement = new FastestFingerAnswersElement(canvas,
      revealedAnswers);

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{
      fastestFingerRevealedAnswers: revealedAnswers
    });

    expect(newCanvasElements).to.deep.include(expectedFastestFingerAnswersElement);
  });

  // No test for fastest finger results because it doesn't work, even though e2e testing shows the
  // desired behavior is there.
  // TODO: figure out the fastestFingerResultsElement test.

  it('getNewCanvasElementsShouldSetCelebrationBannerIfPresent', () => {
    var mockSocket = new MockSocket('socket_id');
    var gameClient = new GameClient(mockSocket,
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;
    var celebrationBanner = {
      header: 'header',
      text: 'text'
    };
    var expectedCelebrationBanner = new CelebrationBanner(canvas, celebrationBanner);

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{
      celebrationBanner: celebrationBanner
    });

    expect(newCanvasElements).to.deep.include(expectedCelebrationBanner);
  });

  it('updateGameShouldUpdateCanvasElementsInGameRenderer', () => {
    var gameClient = new GameClient(new MockSocket('socket_id'),
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;
    var newCanvasElements = [new CanvasElement(canvas), new CanvasElement(canvas)];
    gameClient.getNewCanvasElements = (compressedClientState) => {
      return newCanvasElements;
    };

    gameClient.updateGame(/*compressedClientState*/{});

    expect(gameClient.gameRenderer.canvasElements).to.deep.equal(newCanvasElements);
  });
});