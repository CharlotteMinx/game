import { Socket } from "socket.io";


export type Lobby = {
    players: Array<Player>
    name: string;
    round: number;
    maxPlayers: number;
    lobbyId: number;
    updated: Date;
    turn: string;
}


export type Player = {
    id: string;
    username: string;
    role: string,
    socket: Socket;
    items: Array<Item>;
    objective: string;
}


export type Item = {
    name: string;
    info: string;
    cssClass: string;
    data: string;
}

export type Message = {
    sender: string;
    target: string;
    data: string;
    items: Array<Item>;
}

export type joinLobbyMessage = {
    client: Player;
    lobbyId: number;
}

export type createLobbyMessage = {
    lobbyName: string;
}
