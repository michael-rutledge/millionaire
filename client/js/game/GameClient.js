const BackgroundElement = require('../rendering/element/BackgroundElement.js');
const QuestionAndChoicesElement = require('../rendering/element/QuestionAndChoicesElement.js');

// Handles top level socket interactions between the game window of the client and the server.
class GameClient {

  constructor(socket, gameRenderer) {
    // Assign fields
    this.socket = socket;
    this.gameRenderer = gameRenderer;
    this.clientState = undefined;
    this.audioPlayer = undefined;

    // Assign socket listeners
    this.socket.on('updateGame', (data) => { this.updateGame(data); });
  }


  // PUBLIC METHODS

  // Returns the list of new CanvasElements to render to the canvas from the given compressed client
  // state.
  getNewCanvasElements(compressedClientState) {
    var canvas = this.gameRenderer.canvas;
    var newCanvasElements = [new BackgroundElement(canvas)];
    var questionAndChoicesElement = new QuestionAndChoicesElement(canvas, this.socket);
    newCanvasElements.push(questionAndChoicesElement);

    if (compressedClientState.question !== undefined) {
      questionAndChoicesElement.setQuestion(compressedClientState.question);
      questionAndChoicesElement.choiceAction = compressedClientState.choiceAction;
    }

    return newCanvasElements;
  }


  // SOCKET LISTENERS

  // Updates the game state in the eyes of the client by setting a new list of CanvasElements to be
  // rendered on the canvas.
  updateGame(compressedClientState) {
    console.log('updateGame');
    console.log(compressedClientState);
    var newCanvasElements = this.getNewCanvasElements(compressedClientState);
    this.gameRenderer.updateCanvasElements(newCanvasElements);
  }
}

module.exports = GameClient;