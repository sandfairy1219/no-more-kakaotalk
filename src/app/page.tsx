"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function HomePage() {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // 방 ID 생성 (6자리 영대문자+숫자)
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, '0');
      
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: newRoomId,
          creatorNickname: nickname
        }),
      });

      const data = await response.json();

      if (data.success) {
        const config = {
          roomId: newRoomId,
          roomName,
          createdAt: new Date().toISOString(),
          isNewRoom: true // 방 생성 플래그 추가
        };
        
        localStorage.setItem('nickname', nickname);
        localStorage.setItem('roomConfig', JSON.stringify(config));
        
        router.push(`/room/${newRoomId}?nickname=${encodeURIComponent(nickname)}`);
      } else {
        setError(data.error || '방 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('방 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('방 ID를 입력해주세요.');
      return;
    }

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setError('');

    try {
      // 방 존재 여부 확인
      const response = await fetch(`/api/rooms?roomId=${roomId.toUpperCase()}`);
      const data = await response.json();

      if (data.success && data.exists) {
        const config = { 
          roomId: roomId.toUpperCase(),
          isNewRoom: false // 기존 방 입장 플래그
        };
        localStorage.setItem('nickname', nickname);
        localStorage.setItem('roomConfig', JSON.stringify(config));
        
        router.push(`/room/${roomId.toUpperCase()}?nickname=${encodeURIComponent(nickname)}`);
      } else {
        setError('존재하지 않는 방입니다. 방 코드를 다시 확인해주세요.');
      }
    } catch (error) {
      console.error('Failed to check room:', error);
      setError('방 정보를 확인하는 중 오류가 발생했습니다.');
    }
  };

  if (mode === 'create') {
    return (
      <div className={styles.container}>
        <h1>새 채팅방 만들기</h1>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.form}>
          <input
            type="text"
            placeholder="방 이름 (선택사항)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => {
                setMode('select');
                setError('');
              }}
              className={`${styles.button} ${styles.secondary}`}
            >
              뒤로가기
            </button>
            <button 
              onClick={handleCreateRoom}
              disabled={isCreating}
              className={`${styles.button} ${styles.primary}`}
            >
              {isCreating ? '방 생성 중...' : '방 만들기'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className={styles.container}>
        <h1>채팅방 입장</h1>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.form}>
          <input
            type="text"
            placeholder="방 ID를 입력하세요 (6자리 영문+숫자)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            maxLength={6}
          />
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
              onClick={() => {
                setMode('select');
                setError('');
              }}
              className={`${styles.button} ${styles.secondary}`}
            >
              뒤로가기
            </button>
            <button 
              onClick={handleJoinRoom} 
              className={`${styles.button} ${styles.primary}`}
            >
              입장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>채팅 서비스</h1>
      <div className={styles.mainButtons}>
        <button onClick={() => setMode('create')} className={styles.mainButton}>
          <h2>방 만들기</h2>
          <p>새로운 채팅방을 생성합니다</p>
        </button>
        <button onClick={() => setMode('join')} className={styles.mainButton}>
          <h2>방 입장하기</h2>
          <p>기존 채팅방에 참여합니다</p>
        </button>
      </div>
    </div>
  );
}