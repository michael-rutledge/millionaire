const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');

// Encapsulates the background element of the game canvas.
class QuestionAndChoicesElement extends CanvasElement {
  constructor() {
    // x and y will be ignored upon drawOnCanvas
    super(/*x=*/0, /*y=*/0, /*onClick=*/(x, y) => {
      this._onClick(x, y);
    });
  }


  // PRIVATE METHODS

  // Draws a classic Millionaire style bubble for the given context using the given params.
  //
  // Expects context to be in a good position, noted by startX and startY, to start drawing the
  // element.
  //
  // Expected params format {
  //   int startX
  //   int startY
  //   int width
  //   int height
  // }
  _drawMillionaireBubble(context, params) {
    context.lineTo(params.startX + params.height / 2, params.startY - params.height / 2);
    context.lineTo(params.startX + params.width - params.height / 2,
      params.startY - params.height / 2);
    context.lineTo(params.startX + params.width, params.startY);
    context.lineTo(params.startX + params.width - params.height / 2,
      params.startY + params.height / 2);
    context.lineTo(params.startX + params.height / 2, params.startY + params.height / 2);
    context.lineTo(params.startX, params.startY);
    context.stroke();
    context.fill();
    context.moveTo(params.startX + params.width, params.startY);
  }

  // Draws the big bubble where the question text will sit.
  _drawQuestionBubble(canvas, context, percentUpBottomSide) {
    var bottomSidePanelWidth = canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var questionMidLineY = canvas.height - bottomSidePanelWidth * percentUpBottomSide;
    var startX = canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    context.beginPath();
    context.moveTo(bottomSidePanelWidth, questionMidLineY);
    context.lineTo(startX, questionMidLineY);
    this._drawMillionaireBubble(context, {
      startX: startX,
      startY: questionMidLineY,
      width: canvas.width * Constants.QUESTION_WIDTH_RATIO,
      height: canvas.height * Constants.QUESTION_HEIGHT_RATIO
    });
    context.lineTo(canvas.width - bottomSidePanelWidth, questionMidLineY);
    context.stroke();
  }

  // Draws a row of two choice bubbles where choice text will sit.
  _drawChoiceBubbleRow(canvas, context, percentUpBottomSide) {
    var bottomSidePanelWidth = canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var questionMidLineY = canvas.height - bottomSidePanelWidth * percentUpBottomSide;
    var startX = canvas.width * Constants.BACKGROUND_SIDE_RATIO +
      (canvas.height * Constants.QUESTION_HEIGHT_RATIO / 2 -
        canvas.height * Constants.QUESTION_CHOICE_HEIGHT_RATIO / 2)
    context.beginPath();
    context.moveTo(bottomSidePanelWidth, questionMidLineY);
    context.lineTo(startX, questionMidLineY);
    this._drawMillionaireBubble(context, {
      startX: startX,
      startY: questionMidLineY,
      width: canvas.width * Constants.QUESTION_CHOICE_WIDTH_RATIO,
      height: canvas.height * Constants.QUESTION_CHOICE_HEIGHT_RATIO
    });
    startX = canvas.width - startX - canvas.width * Constants.QUESTION_CHOICE_WIDTH_RATIO
    context.lineTo(startX, questionMidLineY);
    context.stroke();
    this._drawMillionaireBubble(context, {
      startX: startX,
      startY: questionMidLineY,
      width: canvas.width * Constants.QUESTION_CHOICE_WIDTH_RATIO,
      height: canvas.height * Constants.QUESTION_CHOICE_HEIGHT_RATIO
    });
    context.lineTo(canvas.width - bottomSidePanelWidth, questionMidLineY);
    context.stroke();
  }

  _onClick(x, y) {
    console.log('QuestionAndChoicesElement._onClick()');
  }


  // PUBLIC METHODS

  // Draws the element on the given canvas context.
  drawOnCanvas(canvas) {
    var context = canvas.getContext('2d');
    var bottomSidePanelWidth = canvas.height * 1 / 3;
    var lineGradient = context.createLinearGradient(bottomSidePanelWidth, 0,
      canvas.width - bottomSidePanelWidth, 0);
    lineGradient.addColorStop(0, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    lineGradient.addColorStop(0.5, Colors.QUESTION_AND_CHOICES_LINE_SHINE);
    lineGradient.addColorStop(1, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    context.strokeStyle = lineGradient;
    context.lineWidth = Constants.SIDE_PANEL_LINE_WIDTH;
    context.fillStyle = Colors.QUESTION_AND_CHOICES_FILL;
    // Question
    this._drawQuestionBubble(canvas, context, 0.9);
    // Top row of choices
    this._drawChoiceBubbleRow(canvas, context, 0.55);
    this._drawChoiceBubbleRow(canvas, context, 0.27);
  }
}

module.exports = QuestionAndChoicesElement;