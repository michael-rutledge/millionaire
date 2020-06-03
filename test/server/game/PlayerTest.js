const expect = require('chai').expect;

const Choices = require(process.cwd() + '/server/question/Choices.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');

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

  it('chooseHotSeatShouldChooseWhenNoChoiceMadeYet', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');

    player.chooseHotSeat(Choices.A);

    expect(player.hotSeatChoice).to.equal(Choices.A);
    expect(player.hotSeatTime).to.not.be.undefined;
  });

  it('chooseHotSeatShouldNotChooseWhenChoiceAlreadyMade', () => {
    var player = new Player(new MockSocket('socket_id'), 'username');
    var timeBefore, timeAfter;

    player.chooseHotSeat(Choices.A);
    timeBefore = player.hotSeatTime;
    player.chooseHotSeat(Choices.B);
    timeAfter = player.hotSeatTime;

    expect(player.hotSeatChoice).to.equal(Choices.A);
    expect(timeBefore).to.not.be.undefined;
    expect(timeBefore).to.equal(timeAfter);
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
});