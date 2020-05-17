// This file contains all relevant client scripting to handle the login flow.

var loginRow = document.getElementById('loginRow');
var loginUsername = document.getElementById('loginUsername');
var loginRoomCode = document.getElementById('loginRoomCode');
var loginJoinButton = document.getElementById('loginJoinButton');
var loginCreateButton = document.getElementById('loginCreateButton');

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

// Listens for 'playerCreateRoomSuccess' actions coming from the server and executes when a signal
// is found.
socket.on('playerCreateRoomSuccess', (data) => {
  console.log('You have created a room.');
  console.log(data);
});

// Listens for 'playerJoinRoomSuccess' actions coming from the server and executes when a signal is
// found.
socket.on('playerJoinRoomSuccess', (data) => {
  console.log('You have joined a room.');
  console.log(data);
});
