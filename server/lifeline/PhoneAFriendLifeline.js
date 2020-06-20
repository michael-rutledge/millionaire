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

  // Picks the friend to ask for this phone a friend instance from the given username.
  //
  // An undefined friend leads to AI choice selection.
  pickFriend(friendUsername) {
    this.friend = this.playerMap.getPlayerByUsername(friendUsername);

    if (this.friend) {
      this.friendChoice = this.friend.hotSeatChoice;
    } else {
      var aiChoice = this._getAIChoice();
      this.friendChoice = aiChoice.choice;
      this.friendConfidence = aiChoice.confidence;
    }
  }

  // Sets the choice being put forth by the phone friend.
  //
  // Expected to only be used in the event of a phoned friend not having a choice ready at the
  // start.
  setFriendChoice(friendChoice) {
    this.friendChoice = friendChoice;
  }

  // Sets the confidence level of a friend's answer.
  //
  // Expected to only be used for human friends, as AI confidence is set upon choice generation.
  setFriendConfidence(friendConfidence) {
    this.friendConfidence = friendConfidence;
  }
}

module.exports = PhoneAFriendLifeline;