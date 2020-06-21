const Choices = require(process.cwd() + '/server/question/Choices.js');
const Lifeline = require(process.cwd() + '/server/lifeline/Lifeline.js');

class PhoneAFriendLifeline extends Lifeline {

  constructor(playerMap) {
    super(/*socketEvent=*/'hotSeatUsePhoneAFriend', playerMap);
    
    // Reference to player acting as phoned friend.
    this.friend = undefined;

    // Choice being suggested by the phoned friend.
    this.friendChoice = undefined;

    // Expected to be a percentage value between 0 and 1.
    this.friendConfidence = undefined;
  }


  // PRIVATE METHODS

  // Returns an AI choice.
  // TODO: implement phone a friend AI choice logic.
  _getAIChoice() {
    return  {
      choice:Choices.A,
      confidence: 0.0
    };
  }


  // PUBLIC METHODS

  // Returns a JSON representation of the results of this phone a friend instance.
  getResults() {
    return {
      choice: this.friendChoice,
      confidence: this.friendConfidence
    };
  }

  // Returns whether this lifeline should display its results to players.
  hasResultsForQuestionIndex(questionIndex) {
    // Verbose if statement because using just a return statement didn't give a boolean result.
    return this.isActiveForQuestionIndex(questionIndex) && this.friendChoice !== undefined
      && this.friendConfidence !== undefined;
  }

  // Returns whether the lifeline is currently active.
  isActiveForQuestionIndex(questionIndex) {
    return this.used && this.question !== undefined
      && this.question.questionIndex === questionIndex;
  }

  // Sets choice and confidence from the given data, not overwriting if values are already present.
  maybeSetFriendChoiceAndConfidence(choice, confidence) {
    this.friendChoice = this.friendChoice === undefined ? choice : this.friendChoice;
    this.friendConfidence = this.friendConfidence === undefined ?
      confidence : this.friendConfidence;
    // At this point, we want to clear the selected property on the friend to make clearing the
    // display easier.
    if (this.friend) {
      this.friend.selectedForPhoneAFriend = false;
    }
  }

  // Picks the friend to ask for this phone a friend instance from the given username.
  //
  // An undefined friend leads to AI choice selection.
  pickFriend(friendUsername) {
    this.friend = this.playerMap.getPlayerByUsername(friendUsername);

    if (this.friend) {
      this.friendChoice = this.friend.hotSeatChoice;
      this.friend.selectedForPhoneAFriend = true;
    } else {
      var aiChoice = this._getAIChoice();
      this.friendChoice = aiChoice.choice;
      this.friendConfidence = aiChoice.confidence;
    }
  }

  // Returns whether the lifeline is currently waiting for a choice from the given player.
  waitingForChoiceFromPlayer(player) {
    return this.friendChoice === undefined && this.friend == player;
  }

  // Returns whether the lifeline is currently waiting for confidence from the given player.
  waitingForConfidenceFromPlayer(player) {
    return this.friendConfidence === undefined && this.friend == player;
  }
}

module.exports = PhoneAFriendLifeline;