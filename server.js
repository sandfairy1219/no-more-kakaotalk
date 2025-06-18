const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const rooms = new Map(); // 방 정보 저장
const userRooms = new Map(); // 사용자별 방 정보

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('사용자 연결:', socket.id);

    // 방 입장
    socket.on('join-room', ({ roomId, nickname }) => {
      socket.join(roomId);
      userRooms.set(socket.id, { roomId, nickname });
      
      // 방에 사용자 목록 업데이트
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: [],
          messages: []
        });
      }
      
      const room = rooms.get(roomId);
      room.users.push({ id: socket.id, nickname });
      
      // 입장 메시지 브로드캐스트
      const joinMessage = {
        id: Date.now().toString(),
        nickname: 'System',
        content: `${nickname}님이 입장했습니다.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system'
      };
      
      room.messages.push(joinMessage);
      io.to(roomId).emit('message', joinMessage);
      io.to(roomId).emit('users-update', room.users);
      
      console.log(`${nickname}이 방 ${roomId}에 입장`);
    });

    // 메시지 전송
    socket.on('send-message', ({ roomId, message }) => {
      const room = rooms.get(roomId);
      const userInfo = userRooms.get(socket.id);
      
      if (room && userInfo) {
        const newMessage = {
          id: Date.now().toString(),
          nickname: userInfo.nickname,
          content: message,
          timestamp: new Date().toLocaleTimeString(),
          type: 'user'
        };
        
        room.messages.push(newMessage);
        io.to(roomId).emit('message', newMessage);
        
        console.log(`${userInfo.nickname}: ${message}`);
      }
    });

    // 연결 해제
    socket.on('disconnect', () => {
      const userInfo = userRooms.get(socket.id);
      
      if (userInfo) {
        const { roomId, nickname } = userInfo;
        const room = rooms.get(roomId);
        
        if (room) {
          // 사용자 목록에서 제거
          room.users = room.users.filter(user => user.id !== socket.id);
          
          // 퇴장 메시지
          const leaveMessage = {
            id: Date.now().toString(),
            nickname: 'System',
            content: `${nickname}님이 퇴장했습니다.`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'system'
          };
          
          room.messages.push(leaveMessage);
          io.to(roomId).emit('message', leaveMessage);
          io.to(roomId).emit('users-update', room.users);
          
          // 방이 비어있으면 삭제
          if (room.users.length === 0) {
            rooms.delete(roomId);
          }
        }
        
        userRooms.delete(socket.id);
        console.log(`${nickname}이 연결 해제`);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});