const expect = require('chai').expect;

const CanvasElement = require(process.cwd() + '/client/js/rendering/element/CanvasElement.js');

describe('CanvasElementTest', () => {
  it('isClickableShouldReturnTrueForOnClickPresent', () => {
    var canvasElement = new CanvasElement(/*x=*/0, /*y=*/0, /*onClick=*/() => {});

    expect(canvasElement.isClickable()).to.be.true;
  });

  it('isClickableShouldReturnFalseForOnClickAbsent', () => {
    var canvasElement = new CanvasElement(/*x=*/0, /*y=*/0);

    expect(canvasElement.isClickable()).to.be.false;
  });
});