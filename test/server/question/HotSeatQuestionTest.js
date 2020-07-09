const expect = require('chai').expect;
const should = require('chai').should();

const Choices = require(process.cwd() + '/server/question/Choices.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

describe('HotSeatQuestionTest', function () {
  describe('getSafeHavenIndex', function () {
    it('shouldReturnExpectedResultForNegativeCase', function () {
      expect(HotSeatQuestion.getSafeHavenIndex(-1)).to.equal(-1);
    });

    it('shouldReturnExpectedResultForLowTierEdgeCase', function () {
      expect(HotSeatQuestion.getSafeHavenIndex(0)).to.equal(-1);
    });

    it('shouldReturnExpectedResultForLowTierCase', function () {
      expect(HotSeatQuestion.getSafeHavenIndex(1)).to.equal(-1);
    });

    it('shouldReturnExpectedResultForMidTierEdgeCase', function () {
      expect(HotSeatQuestion.getSafeHavenIndex(4)).to.equal(4);
    });

    it('shouldGiveExpectedResultForMidTierCase', function () {
      expect(HotSeatQuestion.getSafeHavenIndex(5)).to.equal(4);
    });

    it('shouldGiveExpectedResultForHighTierEdgeCase', function () {
      expect(HotSeatQuestion.getSafeHavenIndex(14)).to.equal(14);
    });
  });

  describe('answerIsCorrect', function () {
    it('shouldGiveExpectedResult', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      var correctResult = hsq.answerIsCorrect(Choices.C);
      var incorrectResult = hsq.answerIsCorrect(Choices.A);

      correctResult.should.be.true;
      incorrectResult.should.be.false;
    });
  });

  describe('getCorrectChoice', function () {
    it('shouldGiveExpectedResultWhenCorrectChoicePresent', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      hsq.getCorrectChoice().should.equal(Choices.C);
    });

    it('shouldReturnUndefinedWhenCorrectChoiceAbsent', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = [];

      expect(hsq.getCorrectChoice()).to.be.undefined;
    });
  });

  describe('getRemainingOrderedChoiceIndexes', function () {
    it('shouldGiveExpectedResult', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];
      hsq.revealAllChoices();
      hsq.revealedChoices[1] = undefined;

      hsq.getRemainingOrderedChoiceIndexes().should.deep.equal([0, 1, 2]);
    });
  });

  describe('getShuffledChoice', function () {
    it('shouldGiveExpectedResult', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      hsq.getShuffledChoice(0).should.equal(Choices.C);
      hsq.getShuffledChoice(1).should.equal(Choices.A);
      hsq.getShuffledChoice(2).should.equal(Choices.D);
      hsq.getShuffledChoice(3).should.equal(Choices.B);
      expect(hsq.getShuffledChoice(4)).to.be.undefined;
    });
  });

  describe('gradeForContestants', function () {
    function getPreppedQuestionWithOneCorrectPlayer(username) {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket_id'), username);
      playerMap.putPlayer(player);
      var question = new HotSeatQuestion({
        text: 'question',
        orderedChoices: ['choice1', 'choice2', 'choice3', 'choice4']
      }, 0, playerMap);
      question.shuffledChoices = ['choice2', 'choice1', 'choice4', 'choice3'];
      question.markStartTime();
      player.hotSeatChoice = Choices.B;
      player.hotSeatTime = Date.now() + 2000;
      return question;
    }

    it('shouldNotGradeForShowHost', function () {
      var question = getPreppedQuestionWithOneCorrectPlayer('username');
      var player = question.playerMap.getPlayerByUsername('username');
      player.isShowHost = true;

      question.gradeForContestants();

      player.money.should.equal(0);
    });

    it('shouldNotGradeForHotSeatPlayer', function () {
      var question = getPreppedQuestionWithOneCorrectPlayer('username');
      var player = question.playerMap.getPlayerByUsername('username');
      player.isHotSeatPlayer = true;

      question.gradeForContestants();

      player.money.should.equal(0);
    });

    it('shouldAddMoneyForContestantWithRightAnswer', function () {
      var question = getPreppedQuestionWithOneCorrectPlayer('username');
      var player = question.playerMap.getPlayerByUsername('username');

      question.gradeForContestants();

      player.money.should.be.gt(0);
    });

    it('shouldNotAddMoneyForContestantWithWrongAnswer', function () {
      var question = getPreppedQuestionWithOneCorrectPlayer('username');
      var player = question.playerMap.getPlayerByUsername('username');
      player.hotSeatChoice = undefined;

      question.gradeForContestants();

      player.money.should.equal(0);
    });

    it('shouldSetLongElapsedTimeForWalkingAway', function () {
      var question = getPreppedQuestionWithOneCorrectPlayer('username');
      var forcedElapsedTime = undefined;
      question._getScaledPayout = (elapsedTime) => {
        forcedElapsedTime = elapsedTime;
      }

      question.gradeForContestants(/*criteria=*/{
        walkingAway: true
      });

      forcedElapsedTime.should.equal(10000);
    });
  });

  describe('toCompressed', function () {
    it('shouldSetCorrectChoiceIfRequested', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      var result = hsq.toCompressed(/*madeChoice=*/Choices.A, /*showCorrectChoice=*/true);

      result.correctChoice.should.equal(Choices.C);
    });

    it('shouldNotSetCorrectChoiceIfNotRequested', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });
      hsq.shuffledChoices = ['incorrect_1', 'incorrect_3', 'correct', 'incorrect_2'];

      var result = hsq.toCompressed(/*madeChoice=*/Choices.A, /*showCorrectChoice=*/false);

      expect(result.correctChoice).to.be.undefined;
    });

    it('shouldSetChoiceLockedToTrueForChoicePresent', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });

      var result = hsq.toCompressed(/*madeChoice=*/Choices.A, /*showCorrectChoice=*/false);

      result.choiceLocked.should.be.true;
    });

    it('shouldSetChoiceLockedToFalseForChoiceAbsent', function () {
      var hsq = new HotSeatQuestion({
        text: 'question_text',
        orderedChoices: ['correct', 'incorrect_1', 'incorrect_2', 'incorrect_3']
      });

      var result = hsq.toCompressed(/*madeChoice=*/undefined, /*showCorrectChoice=*/false);

      result.choiceLocked.should.be.false;
    });
  });
});