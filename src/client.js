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
function startClient(config, message) {
  //  Format the server URL
  var url = Url.parse(config.host);
  url.host = null;
  url.protocol = 'http';
  url.port = config.port;

  // Create socket with formatted URL
  _socket = socketClient(url.format());

  // Set internal state
  _channel = config.channel;
  _user = config.user;

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
      historyCount: config.history,
    });
  });

  // Subscribe to server messages
  _socket.on('server_info', function (data) {
    print(
      'users in channel: ' +
      chalk.yellow(data.users.join(', '))
    );

    // Print all historic messages
    data.history.forEach(printMessage);
  });

  // Subscribe to general server_messages
  _socket.on('server_message', function (buffer) {
    print(buffer.toString());
  });

  // Subscribe to channel events
  _socket.on('message_in', printMessage);

  // Display errors
  _socket.on('connect_error', function (data) {
    print(chalk.bold.red('Error connecting to server: \n' + data));
  });
}

/**
 * Prints a message from a message object
 * @param  {object} data  {user, message, channel}
 */
function printMessage (data) {
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
    chalk.white(data.message)
  );
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
