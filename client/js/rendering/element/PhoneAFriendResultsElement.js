const CanvasElement = require('./CanvasElement.js');
const Choices = require('../../../../server/question/Choices.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const LocalizedStrings = require('../../../../localization/LocalizedStrings.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class PhoneAFriendResultsElement extends CanvasElement {
  
  constructor(canvas, results) {
    super(canvas);
    this.results = results;

    this.resultsText = undefined;

    this._compose();
  }

  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    var midX = this.canvas.width / 2;
    var y = this.canvas.height * Constants.MAIN_SCREEN_SQUARE_HEIGHT_RATIO * 0.65;
    var resultsString = LocalizedStrings.PHONE_A_FRIEND_CHOICE_PREFIX +
        Choices.getString(this.results.choice) +
        LocalizedStrings.PHONE_A_FRIEND_CONFIDENCE_MIDFIX + this._getPercentageString(
          this.results.confidence) + '.';

    this.resultsText =
      new TextElementBuilder(this.canvas)
        .setPosition(midX, y)
        .setText(resultsString)
        .setTextAlign('center')
        .build();
  }

  // Returns the string representation of the given percentage.
  _getPercentageString(percentage) {
    return Math.floor(percentage * 100) + '%';
  }


  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    this.resultsText.draw();
  }
}

module.exports = PhoneAFriendResultsElement;