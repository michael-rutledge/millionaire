const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

const MONEY_STRINGS = require('../../../../server/question/MoneyTree.js').MONEY_STRINGS;

// UI element that shows which question the game currently sits at.
class MoneyTreeElement extends CanvasElement {

  constructor(canvas, hotSeatQuestionIndex) {
    super(canvas);
    this.hotSeatQuestionIndex = hotSeatQuestionIndex;
  }


  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    var oldFillStyle = this.context.fillStyle;

    var moneyTreeFont = Fonts.MONEY_TREE_FONT;
    var textHeight = TextElement.getPredictedTextHeight(this.context, 'TEXT', moneyTreeFont);
    var verticalPadding = textHeight * 0.5;
    var totalExpectedHeight = MONEY_STRINGS.length * (textHeight + verticalPadding);
    var startX = this.canvas.width - this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var totalPadding = this.canvas.height * Constants.MAIN_SCREEN_SQUARE_HEIGHT_RATIO
      - totalExpectedHeight;
    var startY = this.canvas.height * Constants.MAIN_SCREEN_SQUARE_HEIGHT_RATIO - totalPadding / 2
      - textHeight / 2;

    // Variables related to the highlighting rectangle.
    var rectangleWidth = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO * 0.8;
    var rectangleTotalSidePadding = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO
      - rectangleWidth;
    var rectangleX = this.canvas.width - this.canvas.width * Constants.BACKGROUND_SIDE_RATIO
      + rectangleTotalSidePadding / 2;

    for (var i = 0; i < MONEY_STRINGS.length; i++) {
      var y = startY - i * (textHeight + verticalPadding);
      var textFillStyle = (i + 1) % 5 === 0 ? Colors.DEFAULT_TEXT_COLOR : Colors.BUBBLE_TEXT_ORANGE;

      // Background rectangle for current question
      if (i === this.hotSeatQuestionIndex) {
        this.context.fillStyle = Colors.BUBBLE_TEXT_ORANGE;
        textFillStyle = Colors.BUBBLE_TEXT_DARK;
        this.context.fillRect(rectangleX, y - (textHeight + verticalPadding) / 2,
          rectangleWidth, textHeight + verticalPadding);
      }

      // Question number
      new TextElementBuilder(this.canvas)
        .setPosition(startX, y)
        .setText((i + 1) + '  ')
        .setTextAlign('right')
        .setFont(moneyTreeFont)
        .setFillStyle(textFillStyle)
        .build()
        .draw();

      // Question dollar amount
      new TextElementBuilder(this.canvas)
        .setPosition(startX, y)
        .setText('  ' + MONEY_STRINGS[i])
        .setTextAlign('left')
        .setFont(moneyTreeFont)
        .setFillStyle(textFillStyle)
        .build()
        .draw();
    }

    this.context.fillStyle = oldFillStyle;
  }
}

module.exports = MoneyTreeElement;