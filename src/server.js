var http = require('http');
var socketio = require('socket.io');
var chalk = require('chalk');

var _io;

// Max Number of history items
var MAX_HISTORY = 500;

// History of messages (Ephermal)
var _history = [];

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

// Get chat history for a channel
function getHistory(channel, count) {
  return _history.filter(function (item) {
    return item.channel === channel
  }).slice(0, count).reverse();
}

function serverMessage (msg) {
  // Show status that a user connected
  _io.to(this.channel).emit('server_message', Buffer(msg));
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
      socket.channel = data.channel;
      socket.serverMessage = serverMessage.bind(socket);
      socket.join(data.channel);

      // Give user list to clients
      socket.emit('server_info', {
        // Get all users in channel
        users: getUsers(data.channel),

        //  Give number of history items based on clients options
        history: getHistory(data.channel, data.historyCount)
      });

      // Show status that a user connected
      socket.serverMessage(
        chalk.green('user connected: ') + data.user
      );
    });

    socket.on('disconnect', function () {
      // Show status that a user disconnected
      socket.serverMessage(
        chalk.yellow('user disconnected: ') + socket.username
      );
    });

    // When a message is recieved, broadcast it to all clients
    socket.on('message_out', function (data, callback) {
      io.to(data.channel).emit('message_in', data);

      _history.unshift(data);
      if (_history.length > MAX_HISTORY) {
        _history.pop();
      }
      console.log('Message: ', data);

      // Callback if available
      typeof callback === 'function' ? callback() : null;
    });
  });

  // start server
  server.listen(port, function() {
    console.log('Listening on ' + port);
  });
}

module.exports = {
  startServer: startServer
};