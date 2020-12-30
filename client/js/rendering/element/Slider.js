const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Fonts = require('../Fonts.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');
const TextElementBuilder = require('./TextElementBuilder.js');

// Generic slider input element.
class Slider extends CanvasElement {

  // Many fields are left default here. It is strongly recommended to use SliderBuilder to construct
  // a Slider.
  constructor(canvas) {
    // Logical variables
    super(canvas);
    this.mouseDownOnSlider = false;
    this.onClick = (x, y) => { this._onClick(x, y); };
    this.onMouseUp = (x, y) => { this._onMouseUp(x, y); };
    this.onMouseMove = (x, y) => { this._onMouseMove(x, y); };

    // Value of input.
    this.value = 0.5;

    // Slider bubble (container of slider).
    this.bubbleWidth = 500;
    this.bubbleHeight = 100;
    this.bubble = undefined;

    // Knob that is slid to change input value.
    this.knob = undefined;

    // Header information.
    this.headerFont = Fonts.DEFAULT_FONT;
    this.headerText = '';
    this.header = undefined;

    // Style of bubble outline stroke.
    this.strokeStyle = Colors.DEFAULT_LINE_SHINE;

    // Strike-through line that knob rests on.
    this.line = undefined;

    this._compose();
  }


  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    this.knobWidth = (this.bubbleWidth - this.bubbleHeight) * 0.9;
    this.knobMinX = this.x - this.knobWidth / 2;
    this.knobMaxX = this.x + this.knobWidth / 2;
    this.knobX = this.x + ((this.knobMaxX - this.x) * ((this.value - 0.5) * 2));
    this.mouseDownX = this.knobX;

    this.bubble =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(this.x - this.bubbleWidth / 2, this.y)
        .setDimensions(this.bubbleWidth, this.bubbleHeight)
        .setStrokeStyle(this.strokeStyle)
        .build();

    this.line = new Path2D();
    this.knob = new Path2D();

    this.header =
      new TextElementBuilder(this.canvas)
        .setPosition(this.x, this.y - this.bubbleHeight * 1.2)
        .setTextAlign('center')
        .setFont(this.headerFont)
        .setText(this.headerText)
        .build();
  }

  // Draws a slider knob at the given x.
  _drawKnobAtX(x) {
    var knobWidth = 20;
    var knobHeight = this.bubbleHeight * 0.75;

    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'grey';

    this.knob = new Path2D();
    this.knob.moveTo(x - knobWidth / 2, this.y);
    this.knob.lineTo(x - knobWidth / 2, this.y - knobHeight / 2);
    this.knob.lineTo(x + knobWidth / 2, this.y - knobHeight / 2);
    this.knob.lineTo(x + knobWidth / 2, this.y + knobHeight / 2);
    this.knob.lineTo(x - knobWidth / 2, this.y + knobHeight / 2);
    this.knob.closePath();
    this.context.fill(this.knob);
    this.context.stroke(this.knob);
  }

  _isMouseHoveringOverSlider(x, y) {
    return this.context.isPointInPath(this.knob, x, y) || this.mouseDownOnSlider;
  }

  _onClick(x, y) {
    if (this._isMouseHoveringOverSlider(x, y)) {
      this.mouseDownOnSlider = true;
    }
  }

  _onMouseMove(x, y) {
    if (this.mouseDownOnSlider) {
      this.mouseDownX = Math.min(this.knobMaxX, Math.max(this.knobMinX, x));
      this.value = (this.mouseDownX - this.knobMinX) / (this.knobMaxX - this.knobMinX);
    } 
  }

  _onMouseUp(x, y) {
    this.mouseDownOnSlider = false;
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var oldFillStyle = this.context.fillStyle;
    var oldStrokeStyle = this.context.strokeStyle;
    var oldLineWidth = this.context.lineWidth;
    
    this.bubble.draw();

    this.context.strokeStyle = 'grey';
    this.context.lineWidth = 1;
    this.line.moveTo(this.knobMinX, this.y);
    this.line.lineTo(this.knobMaxX, this.y);
    this.context.stroke(this.line);

    this.knobX = this.mouseDownX;
    this._drawKnobAtX(this.knobX);

    this.header.draw();

    this.context.fillStyle = oldFillStyle;
    this.context.strokeStyle = oldStrokeStyle;
    this.context.lineWidth = oldLineWidth;
  }

  // Returns whether the mouse is hovering over the slider.
  isMouseHovering(x, y) {
    return this._isMouseHoveringOverSlider(x, y);
  }
}

module.exports = Slider;