const MillionaireBubble = require('./MillionaireBubble.js');

// Builds a MillionaireBubble.
class MillionaireBubbleBuilder {
  constructor(canvas) {
    this._millionaireBubble = new MillionaireBubble(canvas, /*x=*/0, /*y=*/0);
  }

  build() {
    this._millionaireBubble._compose();
    return this._millionaireBubble;
  }

  setChoice(choice) {
    this._millionaireBubble.choice = choice;
    return this;
  }

  setDimensions(width, height) {
    this._millionaireBubble.width = width;
    this._millionaireBubble.height = height;
    return this;
  }

  setFont(font) {
    this._millionaireBubble.font = font;
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

  setStrokeStyle(strokeStyle) {
    this._millionaireBubble.strokeStyle = strokeStyle;
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