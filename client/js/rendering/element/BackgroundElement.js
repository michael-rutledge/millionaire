const CanvasElement = require('./CanvasElement.js');

// Encapsulates the background element of the game canvas.
class BackgroundElement extends CanvasElement {
  constructor() {
    super();
  }

  // Draws the element on the given canvas context.
  drawOnCanvas(canvas) {
    var context = canvas.getContext('2d');
    context.fillStyle = '#150023';
    context.fillRect(this.x, this.y, canvas.width, canvas.height);
  }
}

module.exports = BackgroundElement;