const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const LocalizedStrings = require('../../../../localization/LocalizedStrings.js');
const Fonts = require('../Fonts.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const NumberStrings = require('../../../../server/string/NumberStrings.js');
const SliderBuilder = require('./SliderBuilder.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class PhoneConfidenceMeter extends CanvasElement {

  constructor(canvas, socket) {
    // Logical variables
    super(canvas);
    this.socket = socket;
    this.onClick = (x, y) => { this._onClick(x, y); };
    this.onMouseUp = (x, y) => { this._onMouseUp(x, y); };
    this.onMouseMove = (x, y) => { this._onMouseMove(x, y); };

    // Slider bubble draw variables
    var sliderX = this.canvas.width / 2;
    var sliderY = this.canvas.height * Constants.MAIN_SCREEN_SQUARE_HEIGHT_RATIO * 0.75;
    var sliderBubbleWidth = this.canvas.width * Constants.MAIN_SCREEN_SQUARE_WIDTH_RATIO * 0.5;
    var sliderBubbleHeight = 50;
    this.sliderGradient = this.context.createLinearGradient(
      sliderX - sliderBubbleWidth / 2, 0,
      sliderX + sliderBubbleWidth / 2, 0);
    this.sliderGradient.addColorStop(0, Colors.RED);
    this.sliderGradient.addColorStop(1, Colors.GREEN);

    this.slider =
      new SliderBuilder(canvas)
        .setPosition(sliderX, sliderY)
        .setBubbleDimensions(sliderBubbleWidth, sliderBubbleHeight)
        .setStrokeStyle(this.sliderGradient)
        .setHeaderFont(Fonts.STEP_DIALOG_FONT)
        .setValue(0.5)
        .build();

    // Other draw variables
    this.submitButton = undefined;

    this._compose();
  }


  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    // Submit button.
    var submitButtonTextWidth = TextElement.getPredictedTextWidth(this.context,
      LocalizedStrings.CONTESTANT_SUBMIT_PHONE_CONFIDENCE, Fonts.STEP_DIALOG_FONT);
    var submitButtonTextHeight = TextElement.getPredictedTextHeight(this.context, 'TEXT',
      Fonts.STEP_DIALOG_FONT);
    this.submitButton =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(this.slider.x - this.slider.bubbleWidth / 2,
          this.slider.y + this.slider.bubbleHeight * 1.5)
        .setDimensions(submitButtonTextWidth * 1.2, submitButtonTextHeight * 2.5)
        .setText(LocalizedStrings.CONTESTANT_SUBMIT_PHONE_CONFIDENCE)
        .setTextAlign('center')
        .setFont(Fonts.STEP_DIALOG_FONT)
        .setStrokeStyle(Colors.BUBBLE_BORDER_DIALOG_BASE)
        .build();
  }

  _isMouseHoveringOverSubmit(x, y) {
    return this.submitButton.isPointInPath(x, y);
  }

  _onClick(x, y) {
    if (this.slider.isMouseHovering(x, y)) {
      this.slider.onClick(x, y);
    } else if (this._isMouseHoveringOverSubmit(x, y)) {
      this.socket.safeEmit('contestantSetPhoneConfidence', {
        confidence: this.slider.value
      });
    }
  }

  _onMouseMove(x, y) {
    this.slider.onMouseMove(x, y);
  }

  _onMouseUp(x, y) {
    this.slider.onMouseUp(x, y);
  }

  // Draws the element on the canvas.
  draw() {
    this.slider.header.text = 'Confidence: ' + NumberStrings.getPercentageString(
      this.slider.value);
    this.slider.draw();
    this.submitButton.draw();
  }

  // Returns whether the mouse is hovering over the slider.
  isMouseHovering(x, y) {
    return this.slider.isMouseHovering(x, y) || this._isMouseHoveringOverSubmit(x, y);
  }
}

module.exports = PhoneConfidenceMeter;