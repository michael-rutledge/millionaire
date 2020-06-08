const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Fonts = require('../Fonts.js');

// Returns the predicted height of the given text in the given context.
function getPredictedTextHeight(context, text, font = undefined) {
  var oldFont = context.font;
  if (font !== undefined) {
    context.font = font;
  }

  var metrics = context.measureText(text);

  context.font = oldFont;
  return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
}

// Returns the predicted width of the given text in the given context.
function getPredictedTextWidth(context, text, font = undefined) {
  var oldFont = context.font;
  if (font !== undefined) {
    context.font = font;
  }

  var predictedWidth = context.measureText(text).width;

  context.font = oldFont;
  return predictedWidth;
}

class TextElement extends CanvasElement {

  // Some fields are left default here. It is strongly recommended to use TextElementBuilder to
  // construct a TextElement.
  constructor(canvas, x, y, text = '') {
    super(canvas, x, y);
    this.text = text;

    // Default style attributes
    this.fillStyle = Colors.DEFAULT_TEXT_COLOR;
    this.font = Fonts.DEFAULT_FONT;
    this.textAlign = 'left';
    this.maxWidth = canvas.width;
    this.maxHeight = canvas.height;
    this.verticalPadding = 0;
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

  // Returns the y offset from which the text should start so that it can sit in the center of the
  // element vertically.
  _getYOffset(numLines, lineHeight) {
    var totalHeight = lineHeight * numLines;
    var pixelPadding = 3;
    return -(totalHeight / 2) + lineHeight - pixelPadding;
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var oldFillStyle = this.context.fillStyle;
    var oldFont = this.context.font;
    var oldTextAlign = this.context.textAlign;

    this.context.fillStyle = this.fillStyle;
    this.context.font = this.font;
    this.context.textAlign = this.textAlign;

    var lineHeight = getPredictedTextHeight(this.context, this.text) + this.verticalPadding;
    var maxLines = Math.floor(this.maxHeight / lineHeight);
    var wrappedLines = this._getWrappedLines(this.text, this.maxWidth, this.maxHeight);
    var numLines = Math.min(maxLines, wrappedLines.length);
    var yOffset = this._getYOffset(numLines, lineHeight);

    for (var i = 0; i < numLines; i++) {
      this.context.fillText(wrappedLines[i], this.x, this.y + i * lineHeight + yOffset);
    }

    // Pop old style values pack into place
    this.context.fillStyle = oldFillStyle;
    this.context.font = oldFont;
    this.context.textAlign = oldTextAlign;
  }
}

module.exports = TextElement;
TextElement.getPredictedTextHeight = getPredictedTextHeight;
TextElement.getPredictedTextWidth = getPredictedTextWidth;