const expect = require('chai').expect;
const should = require('chai').should();

const AskTheAudienceLifeline = require(process.cwd() + '/server/lifeline/AskTheAudienceLifeline.js');
const Choices = require(process.cwd() + '/server/question/Choices.js');
const HotSeatQuestion = require(process.cwd() + '/server/question/HotSeatQuestion.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

function getMockHotSeatQuestion(questionIndex = 0) {
  return new HotSeatQuestion({
    text: 'question',
    orderedChoices: ['correct', 'incorrect1', 'incorrect2', 'incorrect3']
  }, questionIndex);
}

describe('AskTheAudienceLifelineTest', function () {
  describe('populateAllAnswerBuckets', function () {
    it('shouldCallPopulateAIAnswerBucketsAndPopulateContestantAnswerBuckets', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      playerMap.putPlayer(player);
      var askTheAudience = new AskTheAudienceLifeline(playerMap);
      aiAnswersPopulated = false;
      contestantAnswersPopulated = false;
      askTheAudience.populateAIAnswerBuckets = () => { aiAnswersPopulated = true; };
      askTheAudience.populateContestantAnswerBuckets = () => { contestantAnswersPopulated = true; };

      askTheAudience.populateAllAnswerBuckets();

      aiAnswersPopulated.should.be.true;
      contestantAnswersPopulated.should.be.true;
    });
  });

  describe('populateAIAnswerBuckets', function () {
    it('shouldPopulateBucketsProperly', function () {
      var askTheAudience = new AskTheAudienceLifeline();
      var question = getMockHotSeatQuestion(/*questionIndex=*/14);
      question.revealAllChoices();
      askTheAudience.startForQuestion(question);

      askTheAudience.populateAIAnswerBuckets();

      var totalChoices = 0;
      askTheAudience.aiAnswerBuckets.forEach((numChoices) => {
        totalChoices += numChoices;
      });
      totalChoices.should.equal(AskTheAudienceLifeline.AUDIENCE_COUNT);
    });
  });  

  describe('populateContestantAnswerBuckets', function () {
    it('shouldAddForChoicesPresent', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      playerMap.putPlayer(player);
      var askTheAudience = new AskTheAudienceLifeline(playerMap);
      player.chooseHotSeat(Choices.A);

      askTheAudience.populateContestantAnswerBuckets();

      askTheAudience.contestantAnswerBuckets.should.deep.equal([1, 0, 0, 0]);
    });

    it('shouldIgnoreContestantsWithoutChoices', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      playerMap.putPlayer(player);
      var askTheAudience = new AskTheAudienceLifeline(playerMap);

      askTheAudience.populateContestantAnswerBuckets();

      askTheAudience.contestantAnswerBuckets.should.deep.equal([0, 0, 0, 0]);
    });
  });

  describe('getResults', function () {
    it('shouldGiveExpectedResults', function () {
      var playerMap = new PlayerMap();
      var player = new Player(new MockSocket('socket'), 'player');
      playerMap.putPlayer(player);
      var askTheAudience = new AskTheAudienceLifeline(playerMap);
      var question = getMockHotSeatQuestion();
      question.revealAllChoices();
      askTheAudience.startForQuestion(question);
      askTheAudience.populateAllAnswerBuckets();

      var results = askTheAudience.getResults();

      results.should.deep.equal({
        aiAnswerBuckets: askTheAudience.aiAnswerBuckets,
        contestantAnswerBuckets: askTheAudience.contestantAnswerBuckets
      });
    });
  });
});