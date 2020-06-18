const CanvasElement = require('./CanvasElement.js');
const Choices = require('../../../../server/question/Choices.js');
const Colors = require('../Colors.js');
const Fonts = require('../Fonts.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

// Enum for possible states affecting fill style of the bubble
const State = {
  // Black background and white font
  DEFAULT: 0,

  // Orange background and black font
  SELECTED: 1,

  // Green background and black font
  CORRECT: 2,

  // Gradient backgrount and orange font
  CELEBRATION: 3
}

// Array of fill styles for the background of the bubble, indexed by State.
const bubbleFillStyles = [
  (bubble) => { return Colors.BUBBLE_FILL_DEFAULT; },
  (nubble) => { return Colors.BUBBLE_FILL_SELECTED; },
  (bubble) => { return Colors.BUBBLE_FILL_CORRECT; },
  (bubble) => {
    var fillGradient = bubble.context.createLinearGradient(bubble.x, 0, bubble.x + bubble.width, 0);
    fillGradient.addColorStop(0, Colors.BUBBLE_FILL_CELEBRATION_LEFT);
    fillGradient.addColorStop(1, Colors.BUBBLE_FILL_CELEBRATION_RIGHT);
    return fillGradient;
  }
];

// Array of text fill styles for the bubble text, indexed by State.
const textFillStyles = [
  Colors.BUBBLE_TEXT_LIGHT,
  Colors.BUBBLE_TEXT_DARK,
  Colors.BUBBLE_TEXT_DARK,
  Colors.BUBBLE_TEXT_ORANGE
];

// Array of fill styles for the choice letter of a bubble, indexed by State.
const choiceLetterFillStyles = [
  Colors.BUBBLE_TEXT_ORANGE,
  Colors.BUBBLE_TEXT_LIGHT,
  Colors.BUBBLE_TEXT_LIGHT,
  Colors.BUBBLE_TEXT_ORANGE
];

// Bubble UI element used for question text, question choices, and more.
class MillionaireBubble extends CanvasElement {
  
  // Some fields are left default here. It is strongly recommended to use MillionaireBubbleBuilder
  // to construct a MillionaireBubble.
  constructor(canvas, x = 0, y = 0, width = 0, height = 0, text = undefined) {
    super(canvas, x, y);
    this.width = width;
    this.height = height;
    this.text = text;
    this.textAlign = 'left';
    this.font = Fonts.DEFAULT_FONT;
    this.state = State.DEFAULT;
    this.strokeStyle = Colors.DEFAULT_LINE_SHINE;

    this.xOffsets = {
      'left': () => { return this.height / 2 },
      'right': () => { return this.width - this.height / 2},
      'center': () => { return this.width / 2 }
    };

    this.path = undefined;
    this.choiceLetterText = undefined;
    this.choiceText = undefined;

    this._compose();
  }


  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    // TODO: update the shape to recreate the curves in the show.
    this.path = new Path2D();
    this.path.moveTo(this.x, this.y);
    this.path.lineTo(this.x + this.height / 2, this.y - this.height / 2);
    this.path.lineTo(this.x + this.width - this.height / 2, this.y - this.height / 2);
    this.path.lineTo(this.x + this.width, this.y);
    this.path.lineTo(this.x + this.width - this.height / 2, this.y + this.height / 2);
    this.path.lineTo(this.x + this.height / 2, this.y + this.height / 2);
    this.path.lineTo(this.x, this.y);
    this.path.closePath();

    var originalXOffset = this.xOffsets[this.textAlign]();

    this.choiceLetterText =
      new TextElementBuilder(this.canvas)
        .setPosition(this.x + originalXOffset, this.y)
        .setTextAlign('left')
        .setFont(Fonts.CHOICE_LETTER_FONT)
        .setMaxHeight(this.height)
        .build();

    this.choiceText =
      new TextElementBuilder(this.canvas)
        .setPosition(this.x + originalXOffset, this.y)
        .setTextAlign(this.textAlign)
        .setFont(this.font)
        .setMaxWidth(this.width - this.height)
        .setMaxHeight(this.height)
        .build();
  }

  _getChoiceString(choice) {
    return Choices.getString(choice) + ': ';
  }


  // PUBLIC METHODS

  // Returns whether the given point is within the bubble.
  isPointInPath(x, y) {
    return this.context.isPointInPath(this.path, x, y);
  }

  // Draws the element on the canvas.
  draw() {
    console.log('Bubble draw');
    // Draw bubble.
    var oldFillStyle = this.context.fillStyle;
    var oldStrokeStyle = this.context.strokeStyle;

    this.context.fillStyle = bubbleFillStyles[this.state](this);
    this.context.strokeStyle = this.strokeStyle;

    this.context.stroke(this.path);
    this.context.fill(this.path);

    this.context.fillStyle = oldFillStyle;
    this.context.strokeStyle = oldStrokeStyle;

    // Draw text.
    if (this.text !== undefined) {
      var choiceLetterXOffset = 0;
      // Draw choice letter if necessary.
      if (this.choice !== undefined) {
        this.choiceLetterText.fillStyle = choiceLetterFillStyles[this.state];
        this.choiceLetterText.text = this._getChoiceString(this.choice);
        this.choiceLetterText.draw();
        choiceLetterXOffset += TextElement.getPredictedTextWidth(this.context,
          this.choiceLetterText.text, Fonts.CHOICE_LETTER_FONT);
      }

      // Draw text, taking offset of choice letter into account.
      this.choiceText.x += choiceLetterXOffset;
      this.choiceText.fillStyle = textFillStyles[this.state];
      this.choiceText.text = this.text;
      this.choiceText.draw();
      this.choiceText.x -= choiceLetterXOffset;
    }
  }
}

module.exports = MillionaireBubble;
MillionaireBubble.State = State;