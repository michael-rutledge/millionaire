const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

// Dialog element shown to players when they are in control of game flow.
class StepDialogElement extends CanvasElement {

  constructor(canvas, socket, compressedStepDialog) {
    // Logical variables
    super(canvas, /*x=*/0, /*y=*/0);
    this.socket = socket;
    this.compressedStepDialog = compressedStepDialog;
    this.actionBubbles = [];
    this.onClick = (x, y) => {
      this._onClick(x, y);
    };

    // Draw variables
    this.headerTextElement = undefined;
    this.buttonFont = Fonts.STEP_DIALOG_FONT;
    this.headerFont = Fonts.STEP_DIALOG_HEADER_FONT;

    this._compose();
  }


  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    var maxWidth = 0;
    var maxHeight = 0;
    this.compressedStepDialog.actions.forEach((action, index) => {
      maxHeight = Math.max(maxHeight,
        TextElement.getPredictedTextHeight(this.context, action.text, this.buttonFont));
      maxWidth = Math.max(maxWidth,
        TextElement.getPredictedTextWidth(this.context, action.text, this.buttonFont));
    });
    var verticalPadding = 20;
    var horizontalPadding = 20;
    var bubbleHeight = maxHeight + verticalPadding;
    var bubbleWidth = maxWidth + bubbleHeight + horizontalPadding;
    var startX = this.canvas.width / 2;
    var startY = this.canvas.height - (this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO) -
      bubbleHeight / 2 - verticalPadding;
    var strokeStyle = this._getHorizontalLineGradient(startX, startX + bubbleWidth);

    // Button elements
    for (var i = 0; i < this.compressedStepDialog.actions.length; i++) {
      var action = this.compressedStepDialog.actions[i];
      var bubble =
        new MillionaireBubbleBuilder(this.canvas)
          .setPosition(startX - bubbleWidth / 2, startY - i * (bubbleHeight + verticalPadding))
          .setDimensions(bubbleWidth, bubbleHeight)
          .setText(action.text)
          .setTextAlign('center')
          .setFont(this.buttonFont)
          .setStrokeStyle(strokeStyle)
          .build();
      this.actionBubbles.push(bubble);
    }

    // Header text element
    this.headerTextElement =
      new TextElementBuilder(this.canvas)
        .setPosition(startX,
          startY - this.compressedStepDialog.actions.length * (bubbleHeight + verticalPadding))
        .setText(this.compressedStepDialog.header)
        .setFont(this.headerFont)
        .setTextAlign('center')
        .build();
  }

  // Returns the horizontal lione gradient to be used for the stroke style of the dialog.
  _getHorizontalLineGradient(startX, endX) {
    var lineGradient = this.context.createLinearGradient(startX, 0, endX, 0);
    lineGradient.addColorStop(0, Colors.BUBBLE_BORDER_DIALOG_BASE);
    return lineGradient;
  }

  // Executes on click of this element.
  _onClick(x, y) {
    this.actionBubbles.forEach((bubble, index) => {
      if (bubble.isPointInPath(x, y)) {
        this.socket.safeEmit(this.compressedStepDialog.actions[index].socketEvent, {});
      }
    });
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    this.actionBubbles.forEach((actionBubble, index) => {
      actionBubble.draw();
    });
    this.headerTextElement.draw();
  }

  // Returns whether the given coordinates are hovering over any of the choice bubbles.
  isMouseHovering(x, y) {
    for (var i = 0; i < this.actionBubbles.length; i++) {
      if (this.actionBubbles[i].isPointInPath(x, y)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = StepDialogElement;