# Network learning game
Using webpack, typescript, socket.io, express, hot reload, node.js, and tsloader!

## instalation

run 'npm install' in both server and client directory

## usage
run command 'npm start' in both server and client directory to start hot reload and auto compile and node server

### current progress
Created basic backbone for server - client communication.
User can join/create lobby which attaches clients on joining and unmounts them on leaving.
Lobby has maximum players and if remains empty for duration of time its deleted.
Lobby data for example turn,round,players are synchronized in real time with all players in lobby.

### future
- Add synchronisation of player data with rendering on client side.
- Add ability to perform action when it's players turn.
- Render messages from server on client (message, kick), add loading screen.
- Ability to process action on server and send response to coresponding player.
- Add objective to each player and check if is cobjective completed.
- Greatly improve interface.
- Add ability to pause game.
- Add certificate server into game.
