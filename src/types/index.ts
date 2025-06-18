export interface User {
    id: string;
    nickname: string;
}

export interface Room {
    id: string;
    name: string;
    users: User[];
    messages: Message[];
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
}