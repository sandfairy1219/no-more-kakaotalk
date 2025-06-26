"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../page.module.css';

export default function RoomJoinPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [nickname, setNickname] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // 방 존재 여부 확인
      const response = await fetch(`/api/rooms?roomId=${roomId}`);
      const data = await response.json();

      if (data.success && data.exists) {
        router.push(`/room/${roomId}?nickname=${encodeURIComponent(nickname)}`);
      } else {
        setError('존재하지 않는 방입니다. 방 코드를 다시 확인해주세요.');
      }
    } catch (error) {
      console.error('Failed to check room:', error);
      setError('방 정보를 확인하는 중 오류가 발생했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>채팅방 입장</h1>
      <h2>방 ID: {roomId}</h2>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
          required
        />
        <div className={styles.buttonGroup}>
          <button 
            onClick={() => router.push('/')}
            className={`${styles.button} ${styles.secondary}`}
          >
            메인으로
          </button>
          <button 
            onClick={handleJoinRoom}
            disabled={isJoining}
            className={`${styles.button} ${styles.primary}`}
          >
            {isJoining ? '입장 중...' : '입장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
