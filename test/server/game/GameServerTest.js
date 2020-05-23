const expect = require('chai').expect;

const GameServer = require(process.cwd() + '/server/game/GameServer.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const Player = require(process.cwd() + '/server/game/Player.js');
const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

describe('GameServerTest', () => {
  it('activateListenersForSocketShouldGiveExpectedResult', () => {
    var gameServer = new GameServer(new PlayerMap());
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'username');
    gameServer.playerMap.putPlayer(player);

    gameServer.activateListenersForSocket(socket);

    expect(Object.keys(socket.listeners)).to.deep.equal(GameServer.SOCKET_EVENTS);
  });

  it('deactivateListenersForSocketShouldGiveExpectedResult', () => {
    var gameServer = new GameServer(new PlayerMap());
    var socket = new MockSocket('socket_id');
    var player = new Player(socket, 'username');
    gameServer.playerMap.putPlayer(player);
    gameServer.activateListenersForSocket(socket);

    gameServer.deactivateListenersForSocket(socket);

    expect(Object.keys(socket.listeners)).to.be.empty;
  });

  it('startGameShouldGiveExpectedResult', () => {
    var gameServer = new GameServer(new PlayerMap());

    gameServer.startGame(/*gameOptions=*/{});

    expect(gameServer.serverState).to.not.be.undefined;
  });
});