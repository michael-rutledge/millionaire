// Stores and grades a hot seat question.
class HotSeatQuestion {

  constructor(hsqJson) {
    this.text = hsqJson.text;
    this.orderedChoices = hsqJson.orderedChoices;
    this.shuffledChoices = this._getShuffledChoices();
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

  // Returns whether the given answer is correct.
  answerIsCorrect(answer) {
    return this.shuffledChoices[answer] == this.orderedChoices[0];
  }
}

module.exports = HotSeatQuestion;