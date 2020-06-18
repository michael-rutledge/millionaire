const Question = require(process.cwd() + '/server/question/Question.js');

// Payouts per question.
const PAYOUTS = [
  100,
  200,
  300,
  500,
  1000,
  2000,
  4000,
  8000,
  16000,
  32000,
  64000,
  125000,
  250000,
  500000,
  1000000
];

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

// Returns the safe haven (i.e fallback) index for a given failed index.
function getSafeHavenIndex(failedIndex) {
  var oneIndexed = Math.max(0, failedIndex) + 1;
  return oneIndexed - (oneIndexed % 5) - 1;
}


// Stores and grades a hot seat question.
class HotSeatQuestion extends Question {

  constructor(hsqJson) {
    super(hsqJson);

    this.correctChoiceRevealedForShowHost = false;

    this.correctChoiceRevealedForAll = false;
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
    for (var i = 0; i < this.shuffledChoices.length; i++) {
      if (this.answerIsCorrect(i)) {
        return i;
      }
    }

    return undefined;
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
HotSeatQuestion.PAYOUTS = PAYOUTS;
HotSeatQuestion.FINAL_ANSWER_WAIT_TIMES = FINAL_ANSWER_WAIT_TIMES;
HotSeatQuestion.CORRECT_WAIT_TIMES = CORRECT_WAIT_TIMES;
HotSeatQuestion.getSafeHavenIndex = getSafeHavenIndex;