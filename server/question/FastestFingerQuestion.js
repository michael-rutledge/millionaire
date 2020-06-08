const Question = require(process.cwd() + '/server/question/Question.js');

// Stores and grades a fastest finger question.
class FastestFingerQuestion extends Question {
  constructor(ffqJson) {
    super(ffqJson);

    // Answers revealed to contestants after the question is over.
    //
    // Expected answer format: {
    //   string text,
    //   Choice choice
    // }
    this.revealedAnswers = [];
  }

  // PRIVATE METHODS

  // Returns the shuffled choice index associated with the given ordered choice index.
  _getShuffledChoiceIndex(orderedChoiceIndex) {
    for (var i = 0; i < this.shuffledChoices.length; i++) {
      if (this.orderedChoices[orderedChoiceIndex] === this.shuffledChoices[i]) {
        return i;
      }
    }

    return -1;
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

  // Reveals a correct answer to be displayed back to contestants.
  revealAnswer() {
    if (!this.revealedAllAnswers()) {
      var choice = this.revealedAnswers.length;
      this.revealedAnswers.push({
        text: this.orderedChoices[choice],
        choice: this._getShuffledChoiceIndex(choice)
      });
    }
  }

  // Returns whether all answers have been revealed.
  revealedAllAnswers() {
    return this.revealedAnswers.length >= this.orderedChoices.length;
  }
}

module.exports = FastestFingerQuestion;