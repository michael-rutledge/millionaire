// This file contains all relevant client scripting to handle the login flow.

var loginRow = document.getElementById('loginRow');
var loginUsername = document.getElementById('loginUsername');
var loginRoomCode = document.getElementById('loginRoomCode');
var loginJoinButton = document.getElementById('loginJoinButton');
var loginCreateButton = document.getElementById('loginCreateButton');

// Emits a 'userAttemptCreateRoom' action when the "Create Room" button is pressed.
loginCreateButton.onclick = () => {
  socket.emit('userAttemptCreateRoom', {
    username: loginUsername.value
  });
};

// Emits a 'userAttemptJoinRoom' action when the "Join Room" button is pressed.
loginJoinButton.onclick = () => {
  socket.emit('userAttemptJoinRoom', {
    username: loginUsername.value,
    roomCode: loginRoomCode.value
  });
};

// Listens for 'userCreateRoomSuccess' actions coming from the server and executes when signal
// found.
socket.on('userCreateRoomSuccess', (data) => {
  console.log('You have created a room.');
  console.log(data);
});

// Listens for 'userJoinRoomSuccess' actions coming from the server and executes when signal found.
socket.on('userJoinRoomSuccess', (data) => {
  console.log('You are in a room.');
  console.log(data);
});
