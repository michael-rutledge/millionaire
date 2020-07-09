const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
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
  }


  // PRIVATE METHODS

  // Returns the amount of money to give to a contestant for their answer to a hot seat question.
  _getScaledPayout(elapsedTime) {
    const payoutRatioCap = 0.5;
    const payoutRatioFloor = 0.2;
    const bestWindowMs = 1000;
    const timeWindowMs = 10000;

    var trimmedElapsedTime = Math.max(0, Math.min(elapsedTime - bestWindowMs, timeWindowMs));
    var timeRatio = 1 - (trimmedElapsedTime / timeWindowMs);
    var payoutRatio = payoutRatioFloor + timeRatio * (payoutRatioCap - payoutRatioFloor);
    return Math.floor(PAYOUTS[this.questionIndex] * payoutRatio);
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

  // Assigns cash winnings per contestant according to the current hot seat question.
  //
  // The money given will be inversely proportional to the amount of time it takes for an answer to
  // be put down. Whoever answer correctly in the fastest time, no matter what, will get the highest
  // modifier possible.
  //
  // Expected criteria format (will act as a set via fields being included/excluded): {
  //   bool walkingAway
  //   bool hotSeatPlayerWrong
  //   bool lifelineUsed
  // }
  gradeForContestants(criteria = {}) {
    this.playerMap.doAll((player) => {
      if (player.isContestant() && player.hotSeatTime !== undefined
          && !criteria.hotSeatPlayerWrong && this.answerIsCorrect(player.hotSeatChoice)) {
        var elapsedTime = player.hotSeatTime - this.startTime;
        // When a lifeline is used, all contestants should get the highest possible bonus if they
        // answer correctly. This should be negated by walking away, however, where a discounted
        // rate should be given. Otherwise, contestants would make way more money than the hot seat
        // player, should they get the last question right.
        elapsedTime = criteria.lifelineUsed ? 0 : elapsedTime;
        elapsedTime = criteria.walkingAway ? 10000 : elapsedTime;
        player.money += this._getScaledPayout(elapsedTime);
        // TODO: Add ask the audience and phone a friend help and sabotage modifiers here.
      }
    });
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
HotSeatQuestion.QUESTION_TEXT_WAIT_TIMES = QUESTION_TEXT_WAIT_TIMES;
HotSeatQuestion.getSafeHavenIndex = getSafeHavenIndex;