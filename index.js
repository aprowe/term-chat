var readline = require('readline');

var server = require('./server');
var client = require('./client');

// Set up argumnets
const argv = require('yargs')
  .usage('Usage: nchat [options] [message] \n \
Lightweight CLI chat client and server. If message is included, the process \
will send the message and immediately exit. If omitted, the process will stay open \
in interactive mode.')

  .boolean('server')
  .alias('s', 'server')
  .describe('s', 'Run the chat server for clients to join')

  .default('port', 2797)
  .alias('p', 'port')
  .describe('p', 'Port to connect to on server')

  .default('channel', 'general')
  .alias('c', 'channel')
  .describe('c', 'Channel (room) to connect to join')

  .default('host', 'http://alexrowe.net')
  .alias('h', 'host')
  .describe('h', 'Hostname of server')

  .default('user', process.env.USER || 'anonymous')
  .alias('u', 'user')
  .describe('u', 'Your nickname in server chat')

  .boolean('version')
  .describe('version', 'Display Version')

  .help()
  .argv

// Show version of package
if (argv.version) {
  console.log(require('./package.json').version);
  process.exit();
}

// One-off message to send to server
var message = argv._.join(' ');

// Readline Variable
var readLine;

// Read Input from stdin (i.e. piping in)
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    message = chunk;
  }
});


// If server is set, start server
if (argv.server) {
  server.startServer(argv.port);

// Otherwise, start the client socket
} else {
  startReadline();

  client.startClient(argv.host, argv.port, argv.channel, argv.user, function () {
    if (message) {
      sendMessageAndExit(message);
    }
  });
}

// Send message to server
function sendMessageAndExit (message) {
  client.sendMessage(message, function () {
    process.exit();
  });
}

// Set up read line
function startReadline () {
  readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  readLine.on('line', function(line){
    // we are only interested in non-empty lines
    if (!line) return;

    // Move cursor up one line and clear line
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine();
    client.sendMessage(line);
  });
}
