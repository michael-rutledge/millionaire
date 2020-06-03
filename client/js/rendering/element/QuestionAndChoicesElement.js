const CanvasElement = require('./CanvasElement.js');
const Choices = require('../../../../server/question/Choices.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const TextElement = require('./TextElement.js');

// Encapsulates the background element of the game canvas.
class QuestionAndChoicesElement extends CanvasElement {
  constructor(canvas) {
    // x and y will be ignored upon draw
    super(canvas, /*x=*/0, /*y=*/0);
    this.questionText = undefined;
    this.revealedChoices = [];
    this.choiceBubbles = [];
  }


  // PRIVATE METHODS

  // Draws a classic Millionaire style bubble using the given params.
  //
  // Expected params format {
  //   int startX
  //   int startY
  //   int width
  //   int height
  // }
  _drawMillionaireBubble(params) {
    var bubble = new Path2D();
    bubble.moveTo(params.startX, params.startY);
    bubble.lineTo(params.startX + params.height / 2, params.startY - params.height / 2);
    bubble.lineTo(params.startX + params.width - params.height / 2,
      params.startY - params.height / 2);
    bubble.lineTo(params.startX + params.width, params.startY);
    bubble.lineTo(params.startX + params.width - params.height / 2,
      params.startY + params.height / 2);
    bubble.lineTo(params.startX + params.height / 2, params.startY + params.height / 2);
    bubble.lineTo(params.startX, params.startY);
    bubble.closePath();
    this.context.stroke(bubble);
    this.context.fill(bubble);
    return bubble;
  }

  // Draws the big bubble where the question text will sit.
  _drawQuestionBubble(percentUpBottomSide, questionText) {
    var bubbleLine = new Path2D();
    var bottomSidePanelWidth = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var questionMidLineY = this.canvas.height - bottomSidePanelWidth * percentUpBottomSide;
    var questionHeight = this.canvas.height * Constants.QUESTION_HEIGHT_RATIO;
    var questionWidth = this.canvas.width * Constants.QUESTION_WIDTH_RATIO;
    var startX = this.canvas.width * Constants.WIDTH_SQUARE_RATIO;

    bubbleLine.moveTo(bottomSidePanelWidth, questionMidLineY);
    bubbleLine.lineTo(startX, questionMidLineY);
    this._drawMillionaireBubble({
      startX: startX,
      startY: questionMidLineY,
      width: questionWidth,
      height: questionHeight
    });
    bubbleLine.moveTo(startX + questionWidth, questionMidLineY);
    bubbleLine.lineTo(this.canvas.width - bottomSidePanelWidth, questionMidLineY);
    this.context.stroke(bubbleLine);

    // Question and choice text
    if (questionText) {
      new TextElement(this.canvas, startX + questionWidth / 2, questionMidLineY, questionText,
        /*style=*/{
          textAlign: 'center',
          maxWidth: questionWidth - questionHeight,
          maxHeight: questionHeight
        }).draw();
    }
  }

  // Draws a row of two choice bubbles where choice text will sit.
  _drawChoiceBubbleRow(percentUpBottomSide, leftBubbleText, rightBubbleText) {
    var bubbleLine = new Path2D();
    var bottomSidePanelWidth = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var questionMidLineY = this.canvas.height - bottomSidePanelWidth * percentUpBottomSide;
    var bubbleHeight = this.canvas.height * Constants.QUESTION_CHOICE_HEIGHT_RATIO;
    var bubbleWidth = this.canvas.width * Constants.QUESTION_CHOICE_WIDTH_RATIO;
    var startX = this.canvas.width * Constants.WIDTH_SQUARE_RATIO +
      (this.canvas.height * Constants.QUESTION_HEIGHT_RATIO / 2 - bubbleHeight / 2);

    bubbleLine.moveTo(bottomSidePanelWidth, questionMidLineY);
    bubbleLine.lineTo(startX, questionMidLineY);
    this.choiceBubbles.push(this._drawMillionaireBubble({
      startX: startX,
      startY: questionMidLineY,
      width: bubbleWidth,
      height: bubbleHeight
    }));

    if (leftBubbleText) {
      new TextElement(this.canvas, startX + bubbleHeight / 2, questionMidLineY, leftBubbleText,
        /*style=*/{
          textAlign: 'left',
          maxWidth: bubbleWidth - bubbleHeight,
          maxHeight: bubbleHeight
        }).draw();
    }

    bubbleLine.moveTo(startX + bubbleWidth, questionMidLineY);
    startX = this.canvas.width - startX - bubbleWidth;
    bubbleLine.lineTo(startX, questionMidLineY);
    this.choiceBubbles.push(this._drawMillionaireBubble({
      startX: startX,
      startY: questionMidLineY,
      width: bubbleWidth,
      height: bubbleHeight
    }));

    if (rightBubbleText) {
      new TextElement(this.canvas, startX + bubbleHeight / 2, questionMidLineY, rightBubbleText,
        /*style=*/{
          textAlign: 'left',
          maxWidth: bubbleWidth - bubbleHeight,
          maxHeight: bubbleHeight
        }).draw();
    }

    bubbleLine.moveTo(startX + bubbleWidth, questionMidLineY);
    bubbleLine.lineTo(this.canvas.width - bottomSidePanelWidth, questionMidLineY);
    this.context.stroke(bubbleLine);
  }

  _onClick(x, y) {
    // TODO: make this emit a desired action
    this.choiceBubbles.forEach((bubble, index) => {
      console.log('  HIT ' + index + ': ' + this.context.isPointInPath(bubble, x, y));
    });
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var bottomSidePanelWidth = this.canvas.height * 1 / 3;
    var lineGradient = this.context.createLinearGradient(bottomSidePanelWidth, 0,
      this.canvas.width - bottomSidePanelWidth, 0);
    lineGradient.addColorStop(0, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    lineGradient.addColorStop(0.5, Colors.QUESTION_AND_CHOICES_LINE_SHINE);
    lineGradient.addColorStop(1, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    this.context.strokeStyle = lineGradient;
    this.context.lineWidth = Constants.SIDE_PANEL_LINE_WIDTH;
    this.context.fillStyle = Colors.QUESTION_AND_CHOICES_FILL;
    // Question bubble
    this._drawQuestionBubble(/*percentUpBottomSide=*/0.78, this.questionText);
    // A + B bubbles
    this._drawChoiceBubbleRow(/*percentUpBottomSide=*/0.43,
      this.revealedChoices[Choices.A],
      this.revealedChoices[Choices.B]);
    // C + D bubbles
    this._drawChoiceBubbleRow(/*percentUpBottomSide=*/0.15,
      this.revealedChoices[Choices.C],
      this.revealedChoices[Choices.D]);
  }

  // Sets the question information for this element from the given question.
  //
  // Expected to be called before draw().
  setQuestion(question) {
    this.questionText = question.text;
    this.revealedChoices = question.revealedChoices;

    // Choices should only be clickable when all are revealed
    if (this.revealedChoices.length >= Choices.MAX_CHOICES) {
      this.onClick = (x, y) => {
        this._onClick(x, y);
      };
    }
  }
}

module.exports = QuestionAndChoicesElement;