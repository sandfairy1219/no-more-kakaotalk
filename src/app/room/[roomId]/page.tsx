"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

interface Message {
  id: string;
  nickname: string;
  content: string;
  timestamp: string;
  type?: 'system' | 'user';
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [roomConfig, setRoomConfig] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      nickname: 'System',
      content: `${savedNickname}님이 입장했습니다.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system'
    };
    setMessages([welcomeMessage]);
    setOnlineUsers([savedNickname]);

    const handleBeforeUnload = () => {
      localStorage.removeItem('nickname');
      localStorage.removeItem('roomConfig');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      nickname,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleLeaveRoom = () => {
    const leaveMessage: Message = {
      id: Date.now().toString(),
      nickname: 'System',
      content: `${nickname}님이 퇴장했습니다.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, leaveMessage]);
    
    setTimeout(() => {
      localStorage.removeItem('nickname');
      localStorage.removeItem('roomConfig');
      router.push('/');
    }, 1000);
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