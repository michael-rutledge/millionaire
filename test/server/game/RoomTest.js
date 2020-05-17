const expect = require('chai').expect;

const Player = require(process.cwd() + '/server/game/Player.js');
const Room = require(process.cwd() + '/server/game/Room.js');

describe('RoomTest', () => {
  it('addUserShouldAddUserForNewUsername', () => {
    var room = new Room('test');
    var mockSocket = {
      id: 'socket_id'
    };

    var result = room.addUser(mockSocket, 'username');

    expect(result).to.be.true;
    expect(room.playerMap['socket_id']).to.deep.equal(new Player(mockSocket, 'username'));
  });

  it('addUserShouldNotAddUserForExistingUsername', () => {
    var room = new Room('test');
    var mockSocket1 = {
      id: 'socket_id_1'
    };
    var mockSocket2 = {
      id: 'socket_id_2'
    }

    room.addUser(mockSocket1, 'username');
    var result = room.addUser(mockSocket2, 'username');

    expect(result).to.be.false;
    expect(room.playerMap['socket_id_2']).to.be.undefined;
  });
});
