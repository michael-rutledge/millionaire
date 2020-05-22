const expect = require('chai').expect;

const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const Room = require(process.cwd() + '/server/game/Room.js');

// Mocks whether the given room is in game;
function setRoomInGame(room, isInGame) {
  room.gameServer.isInGame = () => { return isInGame };
}

describe('RoomTest', () => {
  it('addPlayerShouldAddPlayerForNewUsernameInLobby', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    var expectedPlayer = new Player(mockSocket, 'username');

    var result = room.addPlayer(mockSocket, 'username');

    expect(result).to.be.true;
    expect(room.getPlayerBySocket(mockSocket)).to.deep.equal(expectedPlayer);
  });

  it('addPlayerShouldSetHostForFirstUsernameInLobby', () => {
    var room = new Room('test');
    var mockSocket1 = new MockSocket('socket_id_1');
    var mockSocket2 = new MockSocket('socket_id_2');
    setRoomInGame(room, false);
    var expectedHost = new Player(mockSocket1, 'host');

    room.addPlayer(mockSocket1, 'host');
    room.addPlayer(mockSocket2, 'joiner');

    expect(room.host).to.deep.equal(expectedHost);
  });

  it('addPlayerShouldNotAddPlayerForExistingUsernameInLobby', () => {
    var room = new Room('test');
    var mockSocket1 = new MockSocket('socket_id_1');
    var mockSocket2 = new MockSocket('socket_id_2');
    setRoomInGame(room, false);

    room.addPlayer(mockSocket1, 'username');
    var result = room.addPlayer(mockSocket2, 'username');

    expect(result).to.be.false;
    expect(room.getPlayerBySocket(mockSocket2)).to.be.undefined;
  });

  it('addPlayerShouldAddPlayerForExistingUsernameWithoutSocketInGame', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    setRoomInGame(room, true);
    room.disconnectPlayer(mockSocket);
    var result = room.addPlayer(mockSocket, 'username');

    expect(result).to.be.true;
    expect(room.getPlayerBySocket(mockSocket)).to.deep.equal(new Player(mockSocket, 'username'));
  });

  it('addPlayerShouldNotAddPlayerForExistingUsernameWithSocketInGame', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    var mockSocket2 = new MockSocket('socket_id_2');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    setRoomInGame(room, true);
    var result = room.addPlayer(mockSocket2, 'username');

    expect(result).to.be.false;
    expect(room.getPlayerBySocket(mockSocket2)).to.be.undefined;
  });

  it('addPlayerShouldNotAddPlayerForNonExistentUsernameInGame', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, true);

    var result = room.addPlayer(mockSocket, 'username');

    expect(result).to.be.false;
    expect(room.getPlayerBySocket(mockSocket)).to.be.undefined;
  });

  it('disconnectPlayerShouldRemoveEntirePlayerInLobby', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    room.disconnectPlayer(mockSocket);

    expect(room.getPlayerBySocket(mockSocket)).to.be.undefined;
    expect(room.getPlayerByUsername('username')).to.be.undefined;
  });

  it('disconnectPlayerShouldRemoveSocketButKeepPlayerByUsernameInGame', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    setRoomInGame(room, true);
    room.disconnectPlayer(mockSocket);

    expect(room.getPlayerBySocket(mockSocket)).to.be.undefined;
    expect(room.getPlayerByUsername('username')).to.deep.equal(new Player(undefined, 'username'));
  });

  it('disconnectPlayerShouldSetNewHostIfHostDisconnects', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    var mockSocket2 = new MockSocket('socket_id_2');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'firstHost');
    room.addPlayer(mockSocket2, 'newHost');

    room.disconnectPlayer(mockSocket);

    expect(room.host).to.not.deep.equal(new Player(mockSocket, 'firstHost'));
    expect(room.host).to.deep.equal(new Player(mockSocket2, 'newHost'));
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