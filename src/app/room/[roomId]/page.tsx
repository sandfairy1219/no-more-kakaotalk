"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './page.module.css';

interface Message {
  id: string;
  nickname: string;
  content: string;
  timestamp: string;
  type?: 'system' | 'user';
}

interface User {
  id: string;
  nickname: string;
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [roomConfig, setRoomConfig] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedNickname = localStorage.getItem('nickname');
    const savedRoomConfig = localStorage.getItem('roomConfig');
    
    if (!savedNickname) {
      router.push('/');
      return;
    }
    
    setNickname(savedNickname);
    if (savedRoomConfig) {
      setRoomConfig(JSON.parse(savedRoomConfig));
    }

    // Socket.IO 연결
    const newSocket = io();
    setSocket(newSocket);

    // 방 입장
    newSocket.emit('join-room', { roomId, nickname: savedNickname });

    // 메시지 수신
    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // 사용자 목록 업데이트
    newSocket.on('users-update', (users: User[]) => {
      setOnlineUsers(users);
    });

    // 컴포넌트 언마운트 시 소켓 해제
    return () => {
      newSocket.disconnect();
    };
  }, [roomId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', { roomId, message: newMessage });
    setNewMessage('');
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem('nickname');
    localStorage.removeItem('roomConfig');
    router.push('/');
  };

  const getMessageClassName = (message: Message) => {
    let className = styles.message;
    if (message.type === 'system') {
      className += ` ${styles.systemMessage}`;
    } else if (message.nickname === nickname) {
      className += ` ${styles.myMessage}`;
    }
    return className;
  };

  return (
    <div className={styles.chatRoom}>
      <div className={styles.chatHeader}>
        <div className={styles.roomInfo}>
          <h2>방 ID: {roomId}</h2>
          {roomConfig?.roomName && <p>{roomConfig.roomName}</p>}
        </div>
        <div className={styles.roomActions}>
          <span className={styles.onlineCount}>온라인: {onlineUsers.length}명</span>
          <button onClick={handleLeaveRoom} className={styles.leaveButton}>나가기</button>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.map((message) => (
          <div key={message.id} className={getMessageClassName(message)}>
            <div className={styles.messageHeader}>
              <span className={styles.nickname}>{message.nickname}</span>
              <span className={styles.timestamp}>{message.timestamp}</span>
            </div>
            <div className={styles.messageContent}>{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="메시지를 입력하세요... (Enter: 전송)"
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </div>
  );
}