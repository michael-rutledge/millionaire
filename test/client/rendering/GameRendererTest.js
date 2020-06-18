const expect = require('chai').expect;

const CanvasElement = require(process.cwd() + '/client/js/rendering/element/CanvasElement.js');
const GameRenderer = require(process.cwd() + '/client/js/rendering/GameRenderer.js');
const MockCanvas = require(process.cwd() + '/client/js/test/MockCanvas.js');
const MockHtmlDocument = require(process.cwd() + '/client/js/test/MockHtmlDocument.js');

describe('GameRendererTest', () => {
  it('onClickShouldCallOnClickOfAllClickableCanvasElements', () => {
    var gameRenderer = new GameRenderer(new MockCanvas(), new MockHtmlDocument());
    var canvas = gameRenderer.canvas;
    var onClickCount = 0;
    var clickableElement = new CanvasElement(canvas, /*x=*/0, /*y=*/0, /*onClick=*/() => {
      onClickCount++;
    });
    var nonclickableElement = new CanvasElement(canvas);
    var newCanvasElements = [clickableElement, nonclickableElement];
    gameRenderer.updateCanvasElements(newCanvasElements);

    gameRenderer.onClick(/*event*/{ offsetX: 0, offsetY: 0 });

    expect(onClickCount).to.equal(1);
  });
});