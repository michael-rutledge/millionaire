const MillionaireBubble = require('./MillionaireBubble.js');

// Builds a MillionaireBubble.
class MillionaireBubbleBuilder {
  constructor(canvas) {
    this._millionaireBubble = new MillionaireBubble(canvas, /*x=*/0, /*y=*/0);
  }

  build() {
    return this._millionaireBubble;
  }

  setDimensions(width, height) {
    this._millionaireBubble.width = width;
    this._millionaireBubble.height = height;
    return this;
  }

  setPosition(x, y) {
    this._millionaireBubble.x = x;
    this._millionaireBubble.y = y;
    return this;
  }

  setState(state) {
    this._millionaireBubble.state = state;
    return this;
  }

  setText(text) {
    this._millionaireBubble.text = text;
    return this;
  }

  setTextAlign(textAlign) {
    this._millionaireBubble.textAlign = textAlign;
    return this;
  }
}

module.exports = MillionaireBubbleBuilder;