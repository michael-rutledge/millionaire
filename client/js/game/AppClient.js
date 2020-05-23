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
    this.gameCanvas = this.htmlDocument.getElementById('gameCanvas');
    this.gameEndButton = this.htmlDocument.getElementById('gameEndButton');
    this.gameLeaveButton = this.htmlDocument.getElementById('gameLeaveButton');
    this.gameStartButton = this.htmlDocument.getElementById('gameStartButton');
    this.loginRow = this.htmlDocument.getElementById('loginRow');
    this.loginUsername = this.htmlDocument.getElementById('loginUsername');
    this.loginRoomCode = this.htmlDocument.getElementById('loginRoomCode');
    this.loginJoinButton = this.htmlDocument.getElementById('loginJoinButton');
    this.loginCreateButton = this.htmlDocument.getElementById('loginCreateButton');

    // Assign HTML functions
    this.gameEndButton.onclick = () => { this.hostAttemptEndGame(); }
    this.gameLeaveButton.onclick = () => { this.playerAttemptLeaveRoom(); };
    this.gameStartButton.onclick = () => { this.hostAttemptStartGame(); }
    this.loginCreateButton.onclick = () => { this.playerAttemptCreateRoom() };
    this.loginJoinButton.onclick = () => { this.playerAttemptJoinRoom(); };

    // Assign socket listeners
    this.socket.on('hostEndGameSuccess', (data) => {
      this.onHostEndGameSuccess(data);
    });
    this.socket.on('hostEndGameFailure', (data) => {
      this.onHostEndGameFailure(data);
    });
    this.socket.on('hostStartGameSuccess', (data) => {
      this.onHostStartGameSuccess(data);
    });
    this.socket.on('hostStartGameFailure', (data) => {
      this.onHostStartGameFailure(data);
    });
    this.socket.on('playerBecomeHost', (data) => {
      this.onPlayerBecomeHost(data);
    });
    this.socket.on('playerCreateRoomSuccess', (data) => {
      this.onPlayerCreateRoomSuccess(data);
    });
    this.socket.on('playerJoinRoomSuccess', (data) => {
      this.onPlayerJoinRoomSuccess(data);
    });
    this.socket.on('playerJoinRoomFailure', (data) => {
      this.onPlayerJoinRoomFailure(data);
    });
    this.socket.on('playerLeaveRoomSuccess', (data) => {
      this.onPlayerLeaveRoomSuccess(data);
    });
    this.socket.on('playerLeaveRoomFailure', (data) => {
      this.onPlayerLeaveRoomFailure(data);
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
  }

  // Changes display of the html page to show the game view.
  _goFromLoginToGameRoom() {
    this.loginRow.style.display = 'none';
    this.gameRow.style.display = '';
  }


  //  HTML METHODS

  // Attempts to end the current game from this client.
  hostAttemptEndGame() {
    this.socket.emit('hostAttemptEndGame', {});
  }

  // Attempts to start a game from this client.
  hostAttemptStartGame() {
    // TODO: get actual options in here
    this.socket.emit('hostAttemptStartGame', {
      gameOptions: {
        showHostUsername: undefined
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
  onHostEndGameSuccess(data) {
    console.log('Game ended, thisClientIsHost: ' + data.thisClientIsHost);
    this.gameCanvas.style.display = 'none';
    this.gameEndButton.style.display = 'none';

    if (data.thisClientIsHost) {
      this.gameStartButton.style.display = '';
    }
  }

  // Handles a failed game end for this client.
  onHostEndGameFailure(data) {
    console.log('Game failed to end: ' + data.reason);
  }

  // Handles a successful game start for this client.
  onHostStartGameSuccess(data) {
    console.log('Game started.');
    this.gameCanvas.style.display = '';
    this.gameStartButton.style.display = 'none';

    if (data.thisClientIsHost) {
      this.gameEndButton.style.display = '';
    }
  }

  // Handles a failed game start for this client.
  onHostStartGameFailure(data) {
    console.log('Game failed to start: ' + data.reason);
  }

  // Handles the player associated with this AppClient becoming host of the Room.
  onPlayerBecomeHost(data) {
    console.log('You just became host.');
    console.log('We in game: ' + this._isInGame());
    if (this._isInGame()) {
      this.gameEndButton.style.display = '';
    } else {
      this.gameStartButton.style.display = '';
    }
  }

  // Handles a successful room creation for this client.
  onPlayerCreateRoomSuccess(data) {
    console.log('You have created the room: ' + data.roomCode);
    console.log(data);
    this._goFromLoginToGameRoom();
  }

  // Handles a successful room join for this client.
  onPlayerJoinRoomSuccess(data) {
    console.log('You have joined the room: ' + data.roomCode);
    console.log(data);
    this._goFromLoginToGameRoom();
  }

  // Handles a successful room join for this client.
  onPlayerJoinRoomFailure(data) {
    console.log('Failed to join room: ' + data.reason);
  }

  // Handles a successful room leave for this client.
  onPlayerLeaveRoomSuccess(data) {
    console.log('You have left the room.');
    this.gameCanvas.style.display = 'none';
    this.gameStartButton.style.display = 'none';
    this.gameEndButton.style.display = 'none';
    this._goFromGameRoomToLogin();
  }

  // Handles a failed room leave for this client.
  onPlayerLeaveRoomFailure(data) {
    console.log('Failed to leave room.');
    console.log(data);
  }
}

module.exports = AppClient;
