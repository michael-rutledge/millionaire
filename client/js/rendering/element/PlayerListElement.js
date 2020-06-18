const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const PlayerElement = require('./PlayerElement.js');

class PlayerListElement extends CanvasElement {

  constructor(canvas, compressedPlayerList = []) {
    super(canvas);
    this.compressedPlayerList = compressedPlayerList;
    this.playerElements = [];

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
        new PlayerElement(this.canvas, startX, y, bubbleWidth, bubbleHeight, compressedPlayer);
      this.playerElements.push(playerElement);
    }
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    this.playerElements.forEach((playerElement, index) => {
      playerElement.draw();
    });
  }
}

module.exports = PlayerListElement;