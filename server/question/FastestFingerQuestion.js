const Question = require(process.cwd() + '/server/question/Question.js');

// Stores and grades a fastest finger question.
class FastestFingerQuestion extends Question {
  constructor(ffqJson) {
    super(ffqJson);
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