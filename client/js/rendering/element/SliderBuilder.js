const Slider = require('./Slider.js');

class SliderBuilder {
  constructor(canvas) {
    this._slider = new Slider(canvas);
  }


  // PUBLIC METHODS

  build() {
    this._slider._compose();
    return this._slider;
  }

  setBubbleDimensions(bubbleWidth, bubbleHeight) {
    this._slider.bubbleWidth = bubbleWidth;
    this._slider.bubbleHeight = bubbleHeight;
    return this;
  }

  setHeaderFont(headerFont) {
    this._slider.headerFont = headerFont;
    return this;
  }

  setHeaderText(headerText) {
    this._slider.headerText = headerText;
    return this;
  }

  setPosition(x, y) {
    this._slider.x = x;
    this._slider.y = y;
    return this;
  }

  setStrokeStyle(strokeStyle) {
    this._slider.strokeStyle = strokeStyle;
    return this;
  }

  setValue(value) {
    this._slider.value = value;
    return this;
  }
}

module.exports = SliderBuilder;