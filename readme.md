

# Term-chat
## Lightweight terminal chat server and client

Term-chat is a simple server and client npm package that allows users to send and receive messages
in the terminal.

**Perhaps the most useful feature of it is the ability to pipe in messages to quickly
send ssh-keys, tokens, urls, or whatever you need to your coding buddies and teammates.**

### Installation and Usage
```bash
npm install -g term-chat

# Server Mode
termchat --server

# Client Mode
termchat --host http://localhost
```
Run `termchat --help` for all options.

Example output (real output is colored!):
```
$ termchat -h localhost
connected to http://localhost:2797/
channel: general
users in channel: punky, alex
user connected: alex

alex: hello!
punky: hi
```

### Piping and One-off messages
Term-chat can have input piped into it or have a message as a paramter like so:
```bash
cat id_rsa.pub | termchat

# Or
termchat $(cat id_rsa.pub)
```

This way, you can easliy whip those credentials over to your inpatient colleague.

### Server Mode
To run a server, use the `--server` option. Port can be changed with `--port`

### Channels and Nickname
Term-chat has support for channels / rooms and user names.
```bash
termchat -c my_cool_channel -u my_fun_name
```

### License
Quite liberal. Go ahead, use this repository to commit atrocious crimes.
