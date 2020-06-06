const TextElement = require('./TextElement.js');

// Builds a TextElement.
class TextElementBuilder {

  constructor(canvas) {
    this._textElement = new TextElement(canvas, /*x=*/0, /*y=*/0);
  }

  build() {
    return this._textElement;
  }

  setFillStyle(fillStyle) {
    this._textElement.fillStyle = fillStyle;
    return this;
  }

  setFont(font) {
    this._textElement.font = font;
    return this;
  }

  setMaxWidth(maxWidth) {
    this._textElement.maxWidth = maxWidth;
    return this;
  }

  setMaxHeight(maxHeight) {
    this._textElement.maxHeight = maxHeight;
    return this;
  }

  setPosition(x, y) {
    this._textElement.x = x;
    this._textElement.y = y;
    return this;
  }

  setText(text) {
    this._textElement.text = text;
    return this;
  }

  setTextAlign(textAlign) {
    this._textElement.textAlign = textAlign;
    return this;
  }

  setVerticalPadding(verticalPadding) {
    this._textElement.verticalPadding = verticalPadding;
    return this;
  }
}

module.exports = TextElementBuilder;