const readline = require('readline');

const server = require('./src/server');
const client = require('./src/client');
const jsonClient = require('./src/json_client');
const grabClient = require('./src/grab_client');

// Set up argumnets
const argv = require('yargs')
  .usage('Usage: termchat [options] [message] \n \
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

  .boolean('json')
  .alias('j', 'json')
  .describe('j', 'Output server state in JSON and exit')

  .boolean('background')
  .alias('b', 'background')
  .describe('b', 'Backround mode, do not expect any stdin')

  .default('history', 5)
  .alias('i', 'history')
  .describe('i', 'Number of previous messages to show on login')

  .default('grab', 0)
  .alias('g', 'grab')
  .describe('g', 'Grab Last message')

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
let message = argv._.join(' ');

// Readline Variable
let readLine;

// If server is set, start server
if (argv.server) {
  server.startServer(argv.port);

} else if (argv.json){
  jsonClient.startClient(argv, message);

} else if (argv.grab){
  grabClient.startClient(argv);

  // Otherwise, start the client socket
} else {
  if (!argv.background) {
    startReadline();
  }
  client.startClient(argv, message);
}

// Set up read line
function startReadline (client) {
  readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  let message = '';

  readLine.on('line', function(line){
    // we are only interested in non-empty lines
    if (!line) return;

    // Move cursor up one line and clear line
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine();

    // If Start of message, make a multi long message
    if (!message) {
      setTimeout(function (){
        client.sendMessage(message);
        message = '';
      }, 4);
    }

    message += line;
  });

}
