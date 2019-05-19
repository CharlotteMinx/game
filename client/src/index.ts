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
//     var url = new URL( window.location + "");
//    // document.body.innerHTML = `<div class='kickedMessage--container' >${message}</div>`;
//     url.pathname = 'lobby';
//     (window as any).location = url;
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


// sends information of client leaving to detach player from lobby
window.onbeforeunload = function(){
    io.emit('clientLeaving');
  };
