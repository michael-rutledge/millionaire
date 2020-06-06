const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const MillionaireBubble = require('./MillionaireBubble.js');
const MillionaireBubbleBuilder = require('./MillionaireBubbleBuilder.js');

class PlayerListElement extends CanvasElement {

  constructor(canvas, compressedPlayerList = []) {
    // x and y will be ignored upon draw
    super(canvas, /*x=*/0, /*y=*/0);
    this.compressedPlayerList = compressedPlayerList;
    this.playerBubbles = [];
  }

  draw() {
    this.context.fillStyle = Colors.BUBBLE_FILL_DEFAULT;

    var sidePanelWidth = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    var sidePanelHeight = this.canvas.height -
      this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;
    var bubbleRatio = 0.8;
    var bubbleWidth =  sidePanelWidth * bubbleRatio;
    var bubbleHeight = sidePanelHeight / 11;
    var verticalPadding = bubbleHeight * 0.2;
    var startX = sidePanelWidth * (1 - bubbleRatio) / 2;
    var startY = bubbleHeight / 2 + verticalPadding;

    // TODO: update these bubbles to have more than just username.
    for (var i = 0; i < this.compressedPlayerList.length; i++) {
      var compressedPlayer = this.compressedPlayerList[i];
      var y = startY + i * (bubbleHeight + verticalPadding);
      var playerBubble =
        new MillionaireBubbleBuilder(this.canvas)
          .setPosition(startX, y)
          .setDimensions(bubbleWidth, bubbleHeight)
          .setText(compressedPlayer.username)
          .setState(MillionaireBubble.State.DEFAULT)
          .setTextAlign('left')
          .build();
      playerBubble.draw();
      this.playerBubbles.push(playerBubble);
    }
  }
}

module.exports = PlayerListElement;