const expect = require('chai').expect;

const BackgroundElement = require(process.cwd() + '/client/js/rendering/element/BackgroundElement.js');
const CanvasElement = require(process.cwd() + '/client/js/rendering/element/CanvasElement.js');
const GameClient = require(process.cwd() + '/client/js/game/GameClient.js');
const GameRenderer = require(process.cwd() + '/client/js/rendering/GameRenderer.js');
const MockCanvas = require(process.cwd() + '/client/js/test/MockCanvas.js');
const MockHtmlDocument = require(process.cwd() + '/client/js/test/MockHtmlDocument.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const QuestionAndChoicesElement = require(process.cwd() + '/client/js/rendering/element/QuestionAndChoicesElement.js');

describe('GameClientTest', () => {
  it('getNewCanvasElementsShouldAddBackgroundElementNoMatterWhat', () => {
    var gameClient = new GameClient(new MockSocket('socket_id'),
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{});

    expect(newCanvasElements).to.deep.include(new BackgroundElement(canvas));
  });

  it('getNewCanvasElementsShouldAddQuestionAndChoicesElementNoMatterWhat', () => {
    var gameClient = new GameClient(new MockSocket('socket_id'),
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{});

    expect(newCanvasElements).to.deep.include(new QuestionAndChoicesElement(canvas));
  });

  it('getNewCanvasElementsShouldSetQuestionForQuestionAndChoicesElementIfPresent', () => {
    var gameClient = new GameClient(new MockSocket('socket_id'),
      new GameRenderer(new MockCanvas(), new MockHtmlDocument()));
    var canvas = gameClient.gameRenderer.canvas;
    var question = {
      text: 'text',
      revealedChoices: [ 'choice 1' ]
    };
    var expectedQuestionAndChoicesElement = new QuestionAndChoicesElement(canvas);
    expectedQuestionAndChoicesElement.setQuestion(question);

    var newCanvasElements = gameClient.getNewCanvasElements(/*compressedClientState=*/{
      question: question
    });

    expect(newCanvasElements).to.deep.include(expectedQuestionAndChoicesElement);
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