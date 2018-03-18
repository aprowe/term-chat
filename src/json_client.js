const Url = require('url');
const socketClient = require('socket.io-client');

// Socket Object
let _socket;

// Channel to send and listen events on
let _channel;

// User name to send with messages
let _user;

let _output = {};

// Start client by connecting to socket and subscribing to channel events
function startClient(config, message) {
  //  Format the server URL
  let url = Url.parse(config.host);
  url.host = null;
  url.protocol = 'http';
  url.port = config.port;

  // Create socket with formatted URL
  _socket = socketClient(url.format(), {
    reconnection: true,
    reconnectionDelay: 2500,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 5
  });

  _output.server = url.format();
  _output.channel = config.channel;
  _output.user = config.user;

  // Set internal state
  _channel = config.channel;
  _user = config.user;

  // Connect and return with callback
  _socket.on('connect', function () {
    // If a there is a message,
    // exit early
    if (message) {
      return sendMessage(message, function () {
        process.exit();
      });
    }

    _socket.emit('user_connect', {
      channel: _channel,
      user: _user,
      historyCount: config.history,
    });
  });

  // Subscribe to server messages
  _socket.on('server_info', function (data) {
    _output.users = data.users;
    _output.messages = data.history;
    console.log(JSON.stringify(_output));
    process.exit();
  });

  // Display errors
  _socket.on('connect_error', function (data) {
    _output.error = data;
    console.log(JSON.stringify(_output));
    process.exit();
  });
}


// Send a message with callback
function sendMessage(message, callback) {
  _socket.emit('message_out', {
    user: _user,
    channel: _channel,
    message: message
  }, callback);
}

module.exports = {
  startClient: startClient
};
