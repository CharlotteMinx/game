# Asymetra - Network learning game
Using webpack, typescript, socket.io, express, hot reload, node.js, and tsloader!

## instalation

run 'npm install' in both server and client directory

## usage
run command 'npm start' in both server and client directory to start hot reload and auto compile and node server


### current progress
- Created basic backbone for server - client communication.
- User can join/create lobby which attaches clients on joining and unmounts them on leaving.
- Lobby has maximum players and if remains empty for duration of time its deleted.
- Lobby data for example turn,round,players are synchronized in real time with all players in lobby.
- Added synchronisation of player data with rendering on client side.
- Added ability to send message when it's players turn.
- Added chat between players.

### future

- Render messages from server on client (message, kick), add loading screen.
- Add objective to each player and check if is cobjective completed.
- Greatly improve interface.
- Add ability to pause game.
- Add certificate server into game.
- Add ability to reconnect back to the game and use same player instance.
- After drag and droping any item sync inventory and message attachments with actual server data after drag and drop (removes possibility of desync)
- Introduce hardcore mode to the game which will use IP addresses instead of names and will take more realistic aproach. 
- Add ability to reset round after one of players win.

### CZ

Asymetra je výuková hra, která má pomoci studentům počítačových síti pochopit princip šifrování a útoku man-in-the-middle vizuální formou.

Cílová skupina jsou především studenti počítačových sítí ale i široká veřejnost. Předpokládáme že žáci budou znát pojmi jako IP adresa, šifrování, počítčová síť, internet a budou znát princip posílání paketů po počítačové síti. 

Projekt se dělí na 2 části, klientská část a serverová část. Při návhru hry jsme usoudili že pro nás bude nejjednodušší zrealizovat hru formou webové aplikace a tudíž jsme jako programovací jazyk zvolili Javascript. Webová aplikace se jeví jako ideální řešení hlavně kvůli lehké a rychlé vizualizace dat a rychlému a snadnému vývoji uživatelského prostředí. Bohužel webová aplikace se sebou přináší nevýhody a to hlavně v bezpečnosti klientské části. Javascript na klientské části se spouští ve webovém prohlížečí a je dostupný koncovýmu uživateli což by se velice lehce dalo zneužít pro podvádění nebo odesílání škodlivých dat na server. Danou skutečnost jsme si uvědomili a řešíme její problematiku v serverové části, hlavně ověřováním dat které od klienta přicházejí.



