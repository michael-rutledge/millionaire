const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Fonts = require('../Fonts.js');
const MillionaireBubble = require('./MillionaireBubble.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const NumberStrings = require('../../../../server/string/NumberStrings.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class PlayerElement extends CanvasElement {

  constructor(canvas, x, y, width, height, compressedPlayer, socket) {
    super(canvas, x, y);
    this.width = width;
    this.height = height;
    this.compressedPlayer = compressedPlayer;
    this.socket = socket;

    if (this.compressedPlayer.clickAction) {
      this.onClick = (x, y) => { this._onClick(x, y); };
    }

    this.bubble = undefined;
    this.nameText = undefined;
    this.moneyText = undefined;

    this._compose();
  }


  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    var lineGradient = this.context.createLinearGradient(this.x, 0, this.x + this.width, 0);
    lineGradient.addColorStop(0, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    lineGradient.addColorStop(0.5, Colors.QUESTION_AND_CHOICES_LINE_SHINE);
    lineGradient.addColorStop(1, Colors.QUESTION_AND_CHOICES_LINE_BASE);

    // A blank bubble is drawn to allow for multiple text elements on it.
    this.bubble =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(this.x, this.y)
        .setDimensions(this.width, this.height)
        .setState(MillionaireBubble.State.DEFAULT)
        .setStrokeStyle(lineGradient)
        .build();

    var usernameHeight = TextElement.getPredictedTextHeight(this.context,
      this.compressedPlayer.username, Fonts.PLAYER_USERNAME_FONT);

    this.nameText =
      new TextElementBuilder(this.canvas)
        .setPosition(this.x + this.width / 2, this.y - this.height / 2 + usernameHeight)
        .setMaxWidth(this.width)
        .setText(this.compressedPlayer.username)
        .setFont(Fonts.PLAYER_USERNAME_FONT)
        .setTextAlign('center')
        .build();

    this.moneyText =
      new TextElementBuilder(this.canvas)
        .setPosition(this.x + this.width / 2, this.y + this.height / 2 - usernameHeight)
        .setMaxWidth(this.width)
        .setText(NumberStrings.getMoneyString(this.compressedPlayer.money))
        .setFont(Fonts.PLAYER_USERNAME_FONT)
        .setTextAlign('center')
        .build();
  }

  _onClick(x, y) {
    if (this.isMouseHovering(x, y)) {
      this.socket.emit('hotSeatPickPhoneAFriend', {
        username: this.compressedPlayer.username
      });
    }
  }

  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    this.bubble.draw();
    this.nameText.draw();
    this.moneyText.draw();
  }

  isMouseHovering(x, y) {
    return this.isClickable() && this.bubble.isPointInPath(x, y);
  }
}

module.exports = PlayerElement;