const http = require('http');
const socketio = require('socket.io');
const chalk = require('chalk');

let _io;

// Max Number of history items
let MAX_HISTORY = 500;

// History of messages (Ephermal)
let _history = [];

// Gets a list of users in a channel
function getUsers(channel) {
  // get all clients in room
  let room = _io.sockets.adapter.rooms[channel]

  if (!room) {
    return [];
  }

  // Get list of connected users
  let connectedUsers = [];
  for (let clientId in room.sockets) {
    //this is the socket of each client in the room.
    let clientSocket = _io.sockets.connected[clientId];
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

function serverMessage (socket, msg) {
  if (!socket.channel) {
    return;
  }
  // Show status that a user connected
  _io.to(socket.channel).emit('server_message', Buffer(msg));
}

function startServer (port) {
  let server = http.Server();
  let io = socketio(server);

  // Set internal variable
  _io = io;

  io.on('connection', function (socket) {
    socket.on('user_connect', function (data) {
      console.log(data.user + ' Connected');

      // Attach user name to socket and join channel
      socket.username = data.user;
      socket.channel = data.channel;
      socket.join(data.channel);

      // Give user list to clients
      socket.emit('server_info', {
        // Get all users in channel
        users: getUsers(data.channel),

        //  Give number of history items based on clients options
        history: getHistory(data.channel, data.historyCount)
      });

      // Show status that a user connected
      serverMessage(socket,
        chalk.green('user connected: ') + data.user
      );
    });

    socket.on('disconnect', function () {
      // Show status that a user disconnected
      serverMessage(socket,
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


  // Handle 'API' requests
  server.on('request', (request, response) => {
    let path = request.url.split('/');

    // Filter out
    if (path[1] == 'json') {
      return handleJsonRequest(request, response);
    }

  });
}

// Send JSON status for API calls
// server.com/json/channel/messageCount
function handleJsonRequest(req, res) {
  let params = req.url.split('/');

  // Set the channel
  let channel = params[2] || 'general';

  // Set the count of messages
  let count = params[3] || 10;

  // Create output object
  let output = {
    users: getUsers(channel),
    messages: getHistory(channel, count),
    channel: channel,
    count: count
  };

  // Send reponse
  res.end(JSON.stringify(output));
}

module.exports = {
  startServer: startServer
};
