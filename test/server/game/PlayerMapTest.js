const expect = require('chai').expect;

const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

describe('PlayerMapTest', () => {
  it('containsSocketShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var presentSocket = new MockSocket('socket_id_present');
    var absentSocket = new MockSocket('socket_id_absent');
    playerMap.putPlayer(new Player(presentSocket, 'username'));

    var presentResult = playerMap.containsSocket(presentSocket);
    var absentResult = playerMap.containsSocket(absentSocket);

    expect(presentResult).to.be.true;
    expect(absentResult).to.be.false;
  });

  it('containsUsernameShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var presentUsername = 'present';
    var absentUsername = 'absent';
    playerMap.putPlayer(new Player(new MockSocket('socket_id'), presentUsername));

    var presentResult = playerMap.containsUsername(presentUsername);
    var absentResult = playerMap.containsUsername(absentUsername);

    expect(presentResult).to.be.true;
    expect(absentResult).to.be.false;
  });

  it('emitToAllShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var player1 = new Player(new MockSocket('socket_id_1'), 'player1');
    var player2 = new Player(new MockSocket('socket_id_2'), 'player2');
    playerMap.putPlayer(player1);
    playerMap.putPlayer(player2);

    playerMap.emitToAll('someMessage', { message: 'message' });

    expect(player1.socket.emissions['someMessage']).to.have.lengthOf(1);
    expect(player1.socket.emissions['someMessage'][0].message).to.equal('message');
    expect(player2.socket.emissions['someMessage']).to.have.lengthOf(1);
    expect(player2.socket.emissions['someMessage'][0].message).to.equal('message');
  });

  it('getActivePlayerListAndCountShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var activePlayer = new Player(new MockSocket('socket_id'), 'active');
    var inactivePlayer = new Player(/*socket=*/undefined, 'inactive');
    playerMap.putPlayer(activePlayer);
    playerMap.putPlayer(inactivePlayer);

    expect(playerMap.getActivePlayerList()).to.deep.equal([activePlayer]);
    expect(playerMap.getActivePlayerCount()).to.equal(1);
  });

  it('getPlayerBySocketShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    playerMap.putPlayer(player);

    expect(playerMap.getPlayerBySocket(mockSocket)).to.deep.equal(player);
  });

  it('getPlayerByUsernameShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var player = new Player(new MockSocket('socket_id'), 'username');
    playerMap.putPlayer(player);

    expect(playerMap.getPlayerByUsername('username')).to.deep.equal(player);
  });

  it('getPlayerListAndCountShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var activePlayer = new Player(new MockSocket('socket_id'), 'active');
    var inactivePlayer = new Player(/*socket=*/undefined, 'inactive');
    playerMap.putPlayer(activePlayer);
    playerMap.putPlayer(inactivePlayer);

    expect(playerMap.getPlayerList()).to.deep.equal([activePlayer, inactivePlayer]);
    expect(playerMap.getPlayerCount()).to.equal(2);
  });

  it('getUsernameBySocketShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    playerMap.putPlayer(player);

    expect(playerMap.getUsernameBySocket(mockSocket)).to.equal('username');
  });

  it('isUsernameActiveShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var activePlayer = new Player(new MockSocket('socket_id'), 'active');
    var inactivePlayer = new Player(/*socket=*/undefined, 'inactive');
    playerMap.putPlayer(activePlayer);
    playerMap.putPlayer(inactivePlayer);

    expect(playerMap.isUsernameActive('active')).to.be.true;
    expect(playerMap.isUsernameActive('inactive')).to.be.false;
  });

  it('removeInactivePlayersShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var activePlayer = new Player(new MockSocket('socket_id'), 'active');
    var inactivePlayer = new Player(/*socket=*/undefined, 'inactive');
    playerMap.putPlayer(activePlayer);
    playerMap.putPlayer(inactivePlayer);

    playerMap.removeInactivePlayers();

    expect(playerMap.getPlayerCount()).to.equal(1);
    expect(playerMap.getPlayerByUsername('active')).to.not.be.undefined;
  });

  it('removePlayerByUsernameShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    playerMap.putPlayer(player);

    playerMap.removePlayerByUsername('username');

    expect(playerMap.getPlayerByUsername('username')).to.be.undefined;
  });

  it('removePlayerSocketShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var mockSocket = new MockSocket('socket_id');
    var player = new Player(mockSocket, 'username');
    playerMap.putPlayer(player);

    playerMap.removePlayerSocket('username');

    expect(playerMap.getPlayerByUsername('username')).to.not.be.undefined;
    expect(playerMap.getPlayerByUsername('username').socket).to.be.undefined;
  });

  it('updatePlayerSocketShouldGiveExpectedResult', () => {
    var playerMap = new PlayerMap();
    var mockSocket = new MockSocket('socket_id');
    var mockSocket2 = new MockSocket('socket_id_2');
    var player = new Player(mockSocket, 'username');
    playerMap.putPlayer(player);

    playerMap.updatePlayerSocket('username', mockSocket2);

    expect(playerMap.getPlayerByUsername('username')).to.not.be.undefined;
    expect(playerMap.getPlayerByUsername('username').socket).to.deep.equal(mockSocket2);
  });
});