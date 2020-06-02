const expect = require('chai').expect;

const AppClient = require(process.cwd() + '/client/js/game/AppClient.js');
const MockHtmlDocument = require(process.cwd() + '/client/js/test/MockHtmlDocument.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');

describe('AppClientTest', () => {
  it('constructorShouldSetSocketListeners', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});

    expect(Object.keys(mockSocket.listeners)).to.include.members(AppClient.SOCKET_EVENTS);
  });

  it('gameLeaveButtonOnClickShouldAttemptLeaveRoom', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});
    appClient.loginUsername.value = 'username';
    appClient.loginRoomCode.value = 'test';

    appClient.gameLeaveButton.onclick();

    expect(mockSocket.emissions['playerAttemptLeaveRoom']).to.have.lengthOf(1);
    expect(mockSocket.emissions['playerAttemptLeaveRoom'][0].username).to.equal(
        appClient.loginUsername.value);
    expect(mockSocket.emissions['playerAttemptLeaveRoom'][0].roomCode).to.equal(
        appClient.loginRoomCode.value);
  });

  it('gameEndButtonOnClickShouldAttemptEndGame', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});

    appClient.gameEndButton.onclick();

    expect(mockSocket.emissions['hostAttemptEndGame']).to.have.lengthOf(1);
  });


  it('gameStartButtonOnClickShouldAttemptStartGame', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});

    appClient.gameStartButton.onclick();

    expect(mockSocket.emissions['hostAttemptStartGame']).to.have.lengthOf(1);
    expect(mockSocket.emissions['hostAttemptStartGame'][0].showHostUsername).to.be.undefined;
  });

  it('loginCreateButtonOnClickShouldAttemptCreateRoom', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});
    appClient.loginUsername.value = 'username';

    appClient.loginCreateButton.onclick();

    expect(mockSocket.emissions['playerAttemptCreateRoom']).to.have.lengthOf(1);
    expect(mockSocket.emissions['playerAttemptCreateRoom'][0].username).to.equal(
        appClient.loginUsername.value);
  });

  it('loginJoinButtonOnClickShouldAttemptJoinRoom', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});
    appClient.loginUsername.value = 'username';
    appClient.loginRoomCode.value = 'test';

    appClient.loginJoinButton.onclick();

    expect(mockSocket.emissions['playerAttemptJoinRoom']).to.have.lengthOf(1);
    expect(mockSocket.emissions['playerAttemptJoinRoom'][0].username).to.equal(
        appClient.loginUsername.value);
    expect(mockSocket.emissions['playerAttemptJoinRoom'][0].roomCode).to.equal(
        appClient.loginRoomCode.value);
  });
});
