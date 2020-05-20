// Encapsulates a mock Socket object that can be used to test Socket behavior during unit tests.
class MockSocket {

  constructor(id) {
    this.id = id;         // Id to be used in place of a real socket id
    this.joinedRoomCode;  // Room code that the MockSocket has "joined"
    this.emissions = {};  // Map of messages to arrays of data objects for each emission
    this.listens = {};    // Map of messages to callback functions
    this.rooms = {};      // Rooms map which replicates real socket in room code storage
  }

  // Mocks a socket emission and keeps track of the data emitted.
  emit(message, data) {
    if (this.emissions.hasOwnProperty(message)) {
      this.emissions[message].push(data);
    } else {
      this.emissions[message] = [data];
    }
  }

  // Mocks the socket joining a room and calls the callback as expected.
  join(roomCode, callback) {
    this.joinedRoomCode = roomCode;
    this.rooms = {
      uselessField: 0,
      room: roomCode
    };
    callback();
  }

  // Mocks the socket adding a listener for a certain message.
  on(message, callback) {
    this.listens[message] = callback;
  }

  // Mocks the socket leaving its room.
  leave(roomCode, callback) {
    this.joinedRoomCode = undefined;
    this.rooms = {};
    callback();
  }
}

module.exports = MockSocket;
