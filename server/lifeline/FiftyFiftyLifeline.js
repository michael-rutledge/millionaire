const Lifeline = require(process.cwd() + '/server/lifeline/Lifeline.js');

class FiftyFiftyLifeline extends Lifeline {

  constructor() {
    super(/*socketEvent=*/'hotSeatUseFiftyFifty');
  }


  // PUBLIC METHODS

  // Executes the fifty fifty by adding elements to the maskedChoiceIndices array of the current
  // question.
  //
  // Expected to be called only once, and on a valid HotSeatQuestion with all questions revealed.
  removeTwoRandomAnswers() {
    var choiceList = Object.keys(this.question.revealedChoices);
    choiceList.splice(this.question.getCorrectChoice(), 1);
    var wrongChoiceSetIndexToKeep = Math.floor(Math.random() * choiceList.size);
    choiceList.splice(wrongChoiceSetIndexToKeep, 1);

    this.question.maskedChoiceIndices = choiceList;
  }
}

module.exports = FiftyFiftyLifeline;