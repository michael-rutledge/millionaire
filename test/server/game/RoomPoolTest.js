const expect = require('chai').expect;

const RoomPool = require(process.cwd() + '/server/game/RoomPool.js');

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
});
