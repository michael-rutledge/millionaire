const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const PlayerElement = require('./PlayerElement.js');

class PlayerListElement extends CanvasElement {

  constructor(canvas, compressedPlayerList = []) {
    // x and y will be ignored upon draw
    super(canvas, /*x=*/0, /*y=*/0);
    this.compressedPlayerList = compressedPlayerList;
    this.playerElements = [];
  }


  // PUBLIC METHODS

  // Draws the element on the canvas.
  draw() {
    var sidePanelWidth = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    var sidePanelHeight = this.canvas.height -
      this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var bubbleRatio = 0.8;
    var bubbleWidth =  sidePanelWidth * bubbleRatio;
    var bubbleHeight = sidePanelHeight / 11;
    var verticalPadding = bubbleHeight * 0.2;
    var startX = sidePanelWidth * (1 - bubbleRatio) / 2;
    var startY = bubbleHeight / 2 + verticalPadding;

    var lineGradient = this.context.createLinearGradient(startX, 0, startX + bubbleWidth, 0);
    lineGradient.addColorStop(0, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    lineGradient.addColorStop(0.5, Colors.QUESTION_AND_CHOICES_LINE_SHINE);
    lineGradient.addColorStop(1, Colors.QUESTION_AND_CHOICES_LINE_BASE);
    this.context.strokeStyle = lineGradient;
    this.context.lineWidth = Constants.SIDE_PANEL_LINE_WIDTH;
    this.context.fillStyle = Colors.BUBBLE_FILL_DEFAULT;

    // TODO: update these bubbles to have more than just username.
    for (var i = 0; i < this.compressedPlayerList.length; i++) {
      var compressedPlayer = this.compressedPlayerList[i];
      var y = startY + i * (bubbleHeight + verticalPadding);
      var playerElement =
        new PlayerElement(this.canvas, startX, y, bubbleWidth, bubbleHeight, compressedPlayer);
      playerElement.draw();
      this.playerElements.push(playerElement);
    }
  }
}

module.exports = PlayerListElement;