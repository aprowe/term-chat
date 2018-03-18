const Url = require('url');
const chalk = require('chalk');
const socketClient = require('socket.io-client');

// console.log wrapper
const print = console.log;

// Socket Object
let _socket;

// Channel to send and listen events on
let _channel;

// User name to send with messages
let _user;

// Start client by connecting to socket and subscribing to channel events
function startClient(config, message) {
  //  Format the server URL
  if (config.host.match('://')) {
    config.host = config.host.replace(/^.*\:\/\//, '');
  }

  config.host = 'http://' + config.host;

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
    print(chalk.red('Connecting ' + data));
  });

  _socket.on('reconnecting', function () {
    print(chalk.yellow('Attempting to reconnect..'));
  });

  // After reconnect attempts
  _socket.on('reconnect_failed', function () {
    print(chalk.bold.red('Could not connect to server'));
    process.exit();
  });
}

/**
 * Prints a message from a message object
 * @param  {object} data  {user, message, channel}
 */
function printMessage (data) {
  let color;

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
