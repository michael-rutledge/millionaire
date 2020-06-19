const expect = require('chai').expect;
const should = require('chai').should();

const Choices = require(process.cwd() + '/server/question/Choices.js');
const FastestFingerQuestion = require(process.cwd() + '/server/question/FastestFingerQuestion.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

const DATE_NOW = Date.now();

function getPreppedQuestion() {
  var playerMap = new PlayerMap();
  var ffq = new FastestFingerQuestion({
    text: 'question_text',
    orderedChoices: ['choice_1', 'choice_2', 'choice_3', 'choice_4']
  }, playerMap);
  ffq.shuffledChoices = ['choice_2', 'choice_1', 'choice_4', 'choice_3'];
  ffq.startTime = DATE_NOW - 10000;
  return ffq;
}

describe('FastestFingerQuestionTest', () => {
  describe('allPlayersDone', function () {
    it('shouldReturnTrueWhenAllPlayersDoneWithNoShowHost', function () {
      var ffq = getPreppedQuestion();
      var player = new Player(new MockSocket('socket_id'), 'player');
      ffq.playerMap.putPlayer(player);
      player.fastestFingerChoices = [Choices.A, Choices.B, Choices.C, Choices.D];
      player.fastestFingerTime = DATE_NOW;

      ffq.allPlayersDone().should.be.true;
    });

    it('shouldReturnFalseWhenNotAllPlayersDoneWithNoShowHost', function () {
      var ffq = getPreppedQuestion();
      var player = new Player(new MockSocket('socket_id'), 'player');
      ffq.playerMap.putPlayer(player);

      ffq.allPlayersDone().should.be.false;
    });

    it('shouldReturnTrueWhenAllPlayersDoneWithShowHost', function () {
      var ffq = getPreppedQuestion();
      var player = new Player(new MockSocket('socket_id'), 'player');
      ffq.playerMap.putPlayer(player);
      player.fastestFingerChoices = [Choices.A, Choices.B, Choices.C, Choices.D];
      player.fastestFingerTime = DATE_NOW;
      var host = new Player(new MockSocket('host_id'), 'host');
      host.isShowHost = true;
      ffq.playerMap.putPlayer(host);

      ffq.allPlayersDone().should.be.true;
    });

    it('shouldReturnFalseWhenNotAllPlayersDoneWithShowHost', function () {
      var ffq = getPreppedQuestion();
      var player = new Player(new MockSocket('socket_id'), 'player');
      ffq.playerMap.putPlayer(player);
      var host = new Player(new MockSocket('host_id'), 'host');
      host.isShowHost = true;
      ffq.playerMap.putPlayer(host);

      ffq.allPlayersDone().should.be.false;
    });
  });

  describe('getAnswerScore', function () {
    it('shouldGiveExpectedResult', () => {
      var ffq = new FastestFingerQuestion({
        text: 'question_text',
        orderedChoices: ['choice_1', 'choice_2', 'choice_3', 'choice_4']
      });
      ffq.shuffledChoices = ['choice_2', 'choice_1', 'choice_4', 'choice_3'];

      var correctResult = ffq.getAnswerScore([Choices.B, Choices.A, Choices.D, Choices.C]);
      var incorrectResult = ffq.getAnswerScore([Choices.B, Choices.C, Choices.D, Choices.A]);

      expect(correctResult).to.equal(4);
      expect(incorrectResult).to.equal(2);
    });
  });

  describe('getResults', function () {
    it('shouldExcludeHost', function () {
      var ffq = getPreppedQuestion();
      var hostPlayer = new Player(new MockSocket('socket_id'), 'host');
      ffq.playerMap.putPlayer(hostPlayer);
      hostPlayer.isShowHost = true;
      hostPlayer.fastestFingerChoices = [Choices.B, Choices.A, Choices.D, Choices.C];
      hostPlayer.fastestFingerTime = Date.now();

      var result = ffq.getResults();

      result.playerResults.should.be.empty;
      expect(result.hotSeatPlayer).to.be.undefined;
    });

    it('shouldIncludeNonShowHostPlayers', function () {
      var ffq = getPreppedQuestion();
      var player = new Player(new MockSocket('socket_id'), 'player');
      ffq.playerMap.putPlayer(player);
      player.fastestFingerChoices = [Choices.B, Choices.A, Choices.D, Choices.C];
      player.fastestFingerTime = DATE_NOW;

      var result = ffq.getResults();

      result.should.deep.equal({
        playerResults: [{
          username: player.username,
          score: 4,
          time: 10000
        }],
        hotSeatPlayer: player
      });
    });

    it('shouldGiveExpectedResultForMultiplePlayers', function () {
      var ffq = getPreppedQuestion();
      var player1 = new Player(new MockSocket('socket_id'), 'player1');
      ffq.playerMap.putPlayer(player1);
      player1.fastestFingerChoices = [Choices.B, Choices.A, Choices.C, Choices.D];
      player1.fastestFingerTime = DATE_NOW;
      var player2 = new Player(new MockSocket('socket_id'), 'player2');
      ffq.playerMap.putPlayer(player2);
      player2.fastestFingerChoices = [Choices.B, Choices.A, Choices.D, Choices.C];
      player2.fastestFingerTime = DATE_NOW  + 2000;

      var result = ffq.getResults();

      result.should.deep.equal({
        playerResults: [{
          username: player1.username,
          score: 2,
          time: 10000
        }, {
          username: player2.username,
          score: 4,
          time: 12000
        }],
        hotSeatPlayer: player2
      });
    });
  });

  describe('revealAnswer', function () {
    it('shouldRevealAnswerWhenAnswersLeft', () => {
      var ffq = new FastestFingerQuestion({
        text: 'question_text',
        orderedChoices: ['choice_1', 'choice_2', 'choice_3', 'choice_4']
      });
      ffq.shuffledChoices = ['choice_2', 'choice_1', 'choice_4', 'choice_3'];

      ffq.revealAnswer();

      expect(ffq.revealedAnswers).to.deep.equal([{
        text: 'choice_1',
        choice: Choices.B
      }]);
    });

    it('shouldNotRevealAnswerWhenNoAnswersLeft', () => {
      var ffq = new FastestFingerQuestion({
        text: 'question_text',
        orderedChoices: ['choice_1', 'choice_2', 'choice_3', 'choice_4']
      });
      ffq.shuffledChoices = ['choice_2', 'choice_1', 'choice_4', 'choice_3'];

      for (var i = 0; i < ffq.shuffledChoices.length + 1; i++) {
        ffq.revealAnswer();
      }

      expect(ffq.revealedAnswers).to.have.lengthOf(4);
    });
  });

  describe('revealedAllAnswers', function () {
    it('shouldReturnTrueWhenNoAnswersLeft', () => {
      var ffq = new FastestFingerQuestion({
        text: 'question_text',
        orderedChoices: ['choice_1', 'choice_2', 'choice_3', 'choice_4']
      });
      ffq.shuffledChoices = ['choice_2', 'choice_1', 'choice_4', 'choice_3'];
      for (var i = 0; i < ffq.shuffledChoices.length; i++) {
        ffq.revealAnswer();
      }

      expect(ffq.revealedAllAnswers()).to.be.true;
    });

    it('shouldReturnTrueWhenNoAnswersLeft', () => {
      var ffq = new FastestFingerQuestion({
        text: 'question_text',
        orderedChoices: ['choice_1', 'choice_2', 'choice_3', 'choice_4']
      });
      ffq.shuffledChoices = ['choice_2', 'choice_1', 'choice_4', 'choice_3'];
      ffq.revealAnswer();

      expect(ffq.revealedAllAnswers()).to.be.false;
    });
  });
});