const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const MillionaireBubble = require('./MillionaireBubble.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const TextElementBuilder = require('./TextElementBuilder.js');

// Special bubble that shows for celebration moments in game, like fastest finger conclusion or
// question wins.
class CelebrationBanner extends CanvasElement {

  constructor(canvas, banner) {
    super(canvas, /*x=*/0, /*y=*/0);
    this.banner = banner;
  }


  // PUBLIC METHODS
  
  // Draws the element on the canvas.
  draw() {
    var oldStrokeStyle = this.context.strokeStyle;

    var sidePanelWidth = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var bubbleWidth = this.canvas.width * Constants.CELEBRATION_BANNER_WIDTH_RATIO;
    var bubbleHeight = this.canvas.height * Constants.CELEBRATION_BANNER_HEIGHT_RATIO;
    var startX = this.canvas.width / 2 - bubbleWidth / 2;
    var startY = this.canvas.height - this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO / 2;
    var midline = new Path2D();

    midline.moveTo(sidePanelWidth, startY);
    midline.lineTo(startX, startY);

    new TextElementBuilder(this.canvas)
      .setPosition(this.canvas.width / 2, startY - bubbleHeight * 0.75)
      .setText(this.banner.header)
      .setTextAlign('center')
      .setFont(Fonts.CELEBRATION_HEADER_FONT)
      .build()
      .draw();

    new MillionaireBubbleBuilder(this.canvas)
      .setPosition(startX, startY)
      .setDimensions(bubbleWidth, bubbleHeight)
      .setText(this.banner.text)
      .setTextAlign('center')
      .setState(MillionaireBubble.State.CELEBRATION)
      .setFont(Fonts.CELEBRATION_TEXT_FONT)
      .build()
      .draw();

    midline.moveTo(startX + bubbleWidth, startY);
    midline.lineTo(this.canvas.width - sidePanelWidth, startY);
    this.context.stroke(midline);

    this.context.strokeStyle = oldStrokeStyle;
  }
}

module.exports = CelebrationBanner;