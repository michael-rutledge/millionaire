const HotSeatQuestionGrader = require(process.cwd() + '/server/question/HotSeatQuestionGrader.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
const Question = require(process.cwd() + '/server/question/Question.js');

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

// Automatic wait times for correct question celebrations.
//
// Different lengths exist because of different audio cues.
const CORRECT_WAIT_TIMES = [
  1000,
  1000,
  1000,
  1000,
  8000,
  5000,
  5000,
  5000,
  5000,
  8000,
  7000,
  7000,
  7000,
  7000,
  24000,
];

// Automatic wait times for question introduction. Variance is due to presence of flourish.
const QUESTION_TEXT_WAIT_TIMES = [
  7000,
  1000,
  1000,
  1000,
  1000,
  7000,
  7000,
  7000,
  7000,
  7000,
  7000,
  7000,
  7000,
  7000,
  7000,
];

// Returns the safe haven (i.e fallback) index for a given failed index.
function getSafeHavenIndex(failedIndex) {
  var oneIndexed = Math.max(0, failedIndex) + 1;
  return oneIndexed - (oneIndexed % 5) - 1;
}


// Stores and grades a hot seat question.
class HotSeatQuestion extends Question {

  constructor(hsqJson, questionIndex = 0, playerMap = new PlayerMap()) {
    super(hsqJson);

    this.correctChoiceRevealedForShowHost = false;

    this.correctChoiceRevealedForAll = false;

    this.questionIndex = questionIndex;

    this.playerMap = playerMap;

    this.grader =
      new HotSeatQuestionGrader(this.playerMap)
        .setCorrectChoice(this.getCorrectChoice())
        .setQuestionIndex(this.questionIndex);
  }


  // PUBLIC METHODS

  // Returns whether the given answer is correct.
  answerIsCorrect(answer) {
    return this.shuffledChoices[answer] == this.orderedChoices[0];
  }

  // Returns the choice corresponding to the correct answer.
  //
  // Returns undefined if a correct choice couldn't be found.
  getCorrectChoice() {
    return this.getShuffledChoice(0);
  }

  // Returns the remaining ordered indexes of revealed choices left.
  getRemainingOrderedChoiceIndexes() {
    var remaining = [];

    this.orderedChoices.forEach((orderedChoice, index) => {
      if (this.revealedChoices[this.getShuffledChoice(index)] !== undefined) {
        remaining.push(index);
      }
    });

    return remaining;
  }

  // Returns the shuffled index of the given ordered index.
  getShuffledChoice(orderedIndex) {
    for (var i = 0; i < this.shuffledChoices.length; i++) {
      if (this.shuffledChoices[i] == this.orderedChoices[orderedIndex]) {
        return i;
      }
    }

    return undefined;
  }

  // Sets the start time of this question to now.
  //
  // Overriden from parent in Question.js.
  markStartTime() {
    super.markStartTime();
    this.grader.setStartTime(this.startTime);
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
      compressed.correctChoice = this.getCorrectChoice();
    }
    // This field will be used to make sure contestants' choices are locked in so no sabotage will
    // occur.
    compressed.choiceLocked = (madeChoice !== undefined);
    return compressed;
  }
}

module.exports = HotSeatQuestion;
HotSeatQuestion.PAYOUTS = HotSeatQuestionGrader.PAYOUTS;
HotSeatQuestion.FINAL_ANSWER_WAIT_TIMES = FINAL_ANSWER_WAIT_TIMES;
HotSeatQuestion.CORRECT_WAIT_TIMES = CORRECT_WAIT_TIMES;
HotSeatQuestion.QUESTION_TEXT_WAIT_TIMES = QUESTION_TEXT_WAIT_TIMES;
HotSeatQuestion.getSafeHavenIndex = getSafeHavenIndex;