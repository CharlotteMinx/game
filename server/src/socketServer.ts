
import {joinLobbyMessage, Player, Lobby, createLobbyMessage} from './types';
import { emit } from 'cluster';

export class SocketServer { 
    private io: SocketIO.Server;
    private lobbies: Array<Lobby>;

    constructor(server: any) {
        this.io = require('socket.io')(server, {
            serveClient: false,
            wsEngine: 'ws' // uws is not supported since it is a native module
        });
        this.lobbies = [];
        this.listen();
    }


    kickClient = (socket: any, message?: string): void => {
        console.log('kicking')
        socket.emit('kickClient', message);
    }

    sendErrorToClient = (socket: any, message: string): void => {
        console.log('error ' + message)
        socket.emit('displayError', message);
    }

    sendMessageToClient = (socket: any, message: string): void => {
        socket.emit('displayMessage', message);
    }

    private listen(): void {
        this.io.on('connection', function(socket){
            console.log('a user connected');
          });
          
        this.io.on('connect', (socket: any) => {

            socket.on('getLobbies', () => {
                let res: any = [];
                this.lobbies.map( l => {
                    res.push({
                        name: l.name,
                        playerCount: l.players.length,
                        maxPlayers: l.maxPlayers,
                        id: l.lobbyId,
                    });
                })
                socket.emit("lobbiesInfo", res)
            })

            // assigns client to lobby

            socket.on('joinLobby', (data: joinLobbyMessage) => {
                let kicked = false;
                this.lobbies.map(l => l.players.map((p) => { 
                    if(p.id == socket.id){
                        this.kickClient(p.socket);
                        kicked = true
                    }}));

                let lobby: Lobby = this.lobbies.find( l => l.lobbyId == data.lobbyId);
                if(lobby && !kicked) {
                   
                    if(lobby.maxPlayers > lobby.players.length) {

                        let i = 0;
                        let roles = ['user1', 'user2', 'hacker'];
                        lobby.players.map(p => {
                            p.role == roles[i] ? i++ : undefined;
                        })
                        let newPlayer: Player = {
                            id: socket.id,
                            socket: socket,
                            username: data.client.username,
                            role: roles[i],
                        };

                        lobby.players.push(newPlayer);
                        lobby.players.map((player: Player) => {
                            if(player.id !== newPlayer.id) {
                                this.sendMessageToClient(player.socket, data.client.username + " has join the lobby!")
                            }
                        });
                    } else {
                        this.kickClient(socket, "Lobby is full.");
                    }
                } else {
                    this.kickClient(socket, "Lobby was not found.");
                }
            });

            // creates new lobby

            socket.on('createLobby', (data: createLobbyMessage) => {
                console.log('creating lobby ' + data.lobbyName);
                let newLobby: Lobby = {
                    players: [],
                    round: 0,
                    name: data.lobbyName,
                    lobbyId: this.lobbies.length > 0 ? this.lobbies[this.lobbies.length-1].lobbyId + 1 : 0,
                    maxPlayers: 1,
                }
                socket.emit('createdLobby', newLobby.lobbyId);
                this.lobbies.push(newLobby);
            });

            


            socket.on('message', (m: any) => {
                console.log('[server](message): %s', JSON.stringify(m));
                this.io.emit('message', m);
            });

            socket.on('clientLeaving', () => {
                this.lobbies.map( (lobby: Lobby) => {
                    lobby.players.map((player: Player, index: number) => {
                        let players = [];
                        let disconnectedUsername: string;
                        if(player.id != socket.id) {
                            players.push(player);
                        } else {
                            disconnectedUsername = player.username;
                        }
                        console.log(disconnectedUsername + " has left. ")
                       lobby.players = players;
                       lobby.players.map( p => this.sendMessageToClient(p.socket, disconnectedUsername + " has disconected."));
                    })
                })
                console.log(this.lobbies);
                console.log('Client disconnected');
            });
        });
    }
}