
import {joinLobbyMessage, Player, Lobby, createLobbyMessage, Item, Message} from './types';
import * as moment from 'moment';
import { Socket } from 'dgram';


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
        console.log('kicking')
        socket.emit('kickClient', message);
    }


    // sends message to client

    sendMessageToClient = (socket: any, message: string): void => {
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


    generateUniqId = (field?: any): number => {
        let res = Math.floor(Math.random()*90000) + 10000;
        
        while(field.find((n: any) => n.id == res)) {
            res = Math.floor(Math.random()*90000) + 10000;
        }
        console.log(res);
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
                    name: 'Secret text',
                    info: "Bobs Secret text.",
                    cssClass: 'secretText',
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
    
    getLobies = (socket: Socket) => {
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

    // retursn all items that player should have access to

    getAllPlayerItems = (player: Player): Array<Item> => {
        let items = player.items;
        items = [...items, ...player.message.items];
        return items;

    }

    changeTurnBasedOnRole = (socket: any) => {
        let lobby = this.getLobbyBySocketId(socket.id);
        if(lobby){
                let player =  this.getPlayerBySocket(socket);
                if(player.id == lobby.turn) {
                    if(lobby.players.length == lobby.maxPlayers) {
                        let nextRoleIndex = this.roles.indexOf(player.role)+1;
                        nextRoleIndex = nextRoleIndex > this.roles.length -1 ? 0 : nextRoleIndex;
                        let newPlayer = lobby.players.find(p => {return p.role == this.roles[nextRoleIndex]});
                        lobby.turn = newPlayer.id;
                        lobby.round++;
                        lobby.players.map( p => {
                            this.io.to(`${p.id}`).emit('gameStatus', this.getGameStatus(socket));
                        });
                        this.io.to(`${lobby.turn}`).emit(' ', true);
                    } else {
                        this.sendMessageToClient(socket, "Wait till the lobby is full!");
                    }
                } else {
                    this.kickClient(socket, "Unexpected error");
                }
            } else {
                this.kickClient(socket, "Unexpected error");
            }
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
                socket.emit("lobbiesInfo",  this.getLobies(socket));
            });

           
            // sends message to other players in lobby

            socket.on('sendChatMessage', (message: string) => {
                let lobby = this.getLobbyBySocketId(socket.id);
                let username = lobby.players.find(p => p.id == socket.id).username;
                console.log(username + ": " +message);
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


            socket.on('addItemToPlayerInvenotory', (itemId: number) => {
                let player =  this.getPlayerBySocket(socket);
                let items = this.getAllPlayerItems(player);
                if(player.items.find(i => i.id == itemId)) {
                    this.sendMessageToClient(socket, 'You already have this item in your inventory.')
                } else if(items.find(i => i.id == itemId)){
                    player.items.push(items.find(i => i.id == itemId));
                } else {
                    this.sendMessageToClient(socket, 'Errow when adding item to invenotory has occures.')
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


            socket.on('sendPacketMessage', (data: Message) => {
                if(data.sender && data.target && data.data && data.items) {
                    let lobby = this.getLobbyBySocketId(socket.id);
                    // checks if user is on turn
                    if(lobby.turn == socket.id) {

                        // changes turn
                        this.changeTurnBasedOnRole(socket);

                                            
                        let messageWithPlayers: any = data;
                        messageWithPlayers.players = [];
                        lobby.players.map(p => messageWithPlayers.players.push(p.username));
                        this.io.to(`${lobby.turn}`).emit('renderPacketMessage', messageWithPlayers);

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
                    socket.emit('updatePlayerData', res);
                } else {
                    this.kickClient(socket, 'An error has occured when requesting player data from server.');
                }
               
            });



            // ends turn of player
            socket.on('endTurn', () => {
                this.changeTurnBasedOnRole(socket);
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
                socket.emit('createdLobby', newLobby.lobbyId);
                this.lobbies.push(newLobby);
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
                        if(lobby.turn = socket.id) {
                            this.changeTurnBasedOnRole(socket);
                        }
                    });
                    lobby.updated =  moment().toDate();
                    lobby.players = players;

                    // sends message to other players that someone left
                    if(disconectedPlayer && disconectedPlayer.username) {
                        lobby.players.map( p => {
                            this.sendMessageToClient(p.socket, disconectedPlayer.username + " has disconected.")
                            this.io.to(`${p.id}`).emit('gameStatus', this.getGameStatus(socket));
                        }); 
                        this.checkLobbies();
                        this.io.emit("lobbiesInfo",  this.getLobies(socket));
                    }
                });
                
            });
        });
    }
}