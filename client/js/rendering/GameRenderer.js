const ASPECT_RATIO = require('./Constants.js').ASPECT_RATIO;

// Handles top-level rendering logic to be done by the HTML canvas.
class GameRenderer {

  constructor(canvas, htmlDocument) {
    if (canvas !== undefined) {
      this.canvas = canvas;
      this.htmlDocument = htmlDocument;
      this.canvasElements = [];

      this.canvas.width = 1600;
      this.canvas.height = this.canvas.width / ASPECT_RATIO;

      this.canvas.onmousedown = (event) => {
        this.onClick(event);
      };
    }
  }


  // PRIVATE METHODS

  // Gets the mouse position of the given event relative to the given canvas.
  _getLocalCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.offsetX * canvas.width / rect.width;
    var y = event.offsetY * canvas.height / rect.height;
    return { x:x, y:y };
  }


  // PUBLIC METHODS

  // Executes when the user clicks on the game canvas.
  onClick(event) {
    var localPos = this._getLocalCursorPosition(this.canvas, event);
    console.log('CLICK: ' + localPos.x + ', ' + localPos.y);
    this.canvasElements.forEach((element, index) => {
      if (element.isClickable()) {
        element.onClick(localPos.x, localPos.y);
      }
    });
  }

  // Updates the game canvas with new CanvasElements.
  //
  // Overwrites any existing CanvasElements drawn on the canvas before.
  updateCanvasElements(newCanvasElements) {
    this.canvasElements = newCanvasElements;

    if (this.canvas.getContext !== undefined) {
      this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvasElements.forEach((element, index) => {
        element.draw();
      });
    }
  }
}

module.exports = GameRenderer;
