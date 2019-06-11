
import {joinLobbyMessage, Player, Lobby, createLobbyMessage, Item, Message} from './types';
import * as moment from 'moment';


export class SocketServer { 
    private io: SocketIO.Server;
    private lobbies: Array<Lobby>;
    private roles = ['alice', 'bob', 'hacker'];
    constructor(server: any) {
        this.io = require('socket.io')(server, {
            serveClient: false,
            wsEngine: 'ws' // uws is not supported since it is a native module
        });
        this.lobbies = [];
        this.listen();
    }


    // kicks player from gape page back to login page with optional message

    kickClient = (socket: any, message?: string): void => {
        console.log('kicking coz of ' + message)
        socket.emit('kickClient', message);
    }


    // sends message to client

    sendMessageToClient = (socket: any, message: string): void => {
        console.log("client message" + message);
        socket.emit('displayMessage', message);
    }


    // removes lobbies that are empty 

    checkLobbies = (): void => {
        let newLobbies: Array<Lobby> = [];
        
        this.lobbies.map(l => {
            if(l.players.length > 0 || (moment(l.updated).add(30, 'seconds').isAfter(moment())))  newLobbies.push(l);
        });
        this.lobbies = newLobbies;
    }

    getObjectiveByRole = (role: string) => {
        let res = "";
        switch(role) {
            case "alice":
              res = "Send credit card info to bob."
              break;
            case "bob":
                res = "Send secret text info to alice."
              break;
            case "hacker":
                res = "Obtain credit card or secret text from other players."
              break;
          }
        return res;
    }

    // generates unique id withing array

    generateUniqId = (field?: any): number => {
        let res = Math.floor(Math.random()*90000) + 10000;
        
        while(field.find((n: any) => n.id == res)) {
            console.log('found duplicate')
            res = Math.floor(Math.random()*90000) + 10000;
        }
        return res;
    }

    getPlayerBySocket = (socket: any): Player => {
        let lobby = this.getLobbyBySocketId(socket.id);
        let player: Player = lobby.players.find(p => p.id == socket.id);
        return player;
    }

    getDefaultItemsByRole = (role: string): Array<Item> => {
        let items: Array<Item> = [];

        switch(role) {
            case "alice":
                items.push({
                    name: 'Credit card',
                    info: "Alices credit card.",
                    cssClass: 'creditCard',
                    id: this.generateUniqId(items),
                    data: '',
                });
                items.push({
                    name: 'Private key - alice',
                    info: "Alices private key.",
                    cssClass: 'privateKey',
                    id: this.generateUniqId(items),
                    data: '',
                });
                items.push({
                    name: 'Public key - alice',
                    info: "Alices public key.",
                    cssClass: 'publicKey',
                    id: this.generateUniqId(items),
                    data: '',
                });
              break;
            case "bob":
                items.push({
                    name: 'Secret text',
                    info: "Bobs Secret text.",
                    cssClass: 'secretText',
                    id: this.generateUniqId(items),
                    data: '',
                });
                items.push({
                    name: 'Private key - bob',
                    info: "Bobs private key.",
                    cssClass: 'privateKey',
                    id: this.generateUniqId(items),
                    data: '',
                });
                items.push({
                    name: 'Public key - bob',
                    info: "Bobs public key.",
                    cssClass: 'publicKey',
                    id: this.generateUniqId(items),
                    data: '',
                });
              break;
            case "hacker":
                items.push({
                    name: 'Hackers pride',
                    info: "The pride of mighy hacker.",
                    cssClass: 'pride',
                    id: this.generateUniqId(items),
                    data: '',
                });
                items.push({
                    name: 'Private key - hacker',
                    info: "Hackers private key.",
                    cssClass: 'privateKey',
                    id: this.generateUniqId(items),
                    data: '',
                });
                items.push({
                    name: 'Public key - hacker',
                    info: "Hackers public key.",
                    cssClass: 'publicKey',
                    id: this.generateUniqId(items),
                    data: '',
                });
              break;
          }

        return items;
    }
    
    getLobies = () => {
        let res: any = [];
        this.lobbies.map( l => {
            res.push({
                name: l.name,
                playerCount: l.players.length,
                maxPlayers: l.maxPlayers,
                id: l.lobbyId,
            });
        })
        return res;
    }

    getLobbyBySocketId = (socketId: any): Lobby => {
        let res: Lobby;
        this.lobbies.map(l => {
            l.players.map(p => {
                if(p.id == socketId){
                    res = l;
                }
            })
        })
        return res;
    }


    createNewPacketMessage = (socket: any) => {
        let lobby = this.getLobbyBySocketId(socket.id);
        let player = this.getPlayerBySocket(socket);
        let players: Array<String> = [];
        lobby.players.map(p => players.push(p.username))
        let newMessage: any = {
            sender: player.username,
            target: '',
            players:  players,
            items: [],
            data: '',
        };
        player.message = newMessage;
        return newMessage;
    }

    // returns all items that player should have access to

    getAllPlayerItems = (player: Player): Array<Item> => {
        let items: Array<Item> = player.items;
        if(player.message !== null) items = [...player.items, ...player.message.items];
        return items;

    }

