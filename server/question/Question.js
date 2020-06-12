// Automatic wait times for final answer confirmations per question index.
//
// Later questions have longer times to build more suspense.
const FINAL_ANSWER_WAIT_TIMES = [
  1000,
  1000,
  1000,
  1000,
  1500,
  3000,
  3000,
  3000,
  3000,
  4000,
  5000,
  5000,
  5000,
  5000,
  7500
];

// Super class that lays groundwork for other questions.
class Question {
  constructor(questionJson) {
    // Text of the question
    this.text = questionJson.text;

    // Ordered choices; meaning in order for questions looking for order, and first being correct
    // for questions looking for one answer
    this.orderedChoices = questionJson.orderedChoices;

    // Choices shuffled
    this.shuffledChoices = this._getShuffledChoices();

    // Choices that all players can see as they get revealed
    this.revealedChoices = [];

    // Time that the question was opened for answering. Used in calculation of fastest finger winner
    // and contestant winnings on hot seat questions.
    this.startTime = undefined;
  }


  // PRIVATE METHODS

  // Returns a shuffled copy of orderedChoices.
  _getShuffledChoices() {
    var shuffledChoices = this.orderedChoices.slice();
    for (var i = shuffledChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
    }
    return shuffledChoices;
  }


  // PUBLIC METHODS

  // Returns whether all choices for this Question have been revealed.
  allChoicesRevealed() {
    return this.revealedChoices.length >= this.shuffledChoices.length;
  }

  // Sets the start time of this question to now.
  //
  // Can only set the time once. Any subsequent calls will not change the startTime.
  markStartTime() {
    if (this.startTime === undefined) {
      this.startTime = Date.now();
    }
  }

  // Reveals all choices at once.
  revealAllChoices() {
    this.revealedChoices = this.shuffledChoices;
  }

  // Reveals the next available choice if possible.
  revealChoice() {
    if (!this.allChoicesRevealed()) {
      this.revealedChoices.push(this.shuffledChoices[this.revealedChoices.length]);
    }
  }

  // Returns a compressed version of the question that can be passed through a socket.
  toCompressed(madeChoices) {
    return {
      text: this.text,
      revealedChoices: this.revealedChoices,
      madeChoices: madeChoices
    };
  }
}

module.exports = Question;
Question.FINAL_ANSWER_WAIT_TIMES = FINAL_ANSWER_WAIT_TIMES;