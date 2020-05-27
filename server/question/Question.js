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

  // Reveals all choices at once.
  revealAllChoices() {
    this.revealedChoices = this.shuffledChoices;
  }

  // Reveals the next available choice if possible.
  revealChoice() {
    if (this.revealedChoices.length < this.shuffledChoices.length) {
      this.revealedChoices.push(this.shuffledChoices[this.revealedChoices.length]);
    }
  }
}

module.exports = Question;