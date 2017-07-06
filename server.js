var http = require('http');
var socketio = require('socket.io');

var _io;

// Gets a list of users in a channel
function getUsers(channel) {
  // get all clients in room
  var clients = _io.sockets.adapter.rooms[channel].sockets;

  // Get list of connected users
  var connectedUsers = [];
  for (var clientId in clients ) {
    //this is the socket of each client in the room.
    var clientSocket = _io.sockets.connected[clientId];
    connectedUsers.push(clientSocket.username);
  }

  return connectedUsers;
}

function startServer (port) {
  var server = http.Server();
  var io = socketio(server);

  // Set internal variable
  _io = io;

  io.on('connection', function (socket) {
    socket.on('user_connect', function (data) {
      console.log(data.user + ' Connected');

      // Attach user name to socket and join channel
      socket.username = data.user;
      socket.join(data.channel);

      // Give user list to clients
      socket.emit('server_info', {
        users: getUsers(data.channel)
      });
    });

    // When a message is recieved, broadcast it to all clients
    socket.on('message_out', function (data, callback) {
      io.to(data.channel).emit('message_in', data);
      console.log('Message: ', data);

      // Callback if available
      typeof callback === 'function' ? callback() : null;
    });
  });

  // start server
  server.listen(3000, function() {
    console.log('Listening on ' + port);
  });
}

module.exports = {
  startServer: startServer
};
