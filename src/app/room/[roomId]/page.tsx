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
  roomId: string;
}

interface RoomInfo {
  userCount: number;
  users: string[];
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [roomConfig, setRoomConfig] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({ userCount: 0, users: [] });
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout>();

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

    // 방 입장
    joinRoom(roomId, savedNickname);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [roomId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = async (roomId: string, nickname: string) => {
    try {
      const response = await fetch('/api/chat/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, nickname }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        setRoomInfo({ userCount: data.users.length, users: data.users });
        setIsJoined(true);
        
        // 메시지 폴링 시작
        startPolling();
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const startPolling = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : '';
        const response = await fetch(`/api/chat/messages?roomId=${roomId}&lastMessageId=${lastMessageId}`);
        const data = await response.json();
        
        if (data.success && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages]);
        }
        
        if (data.roomInfo) {
          setRoomInfo(data.roomInfo);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 1000); // 1초마다 폴링
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          nickname,
          content: newMessage
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        // 메시지는 폴링을 통해 업데이트됨
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLeaveRoom = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    // 퇴장 API 호출 (선택사항)
    fetch('/api/chat/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, nickname }),
    }).catch(console.error);

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

  if (!isJoined) {
    return (
      <div className={styles.chatRoom}>
        <div className={styles.loading}>방에 입장 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.chatRoom}>
      <div className={styles.chatHeader}>
        <div className={styles.roomInfo}>
          <h2>방 ID: {roomId}</h2>
          {roomConfig?.roomName && <p>{roomConfig.roomName}</p>}
        </div>
        <div className={styles.roomActions}>
          <span className={styles.onlineCount}>온라인: {roomInfo.userCount}명</span>
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