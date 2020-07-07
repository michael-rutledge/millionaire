const AskTheAudienceResultsElement = require('../rendering/element/AskTheAudienceResultsElement.js');
const AudioPlayer = require('../audio/AudioPlayer.js');
const BackgroundElement = require('../rendering/element/BackgroundElement.js');
const CelebrationBanner = require('../rendering/element/CelebrationBanner.js');
const FastestFingerAnswersElement = require('../rendering/element/FastestFingerAnswersElement.js');
const FastestFingerResultsElement = require('../rendering/element/FastestFingerResultsElement.js');
const InfoTextElement = require('../rendering/element/InfoTextElement.js');
const LifelinesElement = require('../rendering/element/LifelinesElement.js');
const MoneyTreeElement = require('../rendering/element/MoneyTreeElement.js');
const PhoneAFriendResultsElement = require('../rendering/element/PhoneAFriendResultsElement.js');
const PhoneConfidenceMeter = require('../rendering/element/PhoneConfidenceMeter.js');
const PlayerListElement = require('../rendering/element/PlayerListElement.js');
const QuestionAndChoicesElement = require('../rendering/element/QuestionAndChoicesElement.js');
const StepDialogElement = require('../rendering/element/StepDialogElement.js');

// Handles top level socket interactions between the game window of the client and the server.
class GameClient {

  constructor(socket, gameRenderer) {
    // Assign fields
    this.socket = socket;
    this.gameRenderer = gameRenderer;
    this.audioPlayer = new AudioPlayer();

    // Assign socket listeners
    this.socket.on('updateGame', (data) => { this.updateGame(data); });
  }


  // PUBLIC METHODS

  // Returns the list of new CanvasElements to render to the canvas from the given compressed client
  // state.
  getNewCanvasElements(compressedClientState) {
    var canvas = this.gameRenderer.canvas;
    var newCanvasElements = [new BackgroundElement(canvas)];
    var playerListElement = new PlayerListElement(canvas, compressedClientState.playerList,
      this.socket);
    var questionAndChoicesElement = new QuestionAndChoicesElement(canvas, this.socket);

    newCanvasElements.push(playerListElement);
    newCanvasElements.push(new MoneyTreeElement(canvas,
      compressedClientState.hotSeatQuestionIndex));

    if (compressedClientState.celebrationBanner === undefined) {
      newCanvasElements.push(questionAndChoicesElement);
    } else {
      newCanvasElements.push(new CelebrationBanner(canvas,
        compressedClientState.celebrationBanner));
    }

    if (compressedClientState.infoText !== undefined) {
      newCanvasElements.push(new InfoTextElement(canvas, compressedClientState.infoText));
    }

    if (compressedClientState.showHostStepDialog !== undefined) {
      newCanvasElements.push(new StepDialogElement(canvas, this.socket,
        compressedClientState.showHostStepDialog));
    }

    if (compressedClientState.hotSeatStepDialog !== undefined) {
      newCanvasElements.push(new StepDialogElement(canvas, this.socket,
        compressedClientState.hotSeatStepDialog));
    }

    if (compressedClientState.question !== undefined) {
      questionAndChoicesElement.setQuestion(compressedClientState.question);
      questionAndChoicesElement.choiceAction = compressedClientState.choiceAction;
    }

    if (compressedClientState.fastestFingerRevealedAnswers !== undefined) {
      newCanvasElements.push(new FastestFingerAnswersElement(canvas,
        compressedClientState.fastestFingerRevealedAnswers));
    }

    if (compressedClientState.fastestFingerResults !== undefined) {
      newCanvasElements.push(new FastestFingerResultsElement(canvas,
        compressedClientState.fastestFingerResults, compressedClientState.fastestFingerBestScore));
    }

    newCanvasElements.push(new LifelinesElement(
      canvas,
      this.socket,
      compressedClientState.fiftyFiftyActionButton,
      compressedClientState.phoneAFriendActionButton,
      compressedClientState.askTheAudienceActionButton,
      compressedClientState.walkAwayActionButton));

    if (compressedClientState.showPhoneConfidenceMeter) {
      newCanvasElements.push(new PhoneConfidenceMeter(canvas, this.socket));
    }

    if (compressedClientState.phoneAFriendResults) {
      newCanvasElements.push(new PhoneAFriendResultsElement(canvas,
        compressedClientState.phoneAFriendResults));
    }

    if (compressedClientState.askTheAudienceResults) {
      newCanvasElements.push(new AskTheAudienceResultsElement(canvas,
        compressedClientState.askTheAudienceResults));
    }

    return newCanvasElements;
  }


  // SOCKET LISTENERS

  // Updates the game state in the eyes of the client by setting a new list of CanvasElements to be
  // rendered on the canvas.
  updateGame(compressedClientState) {
    console.log('updateGame');
    console.log(compressedClientState);
    this.audioPlayer.executeAudioCommand(compressedClientState.audioCommand);
    var newCanvasElements = this.getNewCanvasElements(compressedClientState);
    this.gameRenderer.updateCanvasElements(newCanvasElements);
  }
}

module.exports = GameClient;
