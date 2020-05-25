// Stores and grades a fastest finger question.
class FastestFingerQuestion {
  constructor(ffqJson) {
    this.text = ffqJson.text;
    this.orderedChoices = ffqJson.orderedChoices;
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

  // Grades the given score by returning how many answers matched the ordered choices of this
  // question.
  getAnswerScore(answer) {
    var score = 0;

    for (let i = 0; i < answer.length; i++) {
      if (this.shuffledChoices[answer[i]] == this.orderedChoices[i]) {
        score++;
      }
    }

    return score;
  }
}

module.exports = FastestFingerQuestion;