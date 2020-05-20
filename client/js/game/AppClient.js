// Encapsulates the instance of a running client of Millionaire With Friends.
class AppClient {

  constructor(socket, htmlDocument, htmlWindow) {
    // Assign fields
    this.socket = socket;               // Socket associated with this client
    this.htmlDocument = htmlDocument;   // document object of the html page
    this.htmlWindow = htmlWindow;       // window object of the html page

    // Assign HTML elements
    this.gameRow = this.htmlDocument.getElementById('gameRow');
    this.gameLeaveButton = this.htmlDocument.getElementById('gameLeaveButton');
    this.loginRow = this.htmlDocument.getElementById('loginRow');
    this.loginUsername = this.htmlDocument.getElementById('loginUsername');
    this.loginRoomCode = this.htmlDocument.getElementById('loginRoomCode');
    this.loginJoinButton = this.htmlDocument.getElementById('loginJoinButton');
    this.loginCreateButton = this.htmlDocument.getElementById('loginCreateButton');

    // Assign HTML functions
    this.gameLeaveButton.onclick = () => { this.playerAttemptLeaveRoom(); };
    this.loginCreateButton.onclick = () => { this.playerAttemptCreateRoom() };
    this.loginJoinButton.onclick = () => { this.playerAttemptJoinRoom(); };

    // Assign socket listeners
    this.socket.on('playerCreateRoomSuccess', (data) => {
      this.onPlayerCreateRoomSuccess(data);
    });
    this.socket.on('playerJoinRoomSuccess', (data) => {
      this.onPlayerJoinRoomSuccess(data);
    });
    this.socket.on('playerLeaveRoomSuccess', (data) => {
      this.onPlayerLeaveRoomSuccess(data);
    });
  }


  // PRIVATE FUNCTIONS
  
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


  //  HTML FUNCTIONS

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

  // Handles a successful room leave for this client.
  onPlayerLeaveRoomSuccess(data) {
    console.log('You have left the room.');
    this._goFromGameRoomToLogin();
  }
}

module.exports = AppClient;
