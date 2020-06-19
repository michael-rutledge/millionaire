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

  // Returns a JSON object encapsulating the results of this fastest finger question.
  //
  // Expects all players to have an answer, which is enforced by the rules of GameServer.
  getResults() {
    var fastestFingerResults = {};
    fastestFingerResults.playerResults = [];
    var bestScore = 0;
    var bestTime = Date.now();

    this.playerMap.doAll((player) => {
      if (!player.isShowHost) {
        var elapsedTime = player.fastestFingerTime - this.startTime;
        var playerScore = this.getAnswerScore(player.fastestFingerChoices);
        player.fastestFingerScore = playerScore;

        // Set hot seat player if answer is best.
        if (playerScore > bestScore || (playerScore >= bestScore && elapsedTime <= bestTime)) {
          bestScore = playerScore;
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