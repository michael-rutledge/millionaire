const CanvasElement = require('./CanvasElement.js');
const Choices = require('../../../../server/question/Choices.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const LocalizedStrings = require('../../../../localization/LocalizedStrings.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class AskTheAudienceResultsPanel extends CanvasElement {
  
  // It is highly recommended to use the Builder class to construct this object.
  constructor(canvas, x, y, width, height, answerBuckets, gradientColors) {
    super(canvas, x, y);
    this.width = width;
    this.height = height;

    // Tallies of each choice, grouped by choice index.
    this.answerBuckets = answerBuckets;

    // Total answers, with a minimum of 1 to prevent NaN calculations.
    this.totalAnswers = 0;
    this.answerBuckets.forEach((numVotes) => {
      this.totalAnswers += numVotes;
    });
    this.totalAnswers = Math.max(this.totalAnswers, 1);

    // Line grid that lies on the panel but behind the result bars.
    //
    // x and y values anchored at top left.
    this.panelGridHeight = this.height * 0.7;
    this.panelGridWidth = this.width * 0.95;
    this.panelGridX = this.x + (this.width - this.panelGridWidth) / 2;
    this.panelGridY = this.y + (this.height - this.panelGridHeight) / 2;
    this.panelGrid = this._getPanelGrid(this.panelGridX, this.panelGridY, this.panelGridWidth,
      this.panelGridHeight);

    // Colors to use as the gradient for the result bars, evenly spaced, bottom to top.
    this.barGradient = this._getBarGradient(this.panelGridY, this.panelGridHeight, gradientColors);
  
    this.choiceLetterTextElements = this._getChoiceLetterTextElements();
    this.percentTextElements = this._getPercentTextElements();
  }


  // PRIVATE METHODS

  // Returns a suitable gradient for the 
  _getBarGradient(y, height, gradientColors) {
    // Gradient is going from bottom to top.
    var barGradient = this.context.createLinearGradient(0, y + height, 0, y);
    var percentOffsetPerColor = 1 / Math.max(gradientColors.length - 1, 1);

    gradientColors.forEach((color, index) => {
      barGradient.addColorStop(index * percentOffsetPerColor, color);
    });

    return barGradient;
  }

  // Returns an array of text elements for the choice letters under the bar graph.
  _getChoiceLetterTextElements() {
    var choiceLetters = ['A', 'B', 'C', 'D'];
    var choiceLetterTextElements = [];
    var barWidth = this.panelGridWidth / choiceLetters.length;
    var startX = this.panelGridX + barWidth / 2;
    var y = this.y + this.height - (this.height - this.panelGridHeight) / 4;

    choiceLetters.forEach((letter, index) => {
      var x = startX + index * barWidth;
      choiceLetterTextElements.push(
        new TextElementBuilder(this.canvas)
          .setPosition(x, y)
          .setText(letter)
          .setFont(Fonts.CHOICE_LETTER_FONT)
          .setFillStyle(Colors.BUBBLE_TEXT_ORANGE)
          .setTextAlign('center')
          .build());
    });

    return choiceLetterTextElements;
  }

  // Returns a grid 
  _getPanelGrid(x, y, width, height) {
    var panelGrid = new Path2D();
    var boxesWide = 8;
    var boxWidth = width / boxesWide;
    var boxesTall = 10;
    var boxHeight = height / boxesTall;

    // Outline
    panelGrid.moveTo(x, y);
    panelGrid.lineTo(x + width, y);
    panelGrid.lineTo(x + width, y + height);
    panelGrid.lineTo(x, y + height);
    panelGrid.lineTo(x, y);

    // Vertical lines
    for (var i = 1; i < boxesWide; i++) {
      var verticalLineX = x + boxWidth * i;
      panelGrid.moveTo(verticalLineX, y);
      panelGrid.lineTo(verticalLineX, y + height)
    }

    // Horizontal lines
    for (var i = 1; i < boxesTall; i++) {
      var horizontalLineY = y + boxHeight * i;
      panelGrid.moveTo(x, horizontalLineY);
      panelGrid.lineTo(x + width, horizontalLineY);
    }

    return panelGrid;
  }

  _getPercentText(percent) {
    return Math.floor(percent * 100) + '%';
  }

  _getPercentTextElements() {
    var percentTextElements = [];
    var barWidth = this.panelGridWidth / this.answerBuckets.length;
    var startX = this.panelGridX + barWidth / 2;
    var y = this.y + (this.height - this.panelGridHeight) / 4;

    this.answerBuckets.forEach((numVotes, index) => {
      var x = startX + index * barWidth;
      percentTextElements.push(
        new TextElementBuilder(this.canvas)
          .setPosition(x, y)
          .setText(this._getPercentText(numVotes / this.totalAnswers))
          .setFont(Fonts.ASK_THE_AUDIENCE_PERCENT_FONT)
          .setTextAlign('center')
          .build());
    });

    return percentTextElements;
  }


  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    var oldFillStyle = this.context.fillStyle;
    var oldStrokeStyle = this.context.strokeStyle;
    var oldLineWidth = this.context.lineWidth;

    this.context.fillStyle = Colors.BLACK;
    this.context.strokeStyle = Colors.ASK_THE_AUDIENCE_GRID;
    this.context.lineWidth = 1;

    // Background panel and grid
    this.context.fillRect(this.x, this.y, this.width, this.height);
    this.context.strokeRect(this.x, this.y, this.width, this.height);
    this.context.stroke(this.panelGrid);

    // Bars
    var barWellWidth = this.panelGridWidth / this.answerBuckets.length;
    var barWidth = barWellWidth * 0.7;
    var barStartX = this.panelGridX  + barWellWidth / 2 - barWidth / 2;
    this.context.fillStyle = this.barGradient;
    this.answerBuckets.forEach((numVotes, index) => {
      var barX = barStartX + index * barWellWidth;
      var barY = this.panelGridY + this.panelGridHeight -
        (numVotes / this.totalAnswers) * this.panelGridHeight;
      this.context.fillRect(barX, barY, barWidth, this.panelGridY + this.panelGridHeight - barY);
    });

    // Choice letters and percentages
    this.choiceLetterTextElements.forEach((textElement) => {
      textElement.draw();
    });
    this.percentTextElements.forEach((textElement) => {
      textElement.draw();
    });

    this.context.lineWidth = oldLineWidth;
    this.context.fillStyle = oldFillStyle;
    this.context.strokeStyle = oldStrokeStyle;
  }
}

module.exports = AskTheAudienceResultsPanel;