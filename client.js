var Url = require('url');
var chalk = require('chalk');
var socketClient = require('socket.io-client');

// console.log wrapper
var print = console.log;

// Socket Object
var _socket;

// Channel to send and listen events on
var _channel;

// User name to send with messages
var _user;

// Start client by connecting to socket and subscribing to channel events
function startClient(host, port, channel, user, message, cb) {
  //  Format the server URL
  let url = Url.parse(host);
  url.host = null;
  url.protocol = 'http:';
  url.port = port;

  // Create socket with formatted URL
  _socket = socketClient(url.format(), {
    timeout: 5000
  });

  // Set internal state
  _channel = channel;
  _user = user;

  // Connect and return with callback
  _socket.on('connect', function () {
    print(chalk.green('connected to ' + url.format()));
    print('channel: ' + chalk.bold.yellow(_channel));

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
    });
  });

  // Subscribe to server messages
  _socket.on('server_info', function (data) {
    print(
      'users in channel: ' +
      chalk.gray(data.users.join(', '))
    );
  });

  // Subscribe to general server_messages
  _socket.on('server_message', function (message) {
    print(message);
  });

  // Subscribe to channel events
  _socket.on('message_in', function (data) {
    var color;

    // Set color of user vs yourself
    if (data.user == _user) {
      color = chalk.green;
    } else {
      color = chalk.blue;
    }

    // Log output
    print(
      color.bold(data.user + ': ') +
      chalk.gray(data.message)
    );
  });

  // Display errors
  _socket.on('connect_error', function (data) {
    print(chalk.bold.red('Error connecting to server: \n' + data));
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
  startClient: startClient,
  sendMessage: sendMessage,
};
