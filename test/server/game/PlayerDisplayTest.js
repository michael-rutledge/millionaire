const expect = require('chai').expect;
const should = require('chai').should();

const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerDisplay = require(process.cwd() + '/server/game/PlayerDisplay.js');

describe('PlayerDisplayTest', function () {
  describe('getDisplayFromPlayer', function () {
    it('shouldReturnExpectedValueForHotSeatPlayer', function () {
      var player = new Player(new MockSocket('socket'), 'player');
      player.isHotSeatPlayer = true;

      PlayerDisplay.getDisplayFromPlayer(player).should.equal(PlayerDisplay.HOT_SEAT);
    });

    it('shouldReturnExpectedValueForSelectedPlayer', function () {
      var player = new Player(new MockSocket('socket'), 'player');
      player.selectedForPhoneAFriend = true;

      PlayerDisplay.getDisplayFromPlayer(player).should.equal(PlayerDisplay.SELECTED);
    });

    it('shouldReturnExpectedValueForDefaultPlayer', function () {
      var player = new Player(new MockSocket('socket'), 'player');

      PlayerDisplay.getDisplayFromPlayer(player).should.equal(PlayerDisplay.DEFAULT);
    });
  });
});