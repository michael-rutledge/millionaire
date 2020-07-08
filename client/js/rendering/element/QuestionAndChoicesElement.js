const CanvasElement = require('./CanvasElement.js');
const Choices = require('../../../../server/question/Choices.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const MillionaireBubble = require('./MillionaireBubble.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');

// Encapsulates the background element of the game canvas.
class QuestionAndChoicesElement extends CanvasElement {
  constructor(canvas, socket, choiceAction = undefined) {
    super(canvas);
    this.questionText = undefined;
    this.revealedChoices = [];
    this.madeChoices = [];
    this.correctChoice = undefined;
    this.socket = socket;
    this.choiceAction = choiceAction;

    this.lineGradient = undefined;
    this.choiceBubbles = [];
    this.questionBubble = undefined;
    this.bubbleLinesPath = undefined;

    this._compose();
  }


  // PRIVATE METHODS

  _compose() {
    // Path for midlines
    this.bubbleLinesPath = new Path2D();

    var bottomSidePanelWidth = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var midLineY = this.canvas.height - bottomSidePanelWidth * 0.78;
    var questionHeight = this.canvas.height * Constants.QUESTION_HEIGHT_RATIO;
    var questionWidth = this.canvas.width * Constants.QUESTION_WIDTH_RATIO;
    var questionStartX = this.canvas.width * Constants.WIDTH_SQUARE_RATIO;

    // Line gradient
    this.lineGradient = this.context.createLinearGradient(bottomSidePanelWidth, 0,
      this.canvas.width - bottomSidePanelWidth, 0);
    this.lineGradient.addColorStop(0, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    this.lineGradient.addColorStop(0.5, Colors.QUESTION_AND_CHOICES_LINE_SHINE);
    this.lineGradient.addColorStop(1, Colors.QUESTION_AND_CHOICES_LINE_BASE);

    // Question bubble
    this.questionBubble =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(questionStartX, midLineY)
        .setDimensions(questionWidth, questionHeight)
        .setTextAlign('center')
        .setStrokeStyle(this.lineGradient)
        .build();

    this.bubbleLinesPath.moveTo(bottomSidePanelWidth, this.questionBubble.y);
    this.bubbleLinesPath.lineTo(this.questionBubble.x, this.questionBubble.y);
    this.bubbleLinesPath.moveTo(this.questionBubble.x + this.questionBubble.width,
      this.questionBubble.y);
    this.bubbleLinesPath.lineTo(this.canvas.width - bottomSidePanelWidth,
      this.questionBubble.y);

    // Choices A and B
    this._composeChoiceBubbleRow(/*percentUpBottomSide=*/0.43);
    // Choices C and D
    this._composeChoiceBubbleRow(/*percentUpBottomSide=*/0.15);
  }

  _composeChoiceBubbleRow(percentUpBottomSide) {
    var bottomSidePanelWidth = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var midLineY = this.canvas.height - bottomSidePanelWidth * percentUpBottomSide;
    var bubbleHeight = this.canvas.height * Constants.QUESTION_CHOICE_HEIGHT_RATIO;
    var bubbleWidth = this.canvas.width * Constants.QUESTION_CHOICE_WIDTH_RATIO;
    var startX = this.canvas.width * Constants.WIDTH_SQUARE_RATIO +
      (this.canvas.height * Constants.QUESTION_HEIGHT_RATIO / 2 - bubbleHeight / 2);

    var choiceBubble =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(startX, midLineY)
        .setDimensions(bubbleWidth, bubbleHeight)
        .setTextAlign('left')
        .setStrokeStyle(this.lineGradient)
        .build();
    this.choiceBubbles.push(choiceBubble);

    this.bubbleLinesPath.moveTo(bottomSidePanelWidth, midLineY);
    this.bubbleLinesPath.lineTo(choiceBubble.x, choiceBubble.y);

    startX = this.canvas.width - startX - bubbleWidth;
    this.bubbleLinesPath.moveTo(choiceBubble.x + bubbleWidth, choiceBubble.y);
    this.bubbleLinesPath.lineTo(startX, choiceBubble.y);

    var choiceBubble =
      new MillionaireBubbleBuilder(this.canvas)
        .setPosition(startX, midLineY)
        .setDimensions(bubbleWidth, bubbleHeight)
        .setTextAlign('left')
        .setStrokeStyle(this.lineGradient)
        .build();
    this.choiceBubbles.push(choiceBubble);

    this.bubbleLinesPath.moveTo(choiceBubble.x + bubbleWidth, choiceBubble.y);
    this.bubbleLinesPath.lineTo(this.canvas.width - bottomSidePanelWidth, choiceBubble.y);
  }

  // Returns the MillionaireBubble.State for the given choice.
  _getStateForChoice(choice) {
    var state = MillionaireBubble.State.DEFAULT;

    if (this.madeChoices.includes(choice)) {
      state = MillionaireBubble.State.SELECTED;
    }

    if (this.correctChoice === choice) {
      state = MillionaireBubble.State.CORRECT;
    }

    return state;
  }

  _onClick(x, y) {
    this.choiceBubbles.forEach((bubble, index) => {
      if (bubble.isPointInPath(x, y) && this.choiceAction !== undefined &&
          this._questionIncludesChoiceIndex(index) && !this.choiceLocked) {
        this.socket.safeEmit(this.choiceAction, {
          choice: index
        });
      }
    });
  }

  // Returns whether the given choice index is included.
  _questionIncludesChoiceIndex(choiceIndex) {
    // Verbose if statement here to cover null + undefined + whatever other fuckery may come.
    if (this.revealedChoices[choiceIndex]) return true;
    return false;
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    this.context.strokeStyle = this.lineGradient;
    this.context.stroke(this.bubbleLinesPath);

    this.questionBubble.draw();

    this.choiceBubbles.forEach((choiceBubble, choice) => {
      if (this._questionIncludesChoiceIndex(choice)) {
        choiceBubble.text = this.revealedChoices[choice];
        choiceBubble.choice = choice;
        choiceBubble.state = this._getStateForChoice(choice);
      } else {
        choiceBubble.text = undefined;
        choiceBubble.choice = undefined;
        choiceBubble.state = MillionaireBubble.State.DEFAULT;
      }
      choiceBubble.draw();
    });
  }

  // Returns whether the given coordinates are hovering over any of the choice bubbles.
  isMouseHovering(x, y) {
    for (var i = 0; i < this.choiceBubbles.length; i++) {
      if (this.choiceBubbles[i].isPointInPath(x, y) && this.choiceAction !== undefined
          && this._questionIncludesChoiceIndex(i) && !this.choiceLocked) {
        return true;
      }
    }

    return false;
  }

  // Sets the question information for this element from the given question.
  //
  // Expected to be called before draw().
  setQuestion(question) {
    this.questionBubble.text = question.text;
    this.revealedChoices = question.revealedChoices;
    this.madeChoices = question.madeChoices;
    this.correctChoice = question.correctChoice;
    this.choiceLocked = question.choiceLocked;

    // Choices should only be clickable when all are revealed
    if (this.revealedChoices.length >= Choices.MAX_CHOICES) {
      this.onClick = (x, y) => {
        this._onClick(x, y);
      };
    }
  }
}

module.exports = QuestionAndChoicesElement;