const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');

// Encapsulates the background element of the game canvas.
class BackgroundElement extends CanvasElement {
  constructor(canvas) {
    super(canvas);
  }


  // PRIVATE METHODS

  // Draws a side panel using the given params.
  //
  // Expected params format: {
  //   int startX
  //   int targetX
  //   int topY
  //   int bottomY
  //   string gradientStart
  //   string gradientEnd
  // }
  _drawSidePanel(params) {
    // Fill
    var midY = Math.abs(params.bottomY - params.topY) / 2;
    var height = Math.abs(params.bottomY - params.topY);
    var width = Math.abs(params.startX - params.targetX);
    var gradient = this.context.createLinearGradient(params.startX, midY, params.targetX, midY);
    gradient.addColorStop(0, Colors.BACKGROUND_VOID);
    gradient.addColorStop(1, Colors.BACKGROUND_SIDE_GRADIENT);
    this.context.fillStyle = gradient;
    this.context.fillRect(Math.min(params.startX, params.targetX),
      Math.min(params.topY, params.bottomY), width, height);
    // Border
    var lineGradient = this.context.createLinearGradient(params.startX, params.topY, params.startX,
      params.bottomY);
    lineGradient.addColorStop(0, Colors.SIDE_PANEL_LINE_BASE);
    lineGradient.addColorStop(0.5, Colors.SIDE_PANEL_LINE_SHINE);
    lineGradient.addColorStop(1, Colors.SIDE_PANEL_LINE_BASE);
    this.context.strokeStyle = lineGradient;
    this.context.lineWidth = Constants.SIDE_PANEL_LINE_WIDTH;
    this.context.beginPath();
    this.context.moveTo(params.startX, params.topY);
    this.context.lineTo(params.startX, params.bottomY);
    this.context.lineTo(params.targetX, params.bottomY);
    this.context.stroke();
  }

  // PUBLIC METHODS

  // Draws the element on the given canvas context.
  draw() {
    // background
    this.context.fillStyle = Colors.BACKGROUND_VOID;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // panels
    var sideWidth = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    // left panel for players
    this._drawSidePanel({
      startX: sideWidth,
      targetX: 0,
      topY: 0,
      bottomY: this.canvas.height * 2 / 3
    });
    // right panel for money ladder
    this._drawSidePanel({
      startX: this.canvas.width - sideWidth,
      targetX: this.canvas.width,
      topY: 0,
      bottomY: this.canvas.height * 2 / 3
    });
    var bottomPanelSideLength = this.canvas.height * 1 / 3;
    // left panel for walking away with the money
    this._drawSidePanel({
      startX: bottomPanelSideLength,
      targetX: 0,
      topY: this.canvas.height - bottomPanelSideLength + Constants.SIDE_PANEL_LINE_WIDTH / 2,
      bottomY: this.canvas.height + Constants.SIDE_PANEL_LINE_WIDTH * 2
    });
    // right panel for lifline choices
    this._drawSidePanel({
      startX: this.canvas.width - bottomPanelSideLength,
      targetX: this.canvas.width,
      topY: this.canvas.height - bottomPanelSideLength + Constants.SIDE_PANEL_LINE_WIDTH / 2,
      bottomY: this.canvas.height + Constants.SIDE_PANEL_LINE_WIDTH * 2
    });
  }
}

module.exports = BackgroundElement;