interface Message {
  id: string;
  nickname: string;
  content: string;
  timestamp: string;
  type?: 'system' | 'user';
  roomId: string;
}

interface ChatRoom {
  id: string;
  messages: Message[];
  users: string[];
  lastActivity: number;
}

// 메모리 기반 임시 저장소 (실제로는 Redis나 DB 사용)
const rooms = new Map<string, ChatRoom>();

export const chatService = {
  joinRoom: (roomId: string, nickname: string) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        messages: [],
        users: [],
        lastActivity: Date.now()
      });
    }
    
    const room = rooms.get(roomId)!;
    if (!room.users.includes(nickname)) {
      room.users.push(nickname);
      
      const joinMessage: Message = {
        id: Date.now().toString(),
        nickname: 'System',
        content: `${nickname}님이 입장했습니다.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        roomId
      };
      
      room.messages.push(joinMessage);
      room.lastActivity = Date.now();
    }
    
    return room;
  },

  sendMessage: (roomId: string, nickname: string, content: string) => {
    const room = rooms.get(roomId);
    if (!room) return null;
    
    const message: Message = {
      id: Date.now().toString(),
      nickname,
      content,
      timestamp: new Date().toLocaleTimeString(),
      type: 'user',
      roomId
    };
    
    room.messages.push(message);
    room.lastActivity = Date.now();
    
    return message;
  },

  getMessages: (roomId: string, lastMessageId?: string) => {
    const room = rooms.get(roomId);
    if (!room) {
      console.log('Room not found:', roomId);
      return [];
    }
    
    console.log('Room messages:', room.messages);
    
    if (!lastMessageId) {
      console.log('Returning all messages:', room.messages);
      return room.messages;
    }
    
    const lastIndex = room.messages.findIndex(msg => msg.id === lastMessageId);
    const newMessages = room.messages.slice(lastIndex + 1);
    console.log('Returning new messages after', lastMessageId, ':', newMessages);
    return newMessages;
  },

  leaveRoom: (roomId: string, nickname: string) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.users = room.users.filter(user => user !== nickname);
    
    const leaveMessage: Message = {
      id: Date.now().toString(),
      nickname: 'System',
      content: `${nickname}님이 퇴장했습니다.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      roomId
    };
    
    room.messages.push(leaveMessage);
    room.lastActivity = Date.now();
    
    if (room.users.length === 0) {
      rooms.delete(roomId);
    }
  },

  getRoomInfo: (roomId: string) => {
    const room = rooms.get(roomId);
    return room ? {
      userCount: room.users.length,
      users: room.users
    } : null;
  },

  // 방이 존재하는지 확인
  roomExists: (roomId: string) => {
    return rooms.has(roomId);
  },

  // 새 방 생성
  createRoom: (roomId: string, creatorNickname: string) => {
    if (rooms.has(roomId)) {
      return { success: false, error: 'Room already exists' };
    }

    const room: ChatRoom = {
      id: roomId,
      messages: [],
      users: [],
      lastActivity: Date.now()
    };

    rooms.set(roomId, room);

    return { success: true, room };
  },

  // 모든 방 목록 가져오기 (관리용)
  getAllRooms: () => {
    return Array.from(rooms.entries()).map(([id, room]) => ({
      id,
      userCount: room.users.length,
      lastActivity: room.lastActivity
    }));
  }
};