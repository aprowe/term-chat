

# Term-chat
## Lightweight terminal chat server and client

Term-chat is a simple server and client npm package that allows users to send and receive messages
in the terminal. It can be opened as an interactive chat client, or used as a command to send a single message.

**Perhaps the most useful feature is the ability to pipe in messages to quickly
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

### Default Server
While this project remains small, I am running a default server at `http://alexrowe.net`. 
Just run `termchat` to connect! (Don't post any sensitive information...)

### Example Output
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

### JSON Client
If you want to display recent messages in some other app, you can try 
```curl http://<my-server>:2797/json/<channel_name>/<message_count>``` 
and it will return a json structure of recent messages.

### License
Quite liberal. Go ahead, use this repository to commit atrocious crimes.
