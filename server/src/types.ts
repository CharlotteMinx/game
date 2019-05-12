import { Socket } from "socket.io";


export type Lobby = {
    players: Array<Player>
    name: string;
    round: number;
    maxPlayers: number;
    lobbyId: number;
}


export type Player = {
    id: string;
    username: string;
    role: string,
    socket: Socket;
}


export type Item = {
    name: string;
    info: string;
    cssClass: string;
}

export type joinLobbyMessage = {
    client: Player;
    lobbyId: number;
}

export type createLobbyMessage = {
    lobbyName: string;
}
