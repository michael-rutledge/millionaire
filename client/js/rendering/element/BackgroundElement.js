const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');

// Encapsulates the background element of the game canvas.
class BackgroundElement extends CanvasElement {
  constructor() {
    super();
  }


  // PRIVATE METHODS

  // Draws a side panel on the given context using the given params.
  //
  // Expected params format: {
  //   int startX
  //   int targetX
  //   int topY
  //   int bottomY
  //   string gradientStart
  //   string gradientEnd
  // }
  _drawSidePanel(context, params) {
    // Fill
    var midY = Math.abs(params.bottomY - params.topY) / 2;
    var height = Math.abs(params.bottomY - params.topY);
    var width = Math.abs(params.startX - params.targetX);
    var gradient = context.createLinearGradient(params.startX, midY, params.targetX, midY);
    gradient.addColorStop(0, Colors.BACKGROUND_VOID);
    gradient.addColorStop(1, Colors.BACKGROUND_SIDE_GRADIENT);
    context.fillStyle = gradient;
    context.fillRect(Math.min(params.startX, params.targetX), Math.min(params.topY, params.bottomY),
      width, height);
    // Border
    var lineGradient = context.createLinearGradient(params.startX, params.topY, params.startX,
      params.bottomY);
    lineGradient.addColorStop(0, Colors.SIDE_PANEL_LINE_BASE);
    lineGradient.addColorStop(0.5, Colors.SIDE_PANEL_LINE_SHINE);
    lineGradient.addColorStop(1, Colors.SIDE_PANEL_LINE_BASE);
    context.strokeStyle = lineGradient;
    context.lineWidth = Constants.SIDE_PANEL_LINE_WIDTH;
    context.beginPath();
    context.moveTo(params.startX, params.topY);
    context.lineTo(params.startX, params.bottomY);
    context.lineTo(params.targetX, params.bottomY);
    context.stroke();
  }

  // PUBLIC METHODS

  // Draws the element on the given canvas context.
  drawOnCanvas(canvas) {
    var context = canvas.getContext('2d');
    // background
    context.fillStyle = Colors.BACKGROUND_VOID;
    context.fillRect(0, 0, canvas.width, canvas.height);
    // panels
    var sideWidth = canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    // left panel for players
    this._drawSidePanel(context, {
      startX: sideWidth,
      targetX: 0,
      topY: 0,
      bottomY: canvas.height * 2 / 3
    });
    // right panel for money ladder
    this._drawSidePanel(context, {
      startX: canvas.width - sideWidth,
      targetX: canvas.width,
      topY: 0,
      bottomY: canvas.height * 2 / 3
    });
    var bottomPanelSideLength = canvas.height * 1 / 3;
    // left panel for walking away with the money
    this._drawSidePanel(context, {
      startX: bottomPanelSideLength,
      targetX: 0,
      topY: canvas.height - bottomPanelSideLength + Constants.SIDE_PANEL_LINE_WIDTH/2,
      bottomY: canvas.height + Constants.SIDE_PANEL_LINE_WIDTH * 2
    });
    // right panel for lifline choices
    this._drawSidePanel(context, {
      startX: canvas.width - bottomPanelSideLength,
      targetX: canvas.width,
      topY: canvas.height - bottomPanelSideLength + Constants.SIDE_PANEL_LINE_WIDTH/2,
      bottomY: canvas.height + Constants.SIDE_PANEL_LINE_WIDTH * 2
    });
  }
}

module.exports = BackgroundElement;