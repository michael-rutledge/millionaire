const Question = require(process.cwd() + '/server/question/Question.js');

// Stores and grades a hot seat question.
class HotSeatQuestion extends Question {

  constructor(hsqJson) {
    super(hsqJson);

    this.correctChoiceRevealedForShowHost = false;

    this.correctChoiceRevealedForAll = false;
  }


  // PRIVATE METHODS

  // Returns the choice corresponding to the correct answer.
  //
  // Returns undefined if a correct choice couldn't be found.
  _getCorrectChoice() {
    for (var i = 0; i < this.shuffledChoices.length; i++) {
      if (this.answerIsCorrect(i)) {
        return i;
      }
    }

    return undefined;
  }


  // PUBLIC METHODS

  // Returns whether the given answer is correct.
  answerIsCorrect(answer) {
    return this.shuffledChoices[answer] == this.orderedChoices[0];
  }

  // Reveals the correct choice for the show host.
  revealCorrectChoiceForShowHost() {
    this.correctChoiceRevealedForShowHost = true;
  }

  // Reveals the correct choice for all.
  revealCorrectChoiceForAll() {
    this.correctChoiceRevealedForAll = true;
  }

  // Returns a compressed version of the hot seat question that can be passed through a socket.
  toCompressed(madeChoice, showCorrectChoice) {
    var compressed = super.toCompressed([madeChoice]);
    if (showCorrectChoice) {
      // We choose to compute instead of storing on construction to make testing easier.
      compressed.correctChoice = this._getCorrectChoice();
    }
    return compressed;
  }
}

module.exports = HotSeatQuestion;