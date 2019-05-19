import * as socket from 'socket.io-client';


let io = socket();

// gets parameters from url

var url = new URL( window.location + "");
let lobbyId = url.searchParams.get('lobby');
let username = url.searchParams.get('username');

// joins lobby by data from get params

if(lobbyId && username) {

	io.emit('joinLobby', {
		lobbyId: lobbyId,
		client: {
			username: username,
		}
	})
} else {
	var url = new URL( window.location + "");
   // document.body.innerHTML = `<div class='kickedMessage--container' >${message}</div>`;
	url.pathname = 'lobby';
	(window as any).location = url;
}

// checks if user has joined

io.on('kickClient', (message?: string) => {
	var url = new URL( window.location + "");
	message = !message ? 'You were kicked from the server!' : message;
   // document.body.innerHTML = `<div class='kickedMessage--container' >${message}</div>`;
	alert(message);
	url.pathname = 'lobby';
	(window as any).location = url;
})

// displays the message from server

io.on('displayMessage', (message: string) => {
	console.log(message);
  })

// on successful join
io.on('joinedLobby', () => {
	io.emit('getGameStatus');
});

// game loop info refresh
io.on('gameStatus', (data: any) => {
	// displays lobby name
	document.getElementById('lobbyName').innerText = data.lobby.name;
	
	// displays lobby round
	document.getElementById('roundCount').innerText = data.lobby.round;

	// displays turn info
	document.getElementById('turnName').innerText = data.lobby.turn + "'s turn";

	// displays players info
	var html = "";
	data.lobby.players.map((p: any) => { html += `<span class="player">${p.username} <span class="role">${p.role}</span></span>`});
	document.getElementById('playersBox').innerHTML = html;
});


// sends information of client leaving to detach player from lobby
window.onbeforeunload = function(){
	io.emit('clientLeaving');
  };
