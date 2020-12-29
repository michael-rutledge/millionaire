const Choices = require(process.cwd() + '/server/question/Choices.js');
const Logger = require(process.cwd() + '/server/logging/Logger.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');
const Question = require(process.cwd() + '/server/question/Question.js');

// Stores and grades a fastest finger question.
class FastestFingerQuestion extends Question {
  constructor(ffqJson, playerMap = new PlayerMap()) {
    super(ffqJson);
    this.playerMap = playerMap;

    // Answers revealed to contestants after the question is over.
    //
    // Expected answer format: {
    //   string text,
    //   Choice choice
    // }
    this.revealedAnswers = [];
    // Best score in the current Fastest Finger round.
    //
    // This is an artifact of grading Fastest Finger on a one-time-only basis. Now because we follow
    // the show, we redo Fastest Finger when no one gets it completely right, so best score should
    // always be 4.
    this.bestScore = Choices.MAX_CHOICES;
  }

  // PRIVATE METHODS

  // Returns the shuffled choice index associated with the given ordered choice index.
  _getShuffledChoiceIndex(orderedChoiceIndex) {
    for (var i = 0; i < this.shuffledChoices.length; i++) {
      if (this.orderedChoices[orderedChoiceIndex] === this.shuffledChoices[i]) {
        return i;
      }
    }

    return -1;
  }


  // PUBLIC METHODS

  // Returns whether all possible players have completed their fastest finger answers.
  allPlayersDone() {
    var showHostOffset = 0;
    var doneCount = 0;

    this.playerMap.doAll((player) => {
      if (player.isShowHost) {
        showHostOffset++;
      } else if (!player.hasFastestFingerChoicesLeft()) {
        doneCount++;
      }
    });

    return doneCount >= this.playerMap.getPlayerCount() - showHostOffset;
  }

  // Returns false if at least one player managed to get all choices in the correct order; true if
  // otherwise.
  allPlayersIncorrect() {
    var allIncorrect = true;

    this.playerMap.doAll((player) => {
      if (!player.isShowHost
            && this.getAnswerScore(player.fastestFingerChoices) >= this.bestScore) {
        allIncorrect = false;
      }
    });

    return allIncorrect;
  }

  // Grades the given score by returning how many answers matched the ordered choices of this
  // question.
  getAnswerScore(fastestFingerChoices) {
    var score = 0;

    for (let i = 0; i < fastestFingerChoices.length; i++) {
      if (this.shuffledChoices[fastestFingerChoices[i]] == this.orderedChoices[i]) {
        score++;
      }
    }

    return score;
  }

  // Returns correctness of the given player's Fastest Finger choices in the form of a list of
  // correctness values.
  getClientCorrectness(socket) {
    var player = this.playerMap.getPlayerBySocket(socket);
    var correctness = [];

    // Instantiate all correctness as DEFAULT first.
    for (let i = 0; i < this.bestScore; i++) {
      correctness.push(Choices.Correctness.DEFAULT);
    }

    // Set actual correctness.
    for (let i = 0; player !== undefined && i < player.fastestFingerChoices.length; i++) {
      if (this.shuffledChoices[player.fastestFingerChoices[i]] == this.orderedChoices[i]) {
        correctness[i] = Choices.Correctness.CORRECT;
      } else if (player.fastestFingerChoices !== undefined
          && player.fastestFingerChoices.length > 0) {
        correctness[i] = Choices.Correctness.INCORRECT;
      }
    }

    return correctness;
  }

  // Returns a JSON object encapsulating the results of this fastest finger question.
  //
  // Expects all players to have an answer, which is enforced by the rules of GameServer.
  getResults() {
    var fastestFingerResults = {};
    fastestFingerResults.playerResults = [];
    var bestTime = Date.now();

    this.playerMap.doAll((player) => {
      if (!player.isShowHost) {
        var elapsedTime = player.fastestFingerTime - this.startTime;
        var playerScore = this.getAnswerScore(player.fastestFingerChoices);
        player.fastestFingerScore = playerScore;

        // Set hot seat player if answer is best.
        if (playerScore >= this.bestScore && elapsedTime <= bestTime) {
          bestTime = elapsedTime;
          fastestFingerResults.hotSeatPlayer = player;
        }

        fastestFingerResults.playerResults.push({
          username: player.username,
          score: playerScore,
          time: elapsedTime
        });
      }
    });

    return fastestFingerResults;
  }

  // Reveals a correct answer to be displayed back to contestants.
  revealAnswer() {
    if (!this.revealedAllAnswers()) {
      var choice = this.revealedAnswers.length;
      this.revealedAnswers.push({
        text: this.orderedChoices[choice],
        choice: this._getShuffledChoiceIndex(choice)
      });
    }
  }

  // Returns whether all answers have been revealed.
  revealedAllAnswers() {
    return this.revealedAnswers.length >= this.orderedChoices.length;
  }
}

module.exports = FastestFingerQuestion;