const expect = require('chai').expect;
const should = require('chai').should();

const Choices = require(process.cwd() + '/server/question/Choices.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerDisplay = require(process.cwd() + '/server/game/PlayerDisplay.js');

describe('PlayerTest', () => {
  it('chooseFastestFingerShouldAddChoiceWhenAvailable', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');

    player.chooseFastestFinger(Choices.A);

    expect(player.fastestFingerChoices).to.deep.equal([Choices.A]);
  });

  it('chooseFastestFingerShouldNotAddChoiceWhenAtCapacity', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');

    player.chooseFastestFinger(Choices.A);
    player.chooseFastestFinger(Choices.B);
    player.chooseFastestFinger(Choices.C);
    player.chooseFastestFinger(Choices.D);
    player.chooseFastestFinger(Choices.A);

    expect(player.fastestFingerChoices).to.deep.equal([Choices.A, Choices.B, Choices.C, Choices.D]);
  });

  it('chooseFastestFingerShouldNotAddChoiceWhenAlreadyPresent', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');

    player.chooseFastestFinger(Choices.A);
    player.chooseFastestFinger(Choices.A);

    expect(player.fastestFingerChoices).to.deep.equal([Choices.A]);
  });

  it('chooseFastestFingerShouldTrackTimeOfAnswerWhenAllChoicesIn', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');
    var timeBefore, timeAfter;

    player.chooseFastestFinger(Choices.A);
    player.chooseFastestFinger(Choices.B);
    player.chooseFastestFinger(Choices.C);
    timeBefore = player.fastestFingerTime;
    player.chooseFastestFinger(Choices.D);
    timeAfter = player.fastestFingerTime;

    expect(timeBefore).to.be.undefined;
    expect(timeAfter).to.not.be.undefined;
  });

  describe('chooseHotSeat', function () {
    it('shouldChooseWhenNoChoiceMadeYet', () => {
      var player = new Player(new MockSocket('socket_id'), 'username');

      player.chooseHotSeat(Choices.A);

      expect(player.hotSeatChoice).to.equal(Choices.A);
      expect(player.hotSeatTime).to.not.be.undefined;
    });

    it('shouldNotResetTimeOnRepeatChoice', () => {
      var player = new Player(new MockSocket('socket_id'), 'username');
      player.chooseHotSeat(Choices.A);
      player.hotSeatTime = 1;

      player.chooseHotSeat(Choices.A);

      expect(player.hotSeatChoice).to.equal(Choices.A);
      expect(player.hotSeatTime).to.equal(1);
    });

    it('shouldUpdateChoiceAndTimeOnDifferentChoice', () => {
      var player = new Player(new MockSocket('socket_id'), 'username');
      player.chooseHotSeat(Choices.A);
      player.hotSeatTime = 1;

      player.chooseHotSeat(Choices.B);

      expect(player.hotSeatChoice).to.equal(Choices.B);
      expect(player.hotSeatTime).to.not.equal(1);
    });
  });

  it('clearAllAnswersShouldGiveExpectedResult', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');
    player.chooseFastestFinger(Choices.A);
    player.chooseHotSeat(Choices.A);

    player.clearAllAnswers();

    expect(player.fastestFingerChoices).to.be.empty;
    expect(player.fastestFingerTime).to.be.undefined;
    expect(player.hotSeatChoice).to.be.undefined;
    expect(player.hotSeatTime).to.be.undefined;
  });

  it('hasFastestFingerChoicesLeftShouldGiveExpectedResult', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');
    player.chooseFastestFinger(Choices.A);
    player.chooseFastestFinger(Choices.B);
    player.chooseFastestFinger(Choices.C);

    var expectedTrueResult = player.hasFastestFingerChoicesLeft();
    player.chooseFastestFinger(Choices.D);
    var expectedFalseResult = player.hasFastestFingerChoicesLeft();

    expect(expectedTrueResult).to.be.true;
    expect(expectedFalseResult).to.be.false;
  });

  it('hasAlreadyChosenFastestFingerChoiceShouldGiveExpectedResult', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');
    player.chooseFastestFinger(Choices.A);

    var expectedTrueResult = player.hasAlreadyChosenFastestFingerChoice(Choices.A);
    var expectedFalseResult = player.hasAlreadyChosenFastestFingerChoice(Choices.B);

    expect(expectedTrueResult).to.be.true;
    expect(expectedFalseResult).to.be.false;
  });

  describe('isContestant', function () {
    it('shouldReturnTrueWhenNeitherHotSeatOrShowHost', function () {
      var player = new Player(new MockSocket('socket'), 'player');

      player.isContestant().should.be.true;
    });

    it('shouldReturnFalseWhenShowHost', function () {
      var player = new Player(new MockSocket('socket'), 'player');
      player.isShowHost = true;

      player.isContestant().should.be.false;
    });

    it('shouldReturnFalseWhenHotSeat', function () {
      var player = new Player(new MockSocket('socket'), 'player');
      player.isHotSeatPlayer = true;

      player.isContestant().should.be.false;
    });
  });

  describe('toCompressed', function () {
    it('shouldGiveExpectedResult', () => {
      var player = new Player(new MockSocket('socket_id'), 'username');
      player.money = 100;

      expect(player.toCompressed('clickAction')).to.deep.equal({
        username: 'username',
        money: 100,
        display: PlayerDisplay.DEFAULT,
        clickAction: 'clickAction'
      });
    });
  });
});