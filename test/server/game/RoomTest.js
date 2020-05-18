const expect = require('chai').expect;

const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const Room = require(process.cwd() + '/server/game/Room.js');

describe('RoomTest', () => {
  it('addPlayerShouldAddPlayerForNewUsername', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');

    var result = room.addPlayer(mockSocket, 'username');

    expect(result).to.be.true;
    expect(room.getPlayerBySocket(mockSocket)).to.deep.equal(new Player(mockSocket, 'username'));
  });

  it('addPlayerShouldNotAddPlayerForExistingUsername', () => {
    var room = new Room('test');
    var mockSocket1 = new MockSocket('socket_id_1');
    var mockSocket2 = new MockSocket('socket_id_2');

    room.addPlayer(mockSocket1, 'username');
    var result = room.addPlayer(mockSocket2, 'username');

    expect(result).to.be.false;
    expect(room.getPlayerBySocket(mockSocket2)).to.be.undefined;
  });

  it('disconnectPlayerShouldRemovePlayer', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');

    room.addPlayer(mockSocket, 'username');
    room.disconnectPlayer(mockSocket);

    expect(room.getPlayerBySocket(mockSocket)).to.be.undefined;
    expect(room.getPlayerByUsername('username')).to.be.undefined;
  });

  it('socketsEmptyShouldGiveExpectedResult', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    var emptyBeforeAdd, emptyAfterAdd;

    emptyBeforeAdd = room.socketsEmpty();
    room.addPlayer(mockSocket, 'username');
    emptyAfterAdd = room.socketsEmpty();

    expect(emptyBeforeAdd).to.be.true;
    expect(emptyAfterAdd).to.be.false;
  });
});
