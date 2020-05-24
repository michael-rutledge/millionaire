const expect = require('chai').expect;

const MockSocket = require(process.cwd() + '/server/socket/MockSocket.js');
const RoomPool = require(process.cwd() + '/server/game/RoomPool.js');

// Returns a suitable singleton room code for testing joining rooms.
function getSingleRoomCode(roomPool) {
  if (roomPool.getNumRooms() < 1) {
    roomPool.playerAttemptCreateRoom(new MockSocket(''), /*data=*/{ username: 'creator' });
  }
  for (const roomCode in roomPool.rooms) {
    return roomCode;
  }
}

describe('RoomPoolTest', () => {
  // PUBLIC METHOD TESTS
  it('reserveNewRoomShouldGiveExpectedResult', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var newRoomCode;

    newRoomCode = roomPool.reserveNewRoom();

    expect(newRoomCode).to.not.be.empty;
  });

  it('removeRoomShouldGiveExpectedResult', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var newRoomCode = roomPool.reserveNewRoom();

    roomPool.removeRoom(newRoomCode);

    expect(roomPool.rooms).to.be.empty;
  });

  it('roomExistsShouldReturnTrueForExistingRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var newRoomCode = roomPool.reserveNewRoom();
    
    expect(roomPool.roomExists(newRoomCode)).to.be.true;
  });

  it('roomExistsShouldReturnFalseForNonExistentRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var newRoomCode = roomPool.reserveNewRoom();
    var badRoomCode = newRoomCode + 'bad data';
    
    expect(roomPool.roomExists(badRoomCode)).to.be.false;
  });

  // LISTENER TESTS
  it('hostAttemptEndGameShouldFailForNonExistentRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');

    roomPool.hostAttemptEndGame(mockSocket, /*data=*/{});

    expect(mockSocket.emissions['hostEndGameFailure']).to.have.lengthOf(1);
    expect(mockSocket.emissions['hostEndGameFailure'][0].reason).to.have.string(
        'Room does not exist');
  });

   it('hostAttemptEndGameShouldFailIfRoomFailsToEndGame', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');
    var newRoomCode = roomPool.reserveNewRoom();
    roomPool.getRoom(newRoomCode).attemptEndGame = (socket) => { return false };
    roomPool.playerAttemptJoinRoom(mockSocket, {
      username: 'username',
      roomCode: newRoomCode
    });

    roomPool.hostAttemptEndGame(mockSocket, /*data=*/{});

    expect(mockSocket.emissions['hostEndGameFailure']).to.have.lengthOf(1);
    expect(mockSocket.emissions['hostEndGameFailure'][0].reason).to.have.string(
        'room.attemptEndGame() failed');
  });

  it('hostAttemptEndGameShouldSucceedIfRoomSucceedsInStartingGame', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');
    var newRoomCode = roomPool.reserveNewRoom();
    roomPool.getRoom(newRoomCode).attemptEndGame = (socket) => { return true };
    roomPool.playerAttemptJoinRoom(mockSocket, {
      username: 'username',
      roomCode: newRoomCode
    });

    roomPool.hostAttemptEndGame(mockSocket, /*data=*/{});

    expect(mockSocket.emissions['hostEndGameSuccess']).to.have.lengthOf(1);
    expect(mockSocket.emissions['hostEndGameSuccess'][0].thisClientIsHost).to.be.true;
    expect(mockSocket.emissions['updateLobby']).to.have.lengthOf(2);
  });

  it('hostAttemptStartGameShouldFailForNonExistentRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');

    roomPool.hostAttemptStartGame(mockSocket, /*data=*/{});

    expect(mockSocket.emissions['hostStartGameFailure']).to.have.lengthOf(1);
    expect(mockSocket.emissions['hostStartGameFailure'][0].reason).to.have.string(
        'Room does not exist');
  });

   it('hostAttemptStartGameShouldFailIfRoomFailsToStartGame', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');
    var newRoomCode = roomPool.reserveNewRoom();
    roomPool.getRoom(newRoomCode).attemptStartGame = (socket, gameOptions) => { return false };
    roomPool.playerAttemptJoinRoom(mockSocket, {
      username: 'username',
      roomCode: newRoomCode
    });

    roomPool.hostAttemptStartGame(mockSocket, /*data=*/{});

    expect(mockSocket.emissions['hostStartGameFailure']).to.have.lengthOf(1);
    expect(mockSocket.emissions['hostStartGameFailure'][0].reason).to.have.string(
        'room.attemptStartGame() failed');
  });

  it('hostAttemptStartGameShouldSucceedIfRoomSucceedsInStartingGame', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');
    var newRoomCode = roomPool.reserveNewRoom();
    roomPool.getRoom(newRoomCode).attemptStartGame = (socket, gameOptions) => { return true };
    roomPool.playerAttemptJoinRoom(mockSocket, {
      username: 'username',
      roomCode: newRoomCode
    });

    roomPool.hostAttemptStartGame(mockSocket, /*data=*/{});

    expect(mockSocket.emissions['hostStartGameSuccess']).to.have.lengthOf(1);
    expect(mockSocket.emissions['hostStartGameSuccess'][0].thisClientIsHost).to.be.true;
  });

  it('playerAttemptCreateRoomShouldSucceedForValidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptCreateRoom(mockSocket, /*data=*/{ username: 'foo_username' });

    expect(roomPool.getNumRooms()).to.equal(1);
    expect(mockSocket.emissions['playerCreateRoomSuccess']).to.have.lengthOf(1);
    expect(mockSocket.emissions['updateLobby']).to.have.lengthOf(1);
  });

  it('playerAttemptCreateRoomShouldFailForInvalidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptCreateRoom(mockSocket, /*data=*/undefined);

    expect(roomPool.getNumRooms()).to.equal(0);
    expect(mockSocket.emissions['playerCreateRoomFailure']).to.have.lengthOf(1);
  });

  it('playerAttemptJoinRoomShouldSucceedForValidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var roomCode = getSingleRoomCode(roomPool);
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptJoinRoom(mockSocket, /*data=*/{
      username: 'joiner',
      roomCode: roomCode
    });

    expect(mockSocket.emissions['playerJoinRoomSuccess']).to.have.lengthOf(1);
    expect(mockSocket.emissions['updateLobby']).to.have.lengthOf(1);
  });

  it('playerAttemptJoinRoomShouldFailForInvalidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var roomCode = getSingleRoomCode(roomPool);
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptJoinRoom(mockSocket, /*data=*/{
      username: '',
      roomCode: roomCode
    });

    expect(mockSocket.emissions['playerJoinRoomFailure']).to.have.lengthOf(1);
  });

  it('playerAttemptJoinRoomShouldFailForNonExistentRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptJoinRoom(mockSocket, /*data=*/{
      username: 'username',
      roomCode: 'bad_room'
    });

    expect(mockSocket.emissions['playerJoinRoomFailure']).to.have.lengthOf(1);
    expect(mockSocket.emissions['playerJoinRoomFailure'][0].reason).to.have.string(
        'Room code does not exist');
  });

  it('playerAttemptLeaveRoomShouldSucceedForValidSocket', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var roomCode = roomPool.reserveNewRoom();
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptJoinRoom(mockSocket, /*data=*/{
      username: 'username',
      roomCode: roomCode
    });
    roomPool.playerAttemptLeaveRoom(mockSocket, {});

    expect(mockSocket.emissions['playerLeaveRoomSuccess']).to.have.lengthOf(1);
    expect(mockSocket.emissions['updateLobby']).to.have.lengthOf(1);
  });

  it('playerAttemptLeaveRoomShouldRemoveRoomForLastPlayer', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var roomCode = roomPool.reserveNewRoom();
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptJoinRoom(mockSocket, /*data=*/{
      username: 'username',
      roomCode: roomCode
    });
    roomPool.playerAttemptLeaveRoom(mockSocket, {});

    expect(roomPool.rooms).to.be.empty;
  });

  it('playerAttemptLeaveRoomShouldFailForNonExistentRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var roomCode = roomPool.reserveNewRoom();
    var mockSocket = new MockSocket('socket_id');

    roomPool.playerAttemptJoinRoom(mockSocket, /*data=*/{
      username: 'username',
      roomCode: roomCode
    });
    mockSocket.rooms.room = 'bad_room';
    roomPool.playerAttemptLeaveRoom(mockSocket, {});

    expect(mockSocket.emissions['playerLeaveRoomFailure']).to.have.lengthOf(1);
    expect(mockSocket.emissions['playerLeaveRoomFailure'][0].reason).to.have.string(
        'Room does not exist');
  });
});
