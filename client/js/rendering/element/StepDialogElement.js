const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const TextElement = require('./TextElement.js');

// Dialog element shown to players when they are in control of game flow.
class StepDialogElement extends CanvasElement {

  constructor(canvas, socket, compressedStepDialog) {
    super(canvas, /*x=*/0, /*y=*/0);
    this.socket = socket;
    this.compressedStepDialog = compressedStepDialog;
    this.actionBubbles = [];
    this.onClick = (x, y) => {
      this._onClick(x, y);
    };
  }


  // PRIVATE METHODS

  // Executes on click of this element.
  _onClick(x, y) {
    this.actionBubbles.forEach((bubble, index) => {
      if (bubble.isPointInPath(x, y)) {
        this.socket.emit(this.compressedStepDialog.actions[index].socketEvent, {});
      }
    });
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  // TODO: color and shape the buttons properly.
  draw() {
    var oldFont = this.context.font;

    var textElements = [];
    var maxWidth = 0;
    var maxHeight = 0;
    this.context.font = Fonts.DEFAULT_FONT;
    this.compressedStepDialog.actions.forEach((action, index) => {
      maxHeight = Math.max(maxHeight,
        TextElement.getPredictedTextHeight(this.context, action.text));
      maxWidth = Math.max(maxWidth, TextElement.getPredictedTextWidth(this.context, action.text));
    });
    var verticalPadding = 20;
    var horizontalPadding = 20;
    var bubbleHeight = maxHeight + verticalPadding;
    var bubbleWidth = maxWidth + bubbleHeight + horizontalPadding;
    var startX = this.canvas.width / 2;
    var startY = this.canvas.height - (this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO) -
      bubbleHeight / 2 - verticalPadding;

    for (var i = 0; i < this.compressedStepDialog.actions.length; i++) {
      var action = this.compressedStepDialog.actions[i];
      var bubble =
        new MillionaireBubbleBuilder(this.canvas)
          .setPosition(startX - bubbleWidth / 2, startY - i * (bubbleHeight + verticalPadding))
          .setDimensions(bubbleWidth, bubbleHeight)
          .setText(action.text)
          .setTextAlign('center')
          .setFont(this.context.font)
          .build();
      bubble.draw();
      this.actionBubbles.push(bubble);
    }

    this.context.font = oldFont;
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