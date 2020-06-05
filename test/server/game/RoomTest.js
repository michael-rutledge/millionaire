const expect = require('chai').expect;

const GameServer = require(process.cwd() + '/server/game/GameServer.js');
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
    expect(room.playerMap.getPlayerBySocket(mockSocket)).to.deep.equal(expectedPlayer);
  });

  it('addPlayerShouldActivateGameServerListeners', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);

    var result = room.addPlayer(mockSocket, 'username');

    expect(Object.keys(mockSocket.listeners)).to.deep.equal(GameServer.SOCKET_EVENTS);
  });

  it('addPlayerShouldSetHostForFirstUsernameInLobby', () => {
    var room = new Room('test');
    var mockSocket1 = new MockSocket('socket_id_1');
    var mockSocket2 = new MockSocket('socket_id_2');
    setRoomInGame(room, false);

    room.addPlayer(mockSocket1, 'host');
    room.addPlayer(mockSocket2, 'joiner');

    expect(room.hostSocket).to.deep.equal(mockSocket1);
    expect(room.hostSocket.emissions['playerBecomeHost']).to.not.be.undefined;
    expect(room.hostSocket.emissions['playerBecomeHost']).to.have.lengthOf(1);
  });

  it('addPlayerShouldNotAddPlayerForExistingUsernameInLobby', () => {
    var room = new Room('test');
    var mockSocket1 = new MockSocket('socket_id_1');
    var mockSocket2 = new MockSocket('socket_id_2');
    setRoomInGame(room, false);

    room.addPlayer(mockSocket1, 'username');
    var result = room.addPlayer(mockSocket2, 'username');

    expect(result).to.be.false;
    expect(room.playerMap.getPlayerBySocket(mockSocket2)).to.be.undefined;
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
    expect(room.playerMap.getPlayerBySocket(mockSocket)).to.deep.equal(
        new Player(mockSocket, 'username'));
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
    expect(room.playerMap.getPlayerBySocket(mockSocket2)).to.be.undefined;
  });

  it('addPlayerShouldNotAddPlayerForNonExistentUsernameInGame', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, true);

    var result = room.addPlayer(mockSocket, 'username');

    expect(result).to.be.false;
    expect(room.playerMap.getPlayerBySocket(mockSocket)).to.be.undefined;
  });

  it('attemptEndGameShouldFailIfSocketIsNotHost', () => {
    var room = new Room('test');
    var hostSocket = new MockSocket('host_socket');
    var otherSocket = new MockSocket('other_socket');
    setRoomInGame(room, false);
    room.addPlayer(hostSocket, 'host');
    room.addPlayer(otherSocket, 'other');
    setRoomInGame(room, true);

    var result = room.attemptEndGame(otherSocket);

    expect(result).to.be.false;
  });

  it('attemptEndGameShouldFailIfInLobby', () => {
    var room = new Room('test');
    var hostSocket = new MockSocket('host_socket');
    setRoomInGame(room, false);
    room.addPlayer(hostSocket, 'host');

    var result = room.attemptEndGame(hostSocket);

    expect(result).to.be.false;
  });

  it('attemptEndGameShouldSucceedOnGoodInput', () => {
    var room = new Room('test');
    var hostSocket = new MockSocket('host_socket');
    setRoomInGame(room, false);
    room.addPlayer(hostSocket, 'host');
    setRoomInGame(room, true);

    var result = room.attemptEndGame(hostSocket);

    expect(result).to.be.true;
  });

  it('attemptStartGameShouldFailIfSocketIsNotHost', () => {
    var room = new Room('test');
    var hostSocket = new MockSocket('host_socket');
    var otherSocket = new MockSocket('other_socket');
    setRoomInGame(room, false);
    room.gameServer.gameOptionsAreValid = (gameOptions) => { return true; };
    room.addPlayer(hostSocket, 'host');
    room.addPlayer(otherSocket, 'other');

    var result = room.attemptStartGame(otherSocket, /*gameOptions=*/{});

    expect(result).to.be.false;
  });

  it('attemptStartGameShouldFailIfInGame', () => {
    var room = new Room('test');
    var hostSocket = new MockSocket('host_socket');
    setRoomInGame(room, false);
    room.gameServer.gameOptionsAreValid = (gameOptions) => { return true; };
    room.addPlayer(hostSocket, 'host');
    setRoomInGame(room, true);

    var result = room.attemptStartGame(hostSocket, /*gameOptions=*/{});

    expect(result).to.be.false;
  });

  it('attemptStartGameShouldFailIfGameOptionsAreInvalid', () => {
    var room = new Room('test');
    var hostSocket = new MockSocket('host_socket');
    setRoomInGame(room, false);
    room.gameServer.gameOptionsAreValid = (gameOptions) => { return false; };
    room.addPlayer(hostSocket, 'host');

    var result = room.attemptStartGame(hostSocket, /*gameOptions=*/{});

    expect(result).to.be.false;
  });

  it('attemptStartGameShouldSucceedOnGoodInput', () => {
    var room = new Room('test');
    var hostSocket = new MockSocket('host_socket');
    setRoomInGame(room, false);
    room.addPlayer(hostSocket, 'host');
    // startGame needs to be nullified to prevent timers starting in GameServer
    room.gameServer.startGame = () => {};

    var result = room.attemptStartGame(hostSocket, /*gameOptions=*/{});

    expect(result).to.be.true;
  });

  it('disconnectPlayerShouldRemoveEntirePlayerInLobby', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    room.disconnectPlayer(mockSocket);

    expect(room.playerMap.getPlayerBySocket(mockSocket)).to.be.undefined;
    expect(room.playerMap.getPlayerByUsername('username')).to.be.undefined;
  });

  it('disconnectPlayerShouldDeactivateGameServerListeners', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    room.disconnectPlayer(mockSocket);

    expect(Object.keys(mockSocket.listeners)).to.be.empty;
  });

  it('disconnectPlayerShouldRemoveSocketButKeepPlayerByUsernameInGame', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    setRoomInGame(room, true);
    room.disconnectPlayer(mockSocket);

    expect(room.playerMap.getPlayerBySocket(mockSocket).socket).to.be.undefined;
    expect(room.playerMap.getPlayerByUsername('username')).to.deep.equal(
        new Player(undefined, 'username'));
  });

  it('disconnectPlayerShouldSetNewHostIfHostDisconnects', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    var mockSocket2 = new MockSocket('socket_id_2');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'firstHost');
    room.addPlayer(mockSocket2, 'newHost');

    room.disconnectPlayer(mockSocket);

    expect(room.hostSocket).to.not.deep.equal(mockSocket);
    expect(room.hostSocket).to.deep.equal(mockSocket2);
    expect(room.hostSocket.emissions['playerBecomeHost']).to.not.be.undefined;
    expect(room.hostSocket.emissions['playerBecomeHost']).to.have.lengthOf(1);
  });

  it('forceEndGameShouldEndGameWhileInGame', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, true);

    room.forceEndGame();

    expect(room.gameServer.serverState).to.be.undefined;
  });

  it('getLobbyDataShouldGiveExpectedResult', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    room.addPlayer(mockSocket, 'username');

    var result = room.getLobbyData(mockSocket);

    expect(result).to.deep.equal({
      players: ['username'],
      roomCode: 'test',
      isInGame: false,
      thisClientIsHost: true
    });
  });

  it('socketsEmptyShouldGiveExpectedResult', () => {
    var room = new Room('test');
    var mockSocket = new MockSocket('socket_id');
    setRoomInGame(room, false);
    var emptyBeforeAdd, emptyAfterAdd;

    emptyBeforeAdd = room.socketsEmpty();
    room.addPlayer(mockSocket, 'username');
    emptyAfterAdd = room.socketsEmpty();

    expect(emptyBeforeAdd).to.be.true;
    expect(emptyAfterAdd).to.be.false;
  });
});
