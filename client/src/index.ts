import * as socket from 'socket.io-client';
import * as $ from 'jquery';
let io = socket();

// prevents client side injection
$.valHooks.textarea = {
get: function( elem: any ) {
	return elem.value.replace( /\r?\n/g, "\r\n" );
}
};

$.valHooks.input = {
get: function( elem: any ) {
	return elem.value.replace( /\r?\n/g, "\r\n" );
}
};



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

	// removes turn class from app

	$('#app').removeClass('onTurn');

	// asks for player data
	io.emit('requestPlayerData');
});


// updated and displays player data
io.on('updatePlayerData', (data: any) => {

	//displays objective
	$('#objective').html(data.objective);

	// displays role info
	$('#role').html(data.role);

	// changes turn to yours
	if(data.isOnTurn) {
		$('#turnName').html('Yours turn!');
		$('#app').addClass('onTurn');
	} else {
		$('#app').removeClass('onTurn');
	}
	
	// update player inventory
	$('#inventory').html('');

	data.items.map((i: any) => {
		$('#inventory').append(`<div title="${i.info}" class="${i.cssClass}">${i.name}</div>`);
	});
	
})


// displays chat message
io.on('chatMessage', (data: any) => {
	
	if(data !== undefined) {
		
		let chatBox = $('#chatContainer');
		let html = `<span class="chat--item ${data.isMine ? 'right' : ''}">
			<span class="chat--name">${data.isMine? "Me" : data.from}</span>
			<span class="chat--message">${data.message}</span>
			</span>`;
		chatBox.append(html);	
	}
});


io.on('updateTurn', () => {
	console.log('I am on turn!');
})


// ends player turn 
let endTurn = () => {
	io.emit('endTurn');
}

// send chat message to server
let sendChatMessage = () => {
	let value = $('#chatInput').val();
	$('#chatInput').val('');
	io.emit('sendChatMessage', value);
}

window.onload = function() {
	$('#sendBtn').on('click', () => endTurn());
	$('#chatSendBtn').on('click', () => sendChatMessage());
}


// sends information of client leaving to detach player from lobby
window.onbeforeunload = function(){
	io.emit('clientLeaving');
  };
