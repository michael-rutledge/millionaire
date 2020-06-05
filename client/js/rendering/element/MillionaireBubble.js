const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const TextElement = require('./TextElement.js');

// Enum for possible states affecting fill style of the bubble
const State = {
  // Black background and white font
  DEFAULT: 0,

  // Orange background and black font
  SELECTED: 1,

  // Green background and black font
  CORRECT: 2,

  // Gradient backgrount and orange font
  WINNINGS: 3
}

// Array of fill styles for the background of the bubble, indexed by State.
const bubbleFillStyles = [
  Colors.QUESTION_AND_CHOICES_FILL,
  Colors.BUBBLE_FILL_SELECTED,
  Colors.BUBBLE_FILL_CORRECT,
  Colors.QUESTION_AND_CHOICES_FILL
];

// Array of text fill styles for the bubble text, indexed by State.
const textFillStyles = [
  Colors.BUBBLE_TEXT_LIGHT,
  Colors.BUBBLE_TEXT_DARK,
  Colors.BUBBLE_TEXT_DARK,
  Colors.BUBBLE_TEXT_LIGHT
];

// Bubble UI element used for question text, question choices, and more.
class MillionaireBubble extends CanvasElement {
  
  // Expected style format {
  //   Choice choice
  //   int state
  //   string textAlign
  // }
  constructor(canvas, x, y, width, height, text = undefined, style = {}) {
    super(canvas, x, y);
    this.width = width;
    this.height = height;
    this.text = text;
    this.style = style;
    this.style.textAlign = style.textAlign === undefined ? 'left' : style.textAlign;
    this.style.state = style.state === undefined ? State.DEFAULT : style.state;
    this.xOffsets = {
      'left': this.height / 2,
      'right': this.width - this.height / 2,
      'center': this.width / 2
    };
    this.path = new Path2D();
  }

  isPointInPath(x, y) {
    return this.context.isPointInPath(this.path, x, y);
  }

  draw() {
    var oldFillStyle = this.context.fillStyle;
    var oldStrokeStyle = this.context.strokeStyle;

    var textFillStyle = textFillStyles[this.style.state];
    this.context.fillStyle = bubbleFillStyles[this.style.state];

    this.path.moveTo(this.x, this.y);
    this.path.lineTo(this.x + this.height / 2, this.y - this.height / 2);
    this.path.lineTo(this.x + this.width - this.height / 2, this.y - this.height / 2);
    this.path.lineTo(this.x + this.width, this.y);
    this.path.lineTo(this.x + this.width - this.height / 2, this.y + this.height / 2);
    this.path.lineTo(this.x + this.height / 2, this.y + this.height / 2);
    this.path.lineTo(this.x, this.y);
    this.path.closePath();
    this.context.stroke(this.path);
    this.context.fill(this.path);

    if (this.text !== undefined) {
      var xOffset = this.xOffsets[this.style.textAlign];

      if (this.style.choice) {
        // Draw choice letter
      }

      new TextElement(this.canvas, this.x + xOffset, this.y, this.text,
        /*style=*/{
          textAlign: this.style.textAlign,
          fillStyle: textFillStyle,
          maxWidth: this.width - this.height,
          maxHeight: this.height
        }).draw();
    }

    this.context.fillStyle = oldFillStyle;
    this.context.strokeStyle = oldStrokeStyle;
  }
}

module.exports = MillionaireBubble;
MillionaireBubble.State = State;