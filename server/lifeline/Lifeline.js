// Parent class of all lifelines.
class Lifeline {

  constructor(socketEvent, playerMap) {
    // Player map of the game currently using the lifeline.
    this.playerMap = playerMap;

    // Whether this lifeline has been used.
    this.used = false;

    // Socket event tied to the HotSeatActionButton that will represent this Lifeline on the client.
    this.socketEvent = socketEvent;

    // Question that the lifeline is being used for. Undefined until lifeline used.
    this.question = undefined;
  }


  // PUBLIC METHODS

  // Starts use of the lifeline on the given question.
  startForQuestion(question) {
    this.question = question;
    this.used = true;
  }

  // Returns a JSON object to transmit via a socket capable of aiding in construction of a
  // HotSeatActionButton on the client.
  toCompressedHotSeatActionButton(available) {
    return {
      used: this.used,
      socketEvent: this.socketEvent,
      available: available
    }
  }
}

module.exports = Lifeline;