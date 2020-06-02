const expect = require('chai').expect;

const CanvasElement = require(process.cwd() + '/client/js/rendering/element/CanvasElement.js');
const MockCanvas = require(process.cwd() + '/client/js/test/MockCanvas.js');

describe('CanvasElementTest', () => {
  it('isClickableShouldReturnTrueForOnClickPresent', () => {
    var canvasElement = new CanvasElement(new MockCanvas(), /*x=*/0, /*y=*/0, /*onClick=*/() => {});

    expect(canvasElement.isClickable()).to.be.true;
  });

  it('isClickableShouldReturnFalseForOnClickAbsent', () => {
    var canvasElement = new CanvasElement(new MockCanvas(), /*x=*/0, /*y=*/0);

    expect(canvasElement.isClickable()).to.be.false;
  });
});