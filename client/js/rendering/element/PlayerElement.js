const CanvasElement = require('./CanvasElement.js');
const Fonts = require('../Fonts.js');
const MillionaireBubble = require('./MillionaireBubble.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class PlayerElement extends CanvasElement {

  constructor(canvas, x, y, width, height, compressedPlayer) {
    super(canvas, x, y);
    this.width = width;
    this.height = height;
    this.compressedPlayer = compressedPlayer;
  }


  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    var oldStrokeStyle = this.context.strokeStyle;

    // A blank bubble is drawn to allow for multiple text elements on it.
    new MillionaireBubbleBuilder(this.canvas)
      .setPosition(this.x, this.y)
      .setDimensions(this.width, this.height)
      .setState(MillionaireBubble.State.DEFAULT)
      .build()
      .draw();

    var usernameHeight = TextElement.getPredictedTextHeight(this.context,
      this.compressedPlayer.username, Fonts.PLAYER_USERNAME_FONT);

    new TextElementBuilder(this.canvas)
      .setPosition(this.x + this.width / 2, this.y - this.height / 2 + usernameHeight)
      .setMaxWidth(this.width)
      .setText(this.compressedPlayer.username)
      .setFont(Fonts.PLAYER_USERNAME_FONT)
      .setTextAlign('center')
      .build()
      .draw();

    new TextElementBuilder(this.canvas)
      .setPosition(this.x + this.width / 2, this.y + this.height / 2 - usernameHeight)
      .setMaxWidth(this.width)
      .setText('\$' + this.compressedPlayer.money)
      .setFont(Fonts.PLAYER_USERNAME_FONT)
      .setTextAlign('center')
      .build()
      .draw();

    this.context.strokeStyle = oldStrokeStyle;
  }
}

module.exports = PlayerElement;