const Choices = require(process.cwd() + '/server/question/Choices.js');
const Lifeline = require(process.cwd() + '/server/lifeline/Lifeline.js');

// Number of computer audience members to simulate for percentage calculations.
const AUDIENCE_COUNT = 100;

// Skew for correct choice selection during AI results generation.
//
// Reflected as a power. Higher values skew more to lower numbers, lower value (underneath 1) skew
// more to higher numbers.
//
// 1 is equal to a bell curve distribution centered on the 50% line.
const PERFOMANCE_SKEWS = [
  0.05,
  0.075,
  0.1,
  0.2,
  0.3,
  0.4,
  0.4,
  0.5,
  0.5,
  0.6,
  0.7,
  0.7,
  0.7,
  0.8,
  1
];

class AskTheAudienceLifeline extends Lifeline {
  
  constructor(playerMap) {
    super(/*socketEvent=*/'hotSeatUseAskTheAudience', playerMap);
  
    // Array grouped by choice index to keep track of contestant choices.
    this.contestantAnswerBuckets = [
      /*Choices.A*/0,
      /*Choices.B*/0,
      /*Choices.C*/0,
      /*Choices.D*/0
    ];

    // Array grouped by choice index to keep track of ai-generated choices.
    this.aiAnswerBuckets = [
      /*Choices.A*/0,
      /*Choices.B*/0,
      /*Choices.C*/0,
      /*Choices.D*/0
    ];
  }


  // PRIVATE METHODS

  // Returns a 
  _getScaledCorrectPercentageForQuestionIndex(questionIndex) {
    let u = 0, v = 0, min = 0, max = 1;
    let skew = PERFOMANCE_SKEWS[questionIndex];
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    var entropy = 10.0;  // How much the answer should vary. Higher => more variance.
    let num = Math.sqrt( -1 * entropy * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    // Translate to 0 -> 1
    num = num / 10.0 + 0.5;
    // resample between 0 and 1 if out of range
    if (num > 1 || num < 0) num = this._getScaledCorrectPercentageForQuestionIndex(questionIndex);
    // Skew
    num = Math.pow(num, skew);
    // Stretch to fill range
    num *= max - min;
    // offset to min
    num += min;

    return num;
  }


  // PUBLIC METHODS

  // Populates all of the answer buckets for this instance of Ask the Audience.
  //
  // This can be seen as the effective "execute" method of the lifeline.
  populateAllAnswerBuckets() {
    this.populateContestantAnswerBuckets();
    this.populateAIAnswerBuckets();
  }

  // Populates the ai answer buckets based on the difficulty assumed by the given question index.
  //
  // Expected to be called only once in the lifetime of the lifeline.
  populateAIAnswerBuckets() {
    var remainingOrderedChoiceIndexes = this.question.getRemainingOrderedChoiceIndexes();
    var correctPercentage = this._getScaledCorrectPercentageForQuestionIndex(
      this.question.questionIndex);
    var audienceChoicesRemaining = AUDIENCE_COUNT;
    var numCorrect = Math.floor(AUDIENCE_COUNT * correctPercentage);

    this.aiAnswerBuckets[this.question.getShuffledChoice(0)] += numCorrect;
    audienceChoicesRemaining -= numCorrect;

    for (var i = 1; i < remainingOrderedChoiceIndexes.length; i++) {
      var numChosen = Math.floor(Math.random() * audienceChoicesRemaining);
      if (i >= remainingOrderedChoiceIndexes.length - 1) {
        numChosen = audienceChoicesRemaining;
      }
      this.aiAnswerBuckets[this.question.getShuffledChoice(i)] += numChosen;
      audienceChoicesRemaining -= numChosen;
    }
  }

  // Populates the contestant answer buckets.
  //
  // Expected to be called only once in the lifetime of the lifeline.
  populateContestantAnswerBuckets() {
    this.playerMap.doAll((player) => {
      if (player.hotSeatChoice !== undefined && Choices.isValidChoice(player.hotSeatChoice)) {
        this.contestantAnswerBuckets[player.hotSeatChoice]++;
      }
    });
  }

  // Returns a JSON representation of the results of askiing the audience.
  //
  // The data here will be interpreted by the frontend into a bar graph of answer percentages.
  getResults() {
    return {
      contestantAnswerBuckets: this.contestantAnswerBuckets,
      aiAnswerBuckets: this.aiAnswerBuckets
    };
  }
}

module.exports = AskTheAudienceLifeline;
module.exports.AUDIENCE_COUNT = AUDIENCE_COUNT;