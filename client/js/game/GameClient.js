const BackgroundElement = require('../rendering/element/BackgroundElement.js');
const FastestFingerAnswersElement = require('../rendering/element/FastestFingerAnswersElement.js');
const PlayerListElement = require('../rendering/element/PlayerListElement.js');
const QuestionAndChoicesElement = require('../rendering/element/QuestionAndChoicesElement.js');
const StepDialogElement = require('../rendering/element/StepDialogElement.js');

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
    var playerListElement = new PlayerListElement(canvas, compressedClientState.playerList);
    newCanvasElements.push(playerListElement);
    var questionAndChoicesElement = new QuestionAndChoicesElement(canvas, this.socket);
    newCanvasElements.push(questionAndChoicesElement);

    if (compressedClientState.showHostStepDialog !== undefined) {
      newCanvasElements.push(new StepDialogElement(canvas, this.socket,
        compressedClientState.showHostStepDialog));
    }

    if (compressedClientState.question !== undefined) {
      questionAndChoicesElement.setQuestion(compressedClientState.question);
      questionAndChoicesElement.choiceAction = compressedClientState.choiceAction;
    }

    if (compressedClientState.fastestFingerRevealedAnswers !== undefined) {
      newCanvasElements.push(new FastestFingerAnswersElement(canvas,
        compressedClientState.fastestFingerRevealedAnswers));
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