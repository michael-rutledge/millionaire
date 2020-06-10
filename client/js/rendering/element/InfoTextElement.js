const CanvasElement = require('./CanvasElement.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const TextElementBuilder = require('./TextElementBuilder.js');

// Text element that displays information to all players, in the middle of the screen.
class InfoTextElement extends CanvasElement {

  constructor(canvas, infoText) {
    super(canvas, /*x=*/0, /*y=*/0);
    this.infoText = infoText;
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var startX = this.canvas.width / 2;
    var startY = this.canvas.height * Constants.INFO_TEXT_HEIGHT_RATIO / 2;

    new TextElementBuilder(this.canvas)
      .setPosition(startX, startY)
      .setText(this.infoText)
      .setFont(Fonts.INFO_TEXT_FONT)
      .setMaxWidth(this.canvas.width * Constants.INFO_TEXT_WIDTH_RATIO)
      .setMaxHeight(this.canvas.height * Constants.INFO_TEXT_HEIGHT_RATIO)
      .setTextAlign('center')
      .setVerticalPadding(10)
      .build()
      .draw();
  }
}

module.exports = InfoTextElement;