const MockCanvasContext = require('./MockCanvasContext.js');
const MockHtmlElement = require('./MockHtmlElement.js');

// Mocks an HTML5 canvas and its methods.
class MockCanvas extends MockHtmlElement {

  constructor(width = 1600, height = 900) {
    super();
    this.width = width;
    this.height = height;
  }


  // PUBLIC METHODS
  getBoundingClientRect() {
    return {
      width: this.width,
      height: this.height
    };
  }

  getContext(dimension = '2d') {
    return new MockCanvasContext();
  }
}

module.exports = MockCanvas;