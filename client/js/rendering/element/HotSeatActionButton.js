const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Fonts = require('../Fonts.js');
const TextElementBuilder = require('./TextElementBuilder.js');

// Button that the hot seat player can click on to perform an action, such as requesting a lifeline
// or walking away with the money.
class HotSeatActionButton extends CanvasElement {

  // Expects logo xor text to be present. It is strongly recommended to use the builder class for
  // construction.
  constructor(canvas) {
    super(canvas);

    // Path2D used for making the button background. Kept for hit detection.
    this.button = undefined;

    // Path2D that will be the icon of the button, if a visual icon is preferred.
    this.icon = undefined;

    // If a logo is not desired, then text will be used instead.
    this.text = undefined;

    // Color of the outline of the button.
    this.outlineColor = Colors.DEFAULT_TEXT_COLOR;

    // Socket for sending emissions.
    this.socket = undefined;

    // Socket event to be sent on activation.
    this.socketEvent = undefined;

    // Whether this action button has been used.
    this.used = false;

    // Whether this action button can be clicked on.
    this.available = false;

    this.onClick = (x, y) => {
      this._onClick(x, y);
    };
  }


  // PRIVATE METHODS

  // Executes on client click.
  _onClick(x, y) {
    if (this.socket !== undefined && this.isMouseHovering(x, y)) {
      this.socket.safeEmit(this.socketEvent, {});
    }
  }

  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    var oldFillStyle = this.context.fillStyle;
    var oldStrokeStyle = this.context.strokeStyle;
    var oldLineWidth = this.context.lineWidth;
    var oldGlobalAlpha = this.context.globalAlpha;

    var font = Fonts.DEFAULT_FONT;
    var buttonWidth = 60;
    var buttonHeight = buttonWidth * 0.6;

    this.context.fillStyle = Colors.BUBBLE_FILL_DEFAULT;
    this.context.strokeStyle = this.outlineColor;
    this.context.lineWidth = 6;
    this.context.globalAlpha = this.available ? 1.0 : 0.3;

    this.button = new Path2D();
    this.button.ellipse(this.x, this.y, buttonWidth, buttonHeight, 0, 0, 2 * Math.PI);
    this.button.closePath();
    this.context.fill(this.button);
    this.context.stroke(this.button);

    if (this.text !== undefined) {
      new TextElementBuilder(this.canvas)
      .setPosition(this.x, this.y)
      .setText(this.text)
      .setTextAlign('center')
      .setMaxWidth(buttonWidth)
      .setMaxHeight(buttonHeight)
      .build()
      .draw();
    }

    this.context.lineWidth = 10;
    this.context.strokeStyle = 'red';
    if (this.used) {
      var xPath = new Path2D();
      xPath.moveTo(this.x - buttonWidth / 2, this.y - buttonWidth / 2);
      xPath.lineTo(this.x + buttonWidth / 2, this.y + buttonWidth / 2);
      xPath.moveTo(this.x + buttonWidth / 2, this.y - buttonWidth / 2);
      xPath.lineTo(this.x - buttonWidth / 2, this.y + buttonWidth / 2);
      this.context.stroke(xPath);
    }

    this.context.fillStyle = oldFillStyle;
    this.context.strokeStyle = oldStrokeStyle;
    this.context.lineWidth = oldLineWidth;
    this.context.globalAlpha = oldGlobalAlpha;
  }

  // Returns whether the mouse is hovering over this button currently.
  isMouseHovering(x, y) {
    return this.available && !this.used && this.context.isPointInPath(this.button, x, y);
  }
}

module.exports = HotSeatActionButton;