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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // URL 파라미터에서 닉네임 확인
    const urlParams = new URLSearchParams(window.location.search);
    const urlNickname = urlParams.get('nickname');
    
    const savedNickname = localStorage.getItem('nickname');
    const savedRoomConfig = localStorage.getItem('roomConfig');
    
    // URL 파라미터 닉네임이 우선, 없으면 로컬스토리지, 둘 다 없으면 join 페이지로
    const finalNickname = urlNickname || savedNickname;
    
    if (!finalNickname) {
      router.push(`/room/${roomId}/join`);
      return;
    }
    
    setNickname(finalNickname);
    if (savedRoomConfig) {
      setRoomConfig(JSON.parse(savedRoomConfig));
    }

    // 방 존재 여부 확인 후 입장
    checkAndJoinRoom(roomId, finalNickname, savedRoomConfig || undefined);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [roomId, router]);

  const checkAndJoinRoom = async (roomId: string, nickname: string, roomConfig?: string) => {
    try {
      setIsLoading(true);
      setError('');

      // roomConfig가 있고 새로 생성된 방이면 방 존재 여부 확인 건너뛰기
      const config = roomConfig ? JSON.parse(roomConfig) : null;
      const isNewRoom = config?.isNewRoom === true;

      if (!isNewRoom) {
        // 기존 방 입장 시에만 방 존재 여부 확인
        const checkResponse = await fetch(`/api/rooms?roomId=${roomId}`);
        const checkData = await checkResponse.json();

        if (!checkData.success) {
          setError('방 정보를 확인할 수 없습니다.');
          setIsLoading(false);
          return;
        }

        if (!checkData.exists) {
          setError('존재하지 않는 방입니다. 방 코드를 다시 확인해주세요.');
          setIsLoading(false);
          return;
        }
      }

      // 방이 존재하거나 새로 생성된 방이면 입장
      await joinRoom(roomId, nickname);
    } catch (error) {
      console.error('Failed to check room:', error);
      setError('방 정보를 확인하는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

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
      console.log('Join room response:', data); // 디버깅용
      
      if (data.success) {
        console.log('Setting messages:', data.messages); // 디버깅용
        setMessages(data.messages || []);
        setRoomInfo({ userCount: data.users?.length || 0, users: data.users || [] });
        setIsJoined(true);
        setIsLoading(false);
        
        // 방 입장 성공 후 isNewRoom 플래그 제거
        const currentConfig = localStorage.getItem('roomConfig');
        if (currentConfig) {
          const config = JSON.parse(currentConfig);
          if (config.isNewRoom) {
            delete config.isNewRoom;
            localStorage.setItem('roomConfig', JSON.stringify(config));
          }
        }
        
        // 메시지 폴링 시작
        startPolling();
      } else {
        setError(data.error || '방 입장에 실패했습니다.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      setError('방 입장 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : '';
        const response = await fetch(`/api/chat/messages?roomId=${roomId}&lastMessageId=${lastMessageId}`);
        const data = await response.json();
        console.log('Polling response:', data); // 디버깅용
        
        if (data.success && data.messages && data.messages.length > 0) {
          console.log('New messages from polling:', data.messages); // 디버깅용
          setMessages(prev => {
            // 중복 메시지 제거를 위해 ID로 필터링
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = data.messages.filter((msg: Message) => !existingIds.has(msg.id));
            console.log('Filtered new messages:', newMessages); // 디버깅용
            return [...prev, ...newMessages];
          });
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
        
        // 메시지 전송 후 즉시 폴링하여 업데이트
        setTimeout(async () => {
          try {
            const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : '';
            const pollResponse = await fetch(`/api/chat/messages?roomId=${roomId}&lastMessageId=${lastMessageId}`);
            const pollData = await pollResponse.json();
            
            if (pollData.success && pollData.messages && pollData.messages.length > 0) {
              setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const newMessages = pollData.messages.filter((msg: Message) => !existingIds.has(msg.id));
                return [...prev, ...newMessages];
              });
            }
          } catch (error) {
            console.error('Immediate polling error:', error);
          }
        }, 100);
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

    // 로컬스토리지 정리 (백업용으로만 유지)
    localStorage.removeItem('nickname');
    localStorage.removeItem('roomConfig');
    
    // 메인으로 이동 (URL 파라미터 제거)
    router.push('/');
  };

  const handleShareRoom = () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    
    if (navigator.share) {
      // 모바일에서 네이티브 공유
      navigator.share({
        title: '채팅방 참여',
        text: `방 ID: ${roomId}에 참여하세요!`,
        url: shareUrl,
      });
    } else {
      // 데스크톱에서 클립보드 복사
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('방 링크가 클립보드에 복사되었습니다!');
      }).catch(() => {
        // 클립보드 접근 실패 시 프롬프트로 표시
        prompt('이 링크를 복사하여 공유하세요:', shareUrl);
      });
    }
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

  if (isLoading) {
    return (
      <div className={styles.chatRoom}>
        <div className={styles.loading}>방 정보를 확인하는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.chatRoom}>
        <div className={styles.error}>
          <h3>❌ 방 입장 실패</h3>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/')}
            className={styles.backButton}
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
          <button onClick={handleShareRoom} className={styles.shareButton}>공유</button>
          <button onClick={handleLeaveRoom} className={styles.leaveButton}>나가기</button>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
            메시지가 없습니다. 첫 번째 메시지를 보내보세요!
            <br />
            <small>현재 메시지 수: {messages.length}</small>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '12px', color: '#999', padding: '5px' }}>
              총 {messages.length}개 메시지
            </div>
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={getMessageClassName(message)}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.nickname}>{message.nickname}</span>
                  <span className={styles.timestamp}>{message.timestamp}</span>
                </div>
                <div className={styles.messageContent}>{message.content}</div>
              </div>
            ))}
          </>
        )}
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