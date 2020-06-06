const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');

class TextElement extends CanvasElement {

  // Expected style format:
  // {
  //   obj fillStyle
  //   obj font
  //   string textAlign
  //   int maxWidth
  //   int maxHeight
  //   int verticalPadding
  // }
  constructor(canvas, x, y, text = '', style = {}) {
    // TODO: deprecate style object and use Builder for all constructions.
    super(canvas, x, y);
    this.text = text;
    this.style = style;

    // Default style attributes
    this.style.fillStyle = style.fillStyle === undefined ?
      Colors.DEFAULT_TEXT_COLOR : style.fillStyle;
    this.style.font = style.font === undefined ? '30px Arial' : style.font;
    this.style.textAlign = style.textAlign === undefined ? 'left' : style.textAlign;
    this.style.maxWidth = style.maxWidth === undefined ? canvas.width : style.maxWidth;
    this.style.maxHeight = style.maxHeight === undefined ? canvas.height : style.maxHeight;
    this.style.verticalPadding = style.verticalPadding === undefined ? 0 : style.verticalPadding;
  }


  // PRIVATE METHODS
  
  // Returns an array of lines of the element's text conforming to the given rules of max width and
  // height.
  _getWrappedLines(text, maxWidth, maxHeight) {
    var words = text.split(' ');
    var wrappedLines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = this.context.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth || maxWidth <= 0) {
        currentLine += ' ' + word;
      } else {
        wrappedLines.push(currentLine);
        currentLine = word;
      }
    }

    wrappedLines.push(currentLine);
    return wrappedLines;
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var oldFillStyle = this.context.fillStyle;
    var oldFont = this.context.font;
    var oldTextAlign = this.context.textAlign;

    this.context.fillStyle = this.style.fillStyle;
    this.context.font = this.style.font;
    this.context.textAlign = this.style.textAlign;

    var lineHeight = 30 + this.style.verticalPadding;
    var maxLines = Math.floor(this.style.maxHeight / lineHeight);
    var wrappedLines = this._getWrappedLines(this.text, this.style.maxWidth, this.style.maxHeight);
    var numLines = Math.min(maxLines, wrappedLines.length);
    var yOffset = numLines * lineHeight / 2;

    for (var i = 0; i < numLines; i++) {
      this.context.fillText(wrappedLines[i], this.x, this.y + i * lineHeight);
    }

    // Pop old style values pack into place
    this.context.fillStyle = oldFillStyle;
    this.context.font = oldFont;
    this.context.textAlign = oldTextAlign;
  }
}

module.exports = TextElement;