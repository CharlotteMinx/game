import { Socket } from "socket.io";


export type Lobby = {
    players: Array<Player>
    name: string;
    round: number;
    maxPlayers: number;
    lobbyId: number;
    updated: Date;
    turn: number;
}


export type Player = {
    id: number;
    username: string;
    role: string,
    socket: Socket;
    items: Array<Item>;
    objective: string;
    message: Message | null;
}


export type Item = {
    name: string;
    info: string;
    cssClass: string;
    data: string;
    id: number;
}

export type Message = {
    sender: string;
    target: string;
    data: string;
    items: Array<Item>;
    players: Array<String>;
}

export type joinLobbyMessage = {
    client: Player;
    lobbyId: number;
}

export type createLobbyMessage = {
    lobbyName: string;
}
