const Question = require(process.cwd() + '/server/question/Question.js');

// Stores and grades a hot seat question.
class HotSeatQuestion extends Question {

  constructor(hsqJson) {
    super(hsqJson);
  }


  // PUBLIC METHODS

  // Returns whether the given answer is correct.
  answerIsCorrect(answer) {
    return this.shuffledChoices[answer] == this.orderedChoices[0];
  }
}

module.exports = HotSeatQuestion;