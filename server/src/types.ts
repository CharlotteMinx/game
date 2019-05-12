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
    items: Array<Item>;
}


export type Item = {
    name: string;
    info: string;
    cssClass: string;
    data: string;
    action: Action;
}

export type Action = {

}

export type joinLobbyMessage = {
    client: Player;
    lobbyId: number;
}

export type createLobbyMessage = {
    lobbyName: string;
}
