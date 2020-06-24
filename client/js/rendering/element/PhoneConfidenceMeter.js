const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const LocalizedStrings = require('../../../../localization/LocalizedStrings.js');
const Fonts = require('../Fonts.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class PhoneConfidenceMeter extends CanvasElement {

  constructor(canvas, socket) {
    // Logical variables
    super(canvas);
    this.socket = socket;
    this.mouseDownOnSlider = false;
    this.onClick = (x, y) => { this._onClick(x, y); };
    this.onMouseUp = (x, y) => { this._onMouseUp(x, y); };
    this.onMouseMove = (x, y) => { this._onMouseMove(x, y); };

    // Slider bubble draw variables
    this.sliderBubbleWidth = this.canvas.width * Constants.MAIN_SCREEN_SQUARE_WIDTH_RATIO * 0.5;
    this.sliderBubbleHeight = 50;
    this.sliderBubbleX = this.canvas.width / 2;
    this.sliderBubbleY = this.canvas.height * Constants.MAIN_SCREEN_SQUARE_HEIGHT_RATIO * 0.75;
    this.sliderGradient = this.context.createLinearGradient(
      this.sliderBubbleX - this.sliderBubbleWidth / 2, 0,
      this.sliderBubbleX + this.sliderBubbleWidth / 2, 0);
    this.sliderGradient.addColorStop(0, Colors.RED);
    this.sliderGradient.addColorStop(1, Colors.GREEN);
    this.sliderBubble = undefined;

    // Slider draw variables
    this.sliderX = this.sliderBubbleX;
    this.sliderWidth = (this.sliderBubbleWidth - this.sliderBubbleHeight) * 0.9;
    this.sliderMinX = this.sliderBubbleX - this.sliderWidth / 2;
    this.sliderMaxX = this.sliderBubbleX + this.sliderWidth / 2;
    this.mouseDownX = this.sliderX;
    this.slider = undefined;

    // Other draw variables
    this.confidenceText = undefined;
    this.sliderLine = undefined;
    this.submitButton = undefined;

    this._compose();
  }


  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    // Bubble to act as the base plate for the slider.
    this.sliderBubble =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(this.sliderBubbleX - this.sliderBubbleWidth / 2, this.sliderBubbleY)
        .setDimensions(this.sliderBubbleWidth, this.sliderBubbleHeight)
        .setStrokeStyle(this.sliderGradient)
        .build();

    // Line to act as axis for slider.
    this.sliderLine = new Path2D();

    // Confidence text to display current confidence percentage.
    this.confidenceText =
      new TextElementBuilder(this.canvas)
        .setPosition(this.sliderBubbleX, this.sliderBubbleY - this.sliderBubbleHeight * 1.2)
        .setTextAlign('center')
        .setFont(Fonts.STEP_DIALOG_FONT)
        .build();

    // Slider to do to the adjusting.
    this.slider = new Path2D();

    // Submit button.
    var submitButtonTextWidth = TextElement.getPredictedTextWidth(this.context,
      LocalizedStrings.CONTESTANT_SUBMIT_PHONE_CONFIDENCE, Fonts.STEP_DIALOG_FONT);
    var submitButtonTextHeight = TextElement.getPredictedTextHeight(this.context, 'TEXT',
      Fonts.STEP_DIALOG_FONT);
    this.submitButton =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(this.sliderBubbleX - this.sliderBubbleWidth / 2,
          this.sliderBubbleY + this.sliderBubbleHeight * 1.5)
        .setDimensions(submitButtonTextWidth * 1.2, submitButtonTextHeight * 2.5)
        .setText(LocalizedStrings.CONTESTANT_SUBMIT_PHONE_CONFIDENCE)
        .setTextAlign('center')
        .setFont(Fonts.STEP_DIALOG_FONT)
        .setStrokeStyle(Colors.BUBBLE_BORDER_DIALOG_BASE)
        .build();
  }

  // Draws a slider element at the given x
  _drawSliderAtX(x) {
    var sliderPillWidth = 20;
    var sliderPillHeight = this.sliderBubbleHeight * 0.75;

    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'grey';

    this.slider = new Path2D();
    this.slider.moveTo(x - sliderPillWidth / 2, this.sliderBubbleY);
    this.slider.lineTo(x - sliderPillWidth / 2, this.sliderBubbleY - sliderPillHeight / 2);
    this.slider.lineTo(x + sliderPillWidth / 2, this.sliderBubbleY - sliderPillHeight / 2);
    this.slider.lineTo(x + sliderPillWidth / 2, this.sliderBubbleY + sliderPillHeight / 2);
    this.slider.lineTo(x - sliderPillWidth / 2, this.sliderBubbleY + sliderPillHeight / 2);
    this.slider.closePath();
    this.context.fill(this.slider);
    this.context.stroke(this.slider);
  }

  _getPercentageConfidenceFromSliderX(x) {
    var distanceFromZero = x - this.sliderMinX;
    var totalDistance = this.sliderMaxX - this.sliderMinX;
    return distanceFromZero / totalDistance;
  }

  _getPercentageString(percentage) {
    return Math.floor(percentage * 100) + '%';
  }

  _isMouseHoveringOverSlider(x, y) {
    return this.context.isPointInPath(this.slider, x, y) || this.mouseDownOnSlider;
  }

  _isMouseHoveringOverSubmit(x, y) {
    return this.submitButton.isPointInPath(x, y);
  }

  _onClick(x, y) {
    if (this._isMouseHoveringOverSlider(x, y)) {
      this.mouseDownOnSlider = true;
    } else if (this._isMouseHoveringOverSubmit(x, y)) {
      this.socket.emit('contestantSetPhoneConfidence', {
        confidence: this._getPercentageConfidenceFromSliderX(this.sliderX)
      });
    }
  }

  _onMouseMove(x, y) {
    if (this.mouseDownOnSlider) {
      this.mouseDownX = Math.min(this.sliderMaxX, Math.max(this.sliderMinX, x));;
    } 
  }

  _onMouseUp(x, y) {
    this.mouseDownOnSlider = false;
  }

  // Draws the element on the canvas.
  draw() {
    var oldFillStyle = this.context.fillStyle;
    var oldStrokeStyle = this.context.strokeStyle;
    var oldLineWidth = this.context.lineWidth;

    this.sliderBubble.draw();

    this.context.strokeStyle = 'grey';
    this.context.lineWidth = 1;
    this.sliderLine.moveTo(this.sliderMinX, this.sliderBubbleY);
    this.sliderLine.lineTo(this.sliderMaxX, this.sliderBubbleY);
    this.context.stroke(this.sliderLine);

    this.sliderX = this.mouseDownX;
    this._drawSliderAtX(this.sliderX);

    this.confidenceText.text = 'Confidence: ' + this._getPercentageString(
      this._getPercentageConfidenceFromSliderX(this.sliderX));
    this.confidenceText.draw();

    this.submitButton.draw();

    this.context.fillStyle = oldFillStyle;
    this.context.strokeStyle = oldStrokeStyle;
    this.context.lineWidth = oldLineWidth;
  }

  // Returns whether the mouse is hovering over the slider.
  isMouseHovering(x, y) {
    return this._isMouseHoveringOverSlider(x, y) || this._isMouseHoveringOverSubmit(x, y);
  }
}

module.exports = PhoneConfidenceMeter;