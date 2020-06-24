const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const PlayerElement = require('./PlayerElement.js');

class PlayerListElement extends CanvasElement {

  constructor(canvas, compressedPlayerList = [], socket = undefined) {
    super(canvas);
    this.compressedPlayerList = compressedPlayerList;
    this.playerElements = [];
    this.socket = socket;
    this.onClick = (x, y) => { this._onClick(x, y) };

    this._compose();
  }


  // PRIVATE METHODS

  // Sets up this element for repeated calls to draw().
  _compose() {
    var sidePanelWidth = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    var sidePanelHeight = this.canvas.height -
      this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var bubbleRatio = 0.8;
    var bubbleWidth =  sidePanelWidth * bubbleRatio;
    var bubbleHeight = sidePanelHeight / 11;
    var verticalPadding = bubbleHeight * 0.2;
    var startX = sidePanelWidth * (1 - bubbleRatio) / 2;
    var startY = bubbleHeight / 2 + verticalPadding;

    for (var i = 0; i < this.compressedPlayerList.length; i++) {
      var compressedPlayer = this.compressedPlayerList[i];
      var y = startY + i * (bubbleHeight + verticalPadding);
      var playerElement =
        new PlayerElement(this.canvas, startX, y, bubbleWidth, bubbleHeight, compressedPlayer,
          this.socket);
      this.playerElements.push(playerElement);
    }
  }

  _onClick(x, y) {
    for (var i = 0; i < this.playerElements.length; i++) {
      if (this.playerElements[i].isClickable()) {
        this.playerElements[i].onClick(x, y);
      }
    }
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    this.playerElements.forEach((playerElement, index) => {
      playerElement.draw();
    });
  }

  isMouseHovering(x, y) {
    for (var i = 0; i < this.playerElements.length; i++) {
      if (this.playerElements[i].isMouseHovering(x, y)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = PlayerListElement;