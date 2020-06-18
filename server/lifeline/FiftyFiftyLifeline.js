const Lifeline = require(process.cwd() + '/server/lifeline/Lifeline.js');

class FiftyFiftyLifeline extends Lifeline {

  constructor(playerMap) {
    super(/*socketEvent=*/'hotSeatUseFiftyFifty', playerMap);
  }


  // PRIVATE METHODS

  // Resets answers for contestants who got screwed by the fifty fifty.
  _resetAnswersForContestants() {
    this.playerMap.doAll((player) => {
      if (this.question.revealedChoices[player.hotSeatChoice] === undefined) {
        player.clearAllAnswers();
      }
    });
  }

  // PUBLIC METHODS

  // Executes the fifty fifty by setting two random wrong revealedChoices to undefined.
  //
  // Expected to be called only once, and on a valid HotSeatQuestion with all questions revealed.
  removeTwoWrongChoices() {
    var choiceList = Object.keys(this.question.revealedChoices);
    choiceList.splice(this.question.getCorrectChoice(), 1);
    var wrongChoiceSetIndexToKeep = Math.floor(Math.random() * choiceList.size);
    choiceList.splice(wrongChoiceSetIndexToKeep, 1);

    choiceList.forEach((choice, index) => {
      this.question.revealedChoices[choice] = undefined;
    });
    this._resetAnswersForContestants();
  }
}

module.exports = FiftyFiftyLifeline;