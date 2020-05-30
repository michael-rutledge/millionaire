const HtmlElementBuilder = require('../html/HtmlElementBuilder.js');

// Socket event names to allow for dynamic activation of listeners.
//
// Each string here maps to a method within the class below.
const SOCKET_EVENTS = [
  'hostEndGameSuccess',
  'hostEndGameFailure',
  'hostStartGameSuccess',
  'hostStartGameFailure',
  'playerBecomeHost',
  'playerCreateRoomSuccess',
  'playerJoinRoomSuccess',
  'playerJoinRoomFailure',
  'playerLeaveRoomSuccess',
  'playerLeaveRoomFailure',
  'updateLobby',
];

// Encapsulates the instance of a running client of Millionaire With Friends.
//
// Only handles interactions at the room level. Is not responsible for game-related interactions.
class AppClient {

  constructor(socket, htmlDocument, htmlWindow) {
    // Assign fields
    this.socket = socket;               // Socket associated with this client
    this.htmlDocument = htmlDocument;   // document object of the html page
    this.htmlWindow = htmlWindow;       // window object of the html page

    // Assign HTML elements
    this.gameRow = this.htmlDocument.getElementById('gameRow');
    this.gameRoomHeader = this.htmlDocument.getElementById('gameRoomHeader');
    this.gameCanvas = this.htmlDocument.getElementById('gameCanvas');
    this.gameEndButton = this.htmlDocument.getElementById('gameEndButton');
    this.gameLeaveButton = this.htmlDocument.getElementById('gameLeaveButton');
    this.gameStartButton = this.htmlDocument.getElementById('gameStartButton');
    this.gameLobbyRow = this.htmlDocument.getElementById('gameLobbyRow');
    this.gameLobbyPane = this.htmlDocument.getElementById('gameLobbyPane');
    this.gameLobbyPlayerList = this.htmlDocument.getElementById('gameLobbyPlayerList');
    this.gameOptionsHost = this.htmlDocument.getElementById('gameOptionsHost');
    this.gameOptionsPlayer = this.htmlDocument.getElementById('gameOptionsPlayer');
    this.loginRow = this.htmlDocument.getElementById('loginRow');
    this.gameOptionsHostShowHostUsername =
      this.htmlDocument.getElementById('gameOptionsHostShowHostUsername');
    this.loginUsername = this.htmlDocument.getElementById('loginUsername');
    this.loginRoomCode = this.htmlDocument.getElementById('loginRoomCode');
    this.loginJoinButton = this.htmlDocument.getElementById('loginJoinButton');
    this.loginCreateButton = this.htmlDocument.getElementById('loginCreateButton');

    // Assign HTML functions
    this.gameEndButton.onclick = () => { this.hostAttemptEndGame(); }
    this.gameLeaveButton.onclick = () => { this.playerAttemptLeaveRoom(); };
    this.gameStartButton.onclick = () => { this.hostAttemptStartGame(); }
    this.loginCreateButton.onclick = () => { this.playerAttemptCreateRoom(); };
    this.loginJoinButton.onclick = () => { this.playerAttemptJoinRoom(); };

    // Assign socket listeners
    SOCKET_EVENTS.forEach((message, index) => {
      this.socket.on(message, (data) => { this[message](data) });
    });
  }


  // PRIVATE METHODS
  
  // Returns whether this client is in game.
  _isInGame() {
    return this.gameCanvas.style.display !== 'none';
  }

  // Changes display of the html page to show the login view.
  _goFromGameRoomToLogin() {
    this.loginRow.style.display = '';
    this.gameRow.style.display = 'none';
    this.gameLeaveButton.style.display = 'none';
  }

  // Changes display of the html page to show the game view.
  _goFromLoginToGameRoom() {
    this.loginRow.style.display = 'none';
    this.gameRow.style.display = '';
    this.gameLeaveButton.style.display = '';
  }

  // Sets the visibility of certain elements for the client based on whether they are host.
  _setHostVisibility(thisClientIsHost) {
    if (thisClientIsHost) {
      this.gameOptionsPlayer.style.display = 'none';
      this.gameOptionsHost.style.display = '';
      if (this._isInGame()) {
        this.gameStartButton.style.display = 'none';
        this.gameEndButton.style.display = '';
      } else {
        this.gameStartButton.style.display = '';
        this.gameEndButton.style.display = 'none';
      }
    } else {
      this.gameOptionsPlayer.style.display = '';
      this.gameOptionsHost.style.display = 'none';
      this.gameStartButton.style.display = 'none';
      this.gameEndButton.style.display = 'none';
    }
  }

