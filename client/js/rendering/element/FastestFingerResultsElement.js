const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const MillionaireBubble = require('./MillionaireBubble.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');

// Displays fastest finger results per contestant.
class FastestFingerResultsElement extends CanvasElement {

  constructor(canvas, fastestFingerResults, bestScore) {
    super(canvas, /*x=*/0, /*y=*/0);
    this.fastestFingerResults = fastestFingerResults;
    this.bestScore = bestScore;
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

  // Returns the decimal representation string of the given time in milliseconds.
  _getTimeInDecimalSecondString(timeMs) {
    var seconds = Math.floor(timeMs / 1000);
    var decimals = Math.floor(timeMs % 100);
    decimals = decimals < 10 ? '0' + decimals : decimals;
    return seconds + '.' + decimals;
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var oldStrokeStyle = this.context.strokeStyle;

    var bubbleWidth = this.canvas.width * Constants.FASTEST_FINGER_RESULT_WIDTH_RATIO;
    var bubbleHeight = this.canvas.height * Constants.FASTEST_FINGER_RESULT_HEIGHT_RATIO;
    var sidePanelWidth = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    var startX = this.canvas.width / 2 - bubbleWidth / 2;
    var startY = bubbleHeight / 2;
    var verticalPadding = bubbleHeight / 5;
    startY += verticalPadding;
    this.context.strokeStyle = this._getHorizontalLineGradient(sidePanelWidth,
      this.canvas.width - sidePanelWidth);
    var midline = new Path2D();

    this.fastestFingerResults.forEach((result, index) => {
      var y = startY + index * (bubbleHeight + verticalPadding);

      midline.moveTo(sidePanelWidth, y);
      midline.lineTo(startX, y);

      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(startX, y)
        .setDimensions(bubbleWidth, bubbleHeight)
        .setText(result.username + ': ' + this._getTimeInDecimalSecondString(result.time) + 's')
        .setTextAlign('center')
        .setState(result.score >= this.bestScore ?
          MillionaireBubble.State.CORRECT : MillionaireBubble.State.DEFAULT)
        .build()
        .draw();

      midline.moveTo(startX + bubbleWidth, y);
      midline.lineTo(this.canvas.width - sidePanelWidth, y);
      this.context.stroke(midline);
    });

    this.context.strokeStyle = oldStrokeStyle;
  }
}

module.exports = FastestFingerResultsElement;