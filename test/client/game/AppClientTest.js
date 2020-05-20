const expect = require('chai').expect;

const AppClient = require(process.cwd() + '/client/js/game/AppClient.js');
const MockHtmlDocument = require(process.cwd() + '/client/js/test/MockHtmlDocument.js');
const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');

describe('AppClientTest', () => {
  it('gameLeaveButtonOnClickShouldAttemptLeaveRoom', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});
    appClient.loginUsername.value = 'username';
    appClient.loginRoomCode.value = 'test';

    appClient.gameLeaveButton.onclick();

    expect(mockSocket.emissions['playerAttemptLeaveRoom']).to.not.be.undefined;
    expect(mockSocket.emissions['playerAttemptLeaveRoom']).to.have.lengthOf(1);
    expect(mockSocket.emissions['playerAttemptLeaveRoom'][0].username).to.equal(
        appClient.loginUsername.value);
    expect(mockSocket.emissions['playerAttemptLeaveRoom'][0].roomCode).to.equal(
        appClient.loginRoomCode.value);
  });

  it('loginCreateButtonOnClickShouldAttemptCreateRoom', () => {
    var mockSocket = new MockSocket('socket_id');
    var mockHtmlDocument = new MockHtmlDocument();
    var appClient = new AppClient(mockSocket, mockHtmlDocument, /*window=*/{});
    appClient.loginUsername.value = 'username';

    appClient.loginCreateButton.onclick();

    expect(mockSocket.emissions['playerAttemptCreateRoom']).to.not.be.undefined;
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

    expect(mockSocket.emissions['playerAttemptJoinRoom']).to.not.be.undefined;
    expect(mockSocket.emissions['playerAttemptJoinRoom']).to.have.lengthOf(1);
    expect(mockSocket.emissions['playerAttemptJoinRoom'][0].username).to.equal(
        appClient.loginUsername.value);
    expect(mockSocket.emissions['playerAttemptJoinRoom'][0].roomCode).to.equal(
        appClient.loginRoomCode.value);
  });
});