  // Sets the visibility of certain elements for the client based on whether the game is in
  // progress.
  _setGameVisibility(isInGame) {
    if (isInGame) {
      this.gameCanvas.style.display = '';
      this.gameLobbyRow.style.display = 'none';
    } else {
      this.gameCanvas.style.display = 'none';
      this.gameLobbyRow.style.display = '';
    }
  }


  //  HTML METHODS

  // Attempts to end the current game from this client.
  hostAttemptEndGame() {
    this.socket.emit('hostAttemptEndGame', {});
  }

  // Attempts to start a game from this client.
  hostAttemptStartGame() {
    var showHostUsername = undefined;

    if (this.gameOptionsHostShowHostUsername.selectedIndex !== 0) {
      showHostUsername = this.gameOptionsHostShowHostUsername.value;
    }

    this.socket.emit('hostAttemptStartGame', {
      gameOptions: {
        showHostUsername: showHostUsername
      }
    });
  }

  // Attempts to create a room from this client.
  playerAttemptCreateRoom() {
    this.socket.emit('playerAttemptCreateRoom', {
      username: this.loginUsername.value
    });
  }

  // Attempts to join this client to a room.
  playerAttemptJoinRoom() {
    this.socket.emit('playerAttemptJoinRoom', {
      username: this.loginUsername.value,
      roomCode: this.loginRoomCode.value
    });
  }

  // Attempts to remove this client from its current room.
  playerAttemptLeaveRoom() {
    this.socket.emit('playerAttemptLeaveRoom', {
      username: this.loginUsername.value,
      roomCode: this.loginRoomCode.value
    });
  }


  // SOCKET LISTENERS

  // Handles a successful game end for this client.
  hostEndGameSuccess(data) {
    console.log('Game ended, thisClientIsHost: ' + data.thisClientIsHost);
    this._setGameVisibility(false);
    this._setHostVisibility(data.thisClientIsHost);
  }

  // Handles a failed game end for this client.
  hostEndGameFailure(data) {
    console.log('Game failed to end: ' + data.reason);
  }

  // Handles a successful game start for this client.
  hostStartGameSuccess(data) {
    console.log('Game started.');
    this._setGameVisibility(true);
    this._setHostVisibility(data.thisClientIsHost);
  }

  // Handles a failed game start for this client.
  hostStartGameFailure(data) {
    console.log('Game failed to start: ' + data.reason);
  }

  // Handles the player associated with this AppClient becoming host of the Room.
  playerBecomeHost(data) {
    console.log('You just became host.');
    this._setHostVisibility(true);
  }

  // Handles a successful room creation for this client.
  playerCreateRoomSuccess(data) {
    console.log('You have created the room: ' + data.roomCode);
    console.log(data);
    this._goFromLoginToGameRoom();
    this._setGameVisibility(false);
    this._setHostVisibility(true);
  }

  // Handles a successful room join for this client.
  playerJoinRoomSuccess(data) {
    console.log('You have joined the room: ' + data.roomCode);
    console.log(data);
    this._goFromLoginToGameRoom();
    this._setHostVisibility(false);
    this._setGameVisibility(data.isInGame);
  }

  // Handles a successful room join for this client.
  playerJoinRoomFailure(data) {
    console.log('Failed to join room: ' + data.reason);
  }

  // Handles a successful room leave for this client.
  playerLeaveRoomSuccess(data) {
    console.log('You have left the room.');
    this.gameEndButton.style.display = 'none';
    this.gameStartButton.style.display = 'none';
    this._setGameVisibility(false);
    this._goFromGameRoomToLogin();
  }

  // Handles a failed room leave for this client.
  playerLeaveRoomFailure(data) {
    console.log('Failed to leave room.');
    console.log(data);
  }

  // Handles any change to the lobby state.
  updateLobby(data) {
    console.log('Lobby updated.');
    console.log(data);
    this.gameRoomHeader.innerHTML = 'Room: ' + data.roomCode;
    this.gameLobbyPlayerList.innerHTML = '';
    this.gameOptionsHostShowHostUsername.innerHTML =
      new HtmlElementBuilder()
          .setTag('option')
          .setInnerHTML('None (play with AI host)')
          .toInnerHTML();

    data.players.forEach((username, index) => {
      this.gameLobbyPlayerList.innerHTML +=
        new HtmlElementBuilder()
          .setTag('div')
          .setClassList(['gameLobbyPlayerBanner'])
          .setInnerHTML(username)
          .toInnerHTML();
      this.gameOptionsHostShowHostUsername.innerHTML +=
        new HtmlElementBuilder()
          .setTag('option')
          .setInnerHTML(username)
          .toInnerHTML();
    });

    this._setHostVisibility(data.thisClientIsHost);
  }
}

module.exports = AppClient;
AppClient.SOCKET_EVENTS = SOCKET_EVENTS;
