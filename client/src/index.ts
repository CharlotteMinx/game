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
	//alert(message);
   // document.body.innerHTML = `<div class='kickedMessage--container' >${message}</div>`;
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

	console.log('game status')
	console.log(data);
	// displays lobby name
	$('#lobbyName').text(data.lobby.name);
	
	// displays lobby round
	$('#roundCount').text(data.lobby.round);

	// displays turn info
	$('#turnName').text(data.lobby.turn + "'s turn");

	// displays players info
	var html = "";
	data.lobby.players.map((p: any) => { html += `<span class="player">${p.username} <span class="role">${p.role}</span></span>`});
	$('#playersBox').html(html);

	// removes turn class from app

	$('#app').removeClass('onTurn');

	// asks for player data
	io.emit('requestPlayerData');
	setEventListenersForDaD();
});


// updated and displays player data
io.on('updatePlayerData', (data: any) => {

	
	//displays objective
	$('#objective').html(data.objective);

	// displays role info
	$('#role').html(data.role);

	// changes turn to yours
	if(data.isOnTurn) {
		$('#turnName').html('Your turn!');
		$('#app').addClass('onTurn');
	} else {
		$('#app').removeClass('onTurn');
	}
	
	// update player inventory
	$('#inventory').html('');

	data.items.map((i: any) => {
		$('#inventory').append(`<div draggable="true" title="${i.info}"  itemId="${i.id}" class="${i.cssClass}">${i.name}#${i.id}</div>`);
	});

	setEventListenersForDaD();
	console.log(data.items)
});


// sets event listeners for drag and drop

let setEventListenersForDaD = () => {
	

	let dragged: any;
	$('#inventory').children().on('dragstart', (e: any) => {dragged = $(e.currentTarget).clone()});
	$('#messageAttachment').children().on('dragstart', (e: any) => {dragged = $(e.currentTarget).clone()});

	// drop into message
	$('#messageAttachment').on('dragover', (e: any) => {e.preventDefault()});
	$('#messageAttachment').on('drop', (e: any) => {
		e.preventDefault();
		let alreadyExist = false;
		$('#messageAttachment').children('div').toArray().map( e => {
			if($(e).attr('title') == $(dragged).attr('title')) {
				alreadyExist = true;
			}
		});
		if(!alreadyExist && $(dragged).attr('itemId')) {
			$('#messageAttachment').append(dragged);
			io.emit('addItemToMessage', $(dragged).attr('itemId'))
			dragged = undefined;
		}
		$('#messageAttachment').children().on('dragstart', (e: any) => {dragged = $(e.currentTarget).clone();});

	})
	
	// drop into inventory
	$('#inventory').on('dragover', (e: any) => {e.preventDefault()});
	$('#inventory').on('drop', (e: any) => {
		e.preventDefault();

		let alreadyExist = false;

		// checks if item isnt already existing in inventory

		$('#inventory').children('div').toArray().map( e => {
			if($(e).attr('title') == $(dragged).attr('title') ) {
				alreadyExist = true;
			}
		});

		if(!alreadyExist && $(dragged).attr('itemId')) {
			$('#inventory').append(dragged);
			io.emit('addItemToPlayerInvenotory', $(dragged).attr('itemId'));
			dragged = undefined;
		}
		$('#inventory').children().on('dragstart', (e: any) => {dragged = $(e.currentTarget).clone()});

	});
}


io.on('renderPacketMessage', (data: any ) => {
	let sender = $('#sender');
	let target = $('#target');
	sender.empty();
	target.empty();
	data.players.map((p: any) => {
		//<option value="option2">Option 2</option>
		sender.append(`<option ${ p == data.sender ? `selected="selected` : undefined} "value="${p}">${p}</option>`);
		target.append(`<option ${ p == data.target ? `selected="selected` : undefined} "value="${p}">${p}</option>`);

	});
	$('#messageBody').val(data.data);
	$('div#messageAttachment').html = null;
	data.items.map((i: any) => {
		$('div#messageAttachment').append(`<div draggable="true" title="${i.info}"  itemId="${i.id}" class="${i.cssClass}">${i.name}#${i.id}</div>`);
	})
	setEventListenersForDaD();
	
});
	

io.on('updatePacketMessage', (username: string) => {
	let sender = $('#sender');
	let target = $('#target');
	let found = false;
	sender.children().toArray().map((ch: any, index) => {
		console.log("here " + ch.value)
		if(ch.value == username) {
			found = true;
			console.log('removing');
			sender.children().eq(index).remove();
			target.children().eq(index).remove();
		} 
	})
	if(!found) {
		sender.append(`<option value="${username}">${username}</option>`);
		target.append(`<option value="${username}">${username}</option>`);
	}

});

let sendPacketMessage = () => {
	let sender = $('#sender').val();
	let target = $('#target').val();
	let data = $('#messageBody').val();
	let attachments: Array<number> = [];
	$('div#messageAttachment').children().toArray().map(n => {n.getAttribute('itemId') ? attachments.push(n.getAttribute('itemId') as any as number) : undefined});
	let message = {
		sender: sender,
		target: target,
		data: data,
		items: attachments,
	}
	console.log(message);
	io.emit('sendPacketMessage', message);
	
} 


io.on('clearPacketMessage', () => {
	$('#sender').val('');
	$('#target').val('');
	$('#messageBody').val('');
	$('div#messageAttachment').html('');
});


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


	console.log('adding')
		$('#sendBtn').on('click', () => {
			console.log('click');
			sendPacketMessage();
		})


	setEventListenersForDaD();


	// attaches event listeners
	$('#chatSendBtn').on('click', () => sendChatMessage());

	$('#toolbarMessages').on('click', () => {
		let el = document.getElementsByClassName('message--wrapper')[0];
		el.classList.remove('closedWindow');
	});

	$('#toolbarInventory').on('click', () => {
		let el = document.getElementsByClassName('inventory--wrapper')[0];
		el.classList.remove('closedWindow');
	});

	$('#toolbarChat').on('click', () => {
		let el = document.getElementsByClassName('chat--wrapper')[0];
		el.classList.remove('closedWindow');
	});

	$('#specialWindow').on('click', () => {
		let el = document.getElementsByClassName('message--wrapper')[0];
		el.classList.remove('closedWindow');
	});

	$('span.close').on('click', (e) => {
		e.currentTarget.parentElement.classList.add('closedWindow');
	})

}


// sends information of client leaving to detach player from lobby
window.onbeforeunload = function(){
	io.emit('clientLeaving');
  };
