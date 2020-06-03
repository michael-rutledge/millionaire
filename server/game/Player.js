const Choices = require(process.cwd() + '/server/question/Choices.js');

// Encapsulates a player and their possible actions in Millionaire With Friends.
class Player {

  // Constructs a new Player from the given information.
  constructor(socket, username) {
    this.socket = socket;
    this.username = username;
    this.money = 0;
    this.fastestFingerChoices = [];
    this.fastestFingerTime = undefined;
    this.hotSeatChoice = undefined;
    this.hotSeatTime = undefined;
  }


  // PUBLIC METHODS

  // Adds the given choice to the Player's fastest finger choices.
  //
  // The choice is expected to be a value from Choices.js.
  chooseFastestFinger(choice) {
    if (Choices.isValidChoice(choice) &&
        !this.hasAlreadyChosenFastestFingerChoice(choice) && this.hasFastestFingerChoicesLeft()) {
      this.fastestFingerChoices.push(choice);
      // Last choice should keep track of the time to allow for calculating elapsed time
      if (this.fastestFingerChoices.length == Choices.MAX_CHOICES) {
        this.fastestFingerTime = new Date().getTime();
      }
    }
  }

  // Chooses an answer for a hot seat question for this Player.
  //
  // Time of answer is tracked in calculation of contestant money.
  chooseHotSeat(choice) {
    if (Choices.isValidChoice(choice) && this.hotSeatChoice === undefined) {
      this.hotSeatChoice = choice;
      this.hotSeatTime = new Date().getTime();
    }
  }

  // Clears all answers given by the Player.
  clearAllAnswers() {
    this.fastestFingerChoices = [];
    this.fastestFingerTime = undefined;
    this.hotSeatChoice = undefined;
    this.hotSeatTime = undefined;
  }

  // Returns whether the player is able to add another choice to their fastest finger choice
  // selection.
  hasFastestFingerChoicesLeft() {
    return this.fastestFingerChoices.length < Choices.MAX_CHOICES;
  }

  // Returns whether the player has already selected the given choice on fastest finger.
  hasAlreadyChosenFastestFingerChoice(choice) {
    return this.fastestFingerChoices.includes(choice);
  }

  // Resets the player to base stats.
  reset() {
    this.money = 0;
    this.clearAllAnswers();
  }
}

module.exports = Player;
