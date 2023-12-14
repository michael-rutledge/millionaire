const express = require('express');
const app = express();
const serv = require('http').Server(app);
const sio = require('socket.io')(serv, {});

const Logger = require(process.cwd() + '/server/logging/Logger.js');
const RoomPool = require(process.cwd() + '/server/game/RoomPool.js');

// START SERVER
//
// This app will run on port 3000 using index.html as its homepage. Direct access to client
// content is also supported.
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(process.env.PORT);
Logger.logInfo('Server started.');
var roomPool = new RoomPool(sio);
