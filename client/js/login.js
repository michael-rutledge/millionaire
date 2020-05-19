// This file contains all relevant client scripting to handle the login flow.

var gameRow = document.getElementById('gameRow');
var gameLeaveButton = document.getElementById('gameLeaveButton');
var loginRow = document.getElementById('loginRow');
var loginUsername = document.getElementById('loginUsername');
var loginRoomCode = document.getElementById('loginRoomCode');
var loginJoinButton = document.getElementById('loginJoinButton');
var loginCreateButton = document.getElementById('loginCreateButton');

function goFromGameRoomToLogin() {
  loginRow.style.display = '';
  gameRow.style.display = 'none';
}

function goFromLoginToGameRoom() {
  loginRow.style.display = 'none';
  gameRow.style.display = '';
}

// Emits a 'playerAttemptCreateRoom' action when the "Create Room" button is pressed.
loginCreateButton.onclick = () => {
  socket.emit('playerAttemptCreateRoom', {
    username: loginUsername.value
  });
};

// Emits a 'playerAttemptJoinRoom' action when the "Join Room" button is pressed.
loginJoinButton.onclick = () => {
  socket.emit('playerAttemptJoinRoom', {
    username: loginUsername.value,
    roomCode: loginRoomCode.value
  });
};

// Emits a 'playerAttemptLeaveRoom' action when the "Leave Room" button is pressed.
gameLeaveButton.onclick = () => {
  socket.emit('playerAttemptLeaveRoom', {
    username: loginUsername.value,
    roomCode: loginRoomCode.value
  });
};

// Listens for 'playerCreateRoomSuccess' actions coming from the server and executes when a signal
// is found.
socket.on('playerCreateRoomSuccess', (data) => {
  goFromLoginToGameRoom();
  console.log('You have created the room: ' + data.roomCode);
  console.log(data);
});

// Listens for 'playerJoinRoomSuccess' actions coming from the server and executes when a signal is
// found.
socket.on('playerJoinRoomSuccess', (data) => {
  goFromLoginToGameRoom();
  console.log('You have joined the room: ' + data.roomCode);
  console.log(data);
});

// Listens for 'playerLeaveRoomSuccess' actions coming from the server and executes when a signal is
// found.
socket.on('playerLeaveRoomSuccess', (data) => {
  goFromGameRoomToLogin();
  console.log('You have left the room.');
  console.log(data);
});
