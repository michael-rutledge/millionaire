const AskTheAudienceResultsPanel = require('./AskTheAudienceResultsPanel.js');
const Colors = require('../Colors.js');

class AskTheAudienceResultsPanelBuilder {
  constructor(canvas) {
    this.params = {
      canvas: canvas
    };
  }


  // PRIVATE METHODS

  // Returns the given value or the given default value if it is undefined.
  _getValueOrDefault(value, defaultValue) {
    return value === undefined ? defaultValue : value;
  }

  build() {
    return new AskTheAudienceResultsPanel(
      this.params.canvas,
      this._getValueOrDefault(this.params.x, 0),
      this._getValueOrDefault(this.params.y, 0),
      this._getValueOrDefault(this.params.width, 0),
      this._getValueOrDefault(this.params.height, 0),
      this._getValueOrDefault(this.params.answerBuckets, [0, 0, 0, 0]),
      this._getValueOrDefault(this.params.gradientColors, [Colors.WHITE]));
  }

  setAnswerBuckets(answerBuckets) {
    this.params.answerBuckets = answerBuckets;
    return this;
  }

  setDimensions(width, height) {
    this.params.width = width;
    this.params.height = height;
    return this;
  }

  setGradientColors(gradientColors) {
    this.params.gradientColors = gradientColors;
    return this;
  }

  setPosition(x, y) {
    this.params.x = x;
    this.params.y = y;
    return this;
  }
}

module.exports = AskTheAudienceResultsPanelBuilder;