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

    this.lineGradient = undefined;
    this.midline = undefined;
    this.headerText = undefined;
    this.bannerBubble = undefined;

    this._compose();
  }


  // PRIVATE METHPODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    // Various dimensions
    var sidePanelWidth = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var bubbleWidth = this.canvas.width * Constants.CELEBRATION_BANNER_WIDTH_RATIO;
    var bubbleHeight = this.canvas.height * Constants.CELEBRATION_BANNER_HEIGHT_RATIO;
    var startX = this.canvas.width / 2 - bubbleWidth / 2;
    var startY = this.canvas.height - this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO / 2;

    // Line gradient
    this.lineGradient = this.context.createLinearGradient(sidePanelWidth, 0,
      this.canvas.width - sidePanelWidth, 0);
    this.lineGradient.addColorStop(0, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    this.lineGradient.addColorStop(0.5, Colors.QUESTION_AND_CHOICES_LINE_SHINE);
    this.lineGradient.addColorStop(1, Colors.QUESTION_AND_CHOICES_LINE_BASE);

    // Midline
    this.midline = new Path2D();
    this.midline.moveTo(sidePanelWidth, startY);
    this.midline.lineTo(startX, startY);
    this.midline.moveTo(startX + bubbleWidth, startY);
    this.midline.lineTo(this.canvas.width - sidePanelWidth, startY);

    // Header
    this.headerText =
      new TextElementBuilder(this.canvas)
        .setPosition(this.canvas.width / 2, startY - bubbleHeight * 0.75)
        .setText(this.banner.header)
        .setTextAlign('center')
        .setFont(Fonts.CELEBRATION_HEADER_FONT)
        .build();

    // Main bubble
    this.bannerBubble =
      new MillionaireBubbleBuilder(this.canvas)
      .setPosition(startX, startY)
      .setDimensions(bubbleWidth, bubbleHeight)
      .setText(this.banner.text)
      .setTextAlign('center')
      .setState(MillionaireBubble.State.CELEBRATION)
      .setFont(Fonts.CELEBRATION_TEXT_FONT)
      .setStrokeStyle(this.lineGradient)
      .build();
  }


  // PUBLIC METHODS
  
  // Draws the element on the canvas.
  draw() {
    var oldStrokeStyle = this.context.strokeStyle;

    this.context.strokeStyle = this.lineGradient;
    this.context.stroke(this.midline);

    this.headerText.draw();
    this.bannerBubble.draw();

    this.context.strokeStyle = oldStrokeStyle;
  }
}

module.exports = CelebrationBanner;