    // return overall game lobby status

    getGameStatus = (socket: any) => {
        let lobby: Lobby = this.getLobbyBySocketId(socket.id);
        let players: any = [];
        if(lobby) {
            lobby.players.map((p: Player) => {
                players.push({
                    username: p.username,
                    role: p.role,
                });
            });
            let playerOnTurn = lobby.players.find(p => p.id == lobby.turn);
            let res = {
                lobby: {
                    players: players,
                    name: lobby.name,
                    round: lobby.round,
                    turn: playerOnTurn ? playerOnTurn.username : '',
                }
            };
            return res;
        } else {
            this.sendMessageToClient(socket, "Error when getting game status has occured.")
        }
    }

    private listen(): void {
          
        this.io.on('connect', (socket: any) => {
            // sends necessary data to client after join
            socket.on('getGameStatus', () => {
                socket.emit('gameStatus', this.getGameStatus(socket) );
            });

            // sends avaible lobbies to client

            socket.on('getLobbies', () => {
                //this.checkLobbies();
                socket.emit("lobbiesInfo",  this.getLobies());
            });

           
            // sends message to other players in lobby

            socket.on('sendChatMessage', (message: string) => {
                let lobby = this.getLobbyBySocketId(socket.id);
                let username = lobby.players.find(p => p.id == socket.id).username;
                if(username) {
                    lobby.players.map(p => {
                        if(p.id == socket.id) {
                            this.io.to(`${p.id}`).emit('chatMessage',{message: message, from: username, isMine: true })
                        } else {
                            this.io.to(`${p.id}`).emit('chatMessage',{message: message, from: username, isMine: false })
                        }
                    })
                } else {
                    this.sendMessageToClient(socket,'Error has occured when sending message.')
                }
                
            });

            socket.on('addItemToMessage', (itemId: number) => {
                let player =  this.getPlayerBySocket(socket);
                let items = this.getAllPlayerItems(player);

                if(itemId == null) {
                    this.sendMessageToClient(socket, 'Errow when adding item to invenotory has occures.')
                } else if(player.message !== null) {
                    if(player.message.items.find(i => i.id == itemId)) {
                        this.sendMessageToClient(socket, 'You have already added this attachment.')
                    } else if(items.find(i => i.id == itemId)){
                        player.message.items.push(items.find(i => i.id == itemId));
                    } else {
                        this.sendMessageToClient(socket, 'Errow when adding item to invenotory has occures.')
                    }
                } else {
                    this.sendMessageToClient(socket, "Wait for your turn.");
                }
            })

            socket.on('addItemToPlayerInvenotory', (itemId: number) => {
                let player =  this.getPlayerBySocket(socket);
                let allItems = this.getAllPlayerItems(player);
                
                if(player.items.find(i => i.id == itemId)) {
                    this.sendMessageToClient(socket, 'You already have this item in your inventory.')
                } else if(!allItems.find(i => i.id == itemId)){
                    this.sendMessageToClient(socket, 'Errow when adding item to invenotory has occures.')
                } else {
                    player.items.push(player.message.items.find(i => i.id == itemId));
                }
            })

            // assigns client to lobby
            socket.on('joinLobby', (data: joinLobbyMessage) => {
                let kicked = false;

                // kick player if connecting with same id which should not be even possible
                this.lobbies.map(l => l.players.map((p) => { 
                    if(p.id == socket.id){
                        this.kickClient(p.socket);
                        kicked = true
                    }}));

                let lobby: Lobby = this.lobbies.find( l => l.lobbyId == data.lobbyId);
                if(lobby && !kicked) {
                   
                    if(lobby.maxPlayers > lobby.players.length) {

                        let i = 0;
                        
                        lobby.players.map(p => {
                            p.role == this.roles[i] ? i++ : undefined;
                        });

                        let newPlayer: Player = {
                            id: socket.id,
                            socket: socket,
                            username: data.client.username,
                            role: this.roles[i],
                            items: this.getDefaultItemsByRole(this.roles[i]),
                            objective: this.getObjectiveByRole(this.roles[i]),
                            message: null,
                        };
                        if(lobby.players.length == 0) lobby.turn = newPlayer.id;
                        lobby.players.push(newPlayer);
                        lobby.updated =  moment().toDate();

                        // updates target and sender on message
                        this.io.to(`${lobby.turn}`).emit('updatePacketMessage', newPlayer.username);
                        this.io.emit('lobbiesInfo', this.getLobies());
                        lobby.players.map((player: Player) => {
                            if(player.id !== newPlayer.id) {
                                this.io.to(`${player.id}`).emit('gameStatus', this.getGameStatus(socket));
                                this.sendMessageToClient(player.socket, data.client.username + " has join the lobby!")
                            } else {
                                this.sendMessageToClient(player.socket, "You have joined the lobby " + lobby.name + "!")
                                socket.emit('joinedLobby');
                            }
                        });
                    } else {
                        this.kickClient(socket, "Lobby is full.");
                    }
                } else {
                    this.kickClient(socket, "Lobby was not found.");
                }
            });


            socket.on('sendPacketMessage', (data: any) => {
                if(data.sender && data.target && data.data !== undefined && data.items !== undefined) {
                    let lobby = this.getLobbyBySocketId(socket.id);
                    // checks if user is on turn
                    if(lobby.players.length < lobby.maxPlayers) {
                        this.sendMessageToClient(socket, "Wait till the lobby is full.");
                    } else if(data.target == data.sender) {
                        this.sendMessageToClient(socket, "You cant send message to urself.");
                    } else if(lobby.turn == socket.id) {

                        this.getPlayerBySocket(socket).message = null;
                        let senderPlayer = this.getPlayerBySocket(socket);
                        let targetPlayer = lobby.players.find(p => p.username == data.target);
                        
                        // let hacker get the turn if message is from hacker just changes turn to target
                        if(targetPlayer.role !== 'hacker' && senderPlayer.role !== 'hacker') {
                            let hacker = lobby.players.find(p => p.role == 'hacker');
                            lobby.turn = hacker.id;
                        } else {
                            lobby.turn = targetPlayer.id;
                        }

                        // clear senders message html
                        socket.emit('clearPacketMessage');
                        // gets player names
                        let playerNames: Array<string> = [];
                        lobby.players.map(p => playerNames.push(p.username));
                        // gets items by id
                        let foundItems: Array<Item> = [];
                        
                        this.getAllPlayerItems(senderPlayer).map(i => {
                            if(data.items.indexOf(i.id+'') > -1 && foundItems.indexOf(i) == -1) {
                                foundItems.push(i);
                            }});

                        let newMessage: Message = {
                            sender: data.sender,
                            target: data.target,
                            data: data.data,
                            items: foundItems,
                            players: playerNames,
                        };
                        
                        lobby.round++;
                        
                        this.io.to(`${lobby.turn}`).emit('clearPacketMessage');
                        this.io.to(`${lobby.turn}`).emit('renderPacketMessage', newMessage);
                        
                        lobby.players.map(p => {
                            p.id == lobby.turn ? p.message = newMessage: undefined;
                            this.io.to(`${p.id}`).emit('gameStatus', this.getGameStatus(p.socket));
                            
                        });
                    } else {
                        this.sendMessageToClient(socket, "It's not your turn!");
                    }
                   
                } else {
                    this.sendMessageToClient(socket, 'An event when sending message has occured!')
                }

            });


            // sends player data to client

            socket.on('requestPlayerData', () => {
                let lobby = this.getLobbyBySocketId(socket.id);
                let player: Player = lobby.players.find(p => p.id == socket.id);
                if(player) {
                    let res = {
                        objective: player.objective,
                        name: player.username,
                        role: player.role,
                        items: player.items,
                        isOnTurn: lobby.turn == player.id ? true : false,
                    }

                    if(res.isOnTurn && player.message == null) {
                        socket.emit('renderPacketMessage', this.createNewPacketMessage(socket));

                    }
                    socket.emit('updatePlayerData', res);
                } else {
                    this.kickClient(socket, 'An error has occured when requesting player data from server.');
                }
               
            });



            // creates new lobby

            socket.on('createLobby', (data: createLobbyMessage) => {
                let newLobby: Lobby = {
                    players: [],
                    round: 0,
                    name: data.lobbyName,
                    lobbyId: this.generateUniqId(this.lobbies),
                    maxPlayers: 3,
                    updated: moment().toDate(),
                    turn: 0,
                }
                console.log('Created lobby' + newLobby.name + "#" + newLobby.lobbyId);
                
                this.lobbies.push(newLobby);
                socket.emit('createdLobby', newLobby.lobbyId);
                this.io.emit('lobbiesInfo', this.getLobies());
            });

            // detaches client from lobby and deletes lobby if it remains empty

            socket.on('clientLeaving', () => {        
                let disconectedPlayer: Player;
                this.lobbies.map( (lobby: Lobby) => {
                    let players: Array<Player> = [];
                    lobby.players.map((player: Player) => {
                      
                        if(player.id != socket.id) {
                            players.push(player);
                        } else {
                            disconectedPlayer = player;
                        }
                        // changes turn to other player if leaving is on turn
                        if(lobby.turn == socket.id) {
                            //this.changeTurnBasedOnRole(socket);
                        }
                    });
                    lobby.updated =  moment().toDate();
                    lobby.players = players;

                    // sends message to other players that someone left
                    if(disconectedPlayer && disconectedPlayer.username) {
                        // removes player from message
                        this.io.to(`${lobby.turn}`).emit('updatePacketMessage', disconectedPlayer.username);
                        
                        lobby.players.map( p => {
                            this.sendMessageToClient(p.socket, disconectedPlayer.username + " has disconected.")
                            this.io.to(`${p.id}`).emit('gameStatus', this.getGameStatus(p.socket));
                        }); 
                        this.checkLobbies();
                        this.io.emit("lobbiesInfo",  this.getLobies());
                    }
                });
                
            });
        });
    }
}