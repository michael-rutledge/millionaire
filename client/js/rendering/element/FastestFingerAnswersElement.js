const CanvasElement = require('./CanvasElement.js');
const Choices = require('../../../../server/question/Choices.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const MillionaireBubble = require('./MillionaireBubble.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');

// Displays fastest finger answers to contestants.
class FastestFingerAnswersElement extends CanvasElement {

  constructor(canvas, revealedAnswers) {
    super(canvas, /*x=*/0, /*y=*/0);
    this.revealedAnswers = revealedAnswers;
  }


  // PRIVATE METHODS

  // Returns the horizontal lione gradient to be used for the stroke style of the revealed answers.
  _getHorizontalLineGradient(startX, endX) {
    var lineGradient = this.context.createLinearGradient(startX, 0, endX, 0);
    lineGradient.addColorStop(0, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    lineGradient.addColorStop(0.5, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    lineGradient.addColorStop(1, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    return lineGradient;
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var oldStrokeStyle = this.context.strokeStyle;

    var bubbleWidth = this.canvas.width * Constants.QUESTION_CHOICE_WIDTH_RATIO;
    var bubbleHeight = this.canvas.height * Constants.QUESTION_CHOICE_HEIGHT_RATIO;
    var startX = this.canvas.width / 2 - bubbleWidth / 2;
    var startY = bubbleHeight * 2;
    var verticalPadding = bubbleHeight / 5;
    this.context.strokeStyle = this._getHorizontalLineGradient(startX, startX + bubbleWidth);

    for (var i = 0; i < this.revealedAnswers.length; i++) {
      var revealedAnswer = this.revealedAnswers[i];
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(startX, startY + i * (bubbleHeight + verticalPadding))
        .setDimensions(bubbleWidth, bubbleHeight)
        .setText(revealedAnswer.text)
        .setChoice(revealedAnswer.choice)
        .setTextAlign('left')
        .build()
        .draw();
    }

    this.context.strokeStyle = oldStrokeStyle;
  }
}

module.exports = FastestFingerAnswersElement;