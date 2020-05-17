const expect = require('chai').expect;

const RoomPool = require(process.cwd() + '/server/game/RoomPool.js');

// Returns a suitable singleton room code for testing joining rooms.
function getSingleRoomCode(roomPool) {
  if (roomPool.getNumRooms() < 1) {
    roomPool.playerAttemptCreateRoom(/*socket=*/{}, /*data=*/{ username: 'creator' });
  }
  for (const roomCode in roomPool.rooms) {
    return roomCode;
  }
}

describe('RoomPoolTest', () => {
  it('reserveNewRoomShouldGiveExpectedResult', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var newRoomCode;

    newRoomCode = roomPool.reserveNewRoom();

    expect(newRoomCode).to.not.be.empty;
  });

  it('roomExistsShouldReturnTrueForExistingRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var newRoomCode = roomPool.reserveNewRoom();
    
    expect(roomPool.roomExists(newRoomCode)).to.equal(true);
  });

  it('roomExistsShouldReturnFalseForNonExistentRoom', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var newRoomCode = roomPool.reserveNewRoom();
    var badRoomCode = newRoomCode + 'bad data';
    
    expect(roomPool.roomExists(badRoomCode)).to.equal(false);
  });

  it('playerAttemptCreateRoomShouldSucceedForValidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    roomPool.playerAttemptCreateRoom(/*socket=*/{}, /*data=*/{ username: 'foo_username' });

    expect(roomPool.getNumRooms()).to.equal(1);
  });

  it('playerAttemptCreateRoomShouldFailForInvalidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    roomPool.playerAttemptCreateRoom(/*socket=*/{}, /*data=*/undefined);

    expect(roomPool.getNumRooms()).to.equal(0);
  });

  it('playerAttemptJoinRoomShouldSucceedForValidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var roomCode = getSingleRoomCode(roomPool);

    roomPool.playerAttemptJoinRoom(/*socket*/{ id: 'socket_id' }, /*data=*/{
      username: 'joiner',
      roomCode: roomCode
    });

    expect(roomPool.rooms[roomCode].playerMap['socket_id']).to.not.be.undefined;
  });

  it('playerAttemptJoinRoomShouldFailForInvalidInput', () => {
    var roomPool = new RoomPool(/*socketIoInstance=*/{});
    var roomCode = getSingleRoomCode(roomPool);
    roomPool.playerAttemptJoinRoom(/*socket=*/{}, /*data=*/{
      username: '',
      roomCode: roomCode
    });

    expect(roomPool.rooms[roomCode].playerMap['socket_id']).to.be.undefined;
  });

});
