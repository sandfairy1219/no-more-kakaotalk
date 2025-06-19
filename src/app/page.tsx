"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function HomePage() {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);
  const [nickname, setNickname] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState<any>(null);
  const router = useRouter();

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const config = {
      roomId: newRoomId,
      roomName,
      maxUsers,
      createdAt: new Date().toISOString()
    };
    setRoomConfig(config);
    setShowNicknameModal(true);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert('방 ID를 입력해주세요.');
      return;
    }
    setRoomConfig({ roomId });
    setShowNicknameModal(true);
  };

  const handleNicknameSubmit = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('roomConfig', JSON.stringify(roomConfig));
    
    router.push(`/room/${roomConfig.roomId}`);
  };

  if (showNicknameModal) {
    return (
      <div className={styles.container}>
        <div className={styles.modal}>
          <h2>닉네임 설정</h2>
          <input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
          />
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => setShowNicknameModal(false)} 
              className={`${styles.button} ${styles.secondary}`}
            >
              취소
            </button>
            <button 
              onClick={handleNicknameSubmit} 
              className={`${styles.button} ${styles.primary}`}
            >
              입장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className={styles.container}>
        <h1>새 채팅방 만들기</h1>
        <div className={styles.form}>
          <input
            type="text"
            placeholder="방 이름"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <div className={styles.formGroup}>
            <label>최대 인원: {maxUsers}명</label>
            <input
              type="range"
              min="2"
              max="50"
              value={maxUsers}
              onChange={(e) => setMaxUsers(Number(e.target.value))}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => setMode('select')} 
              className={`${styles.button} ${styles.secondary}`}
            >
              뒤로가기
            </button>
            <button 
              onClick={handleCreateRoom} 
              className={`${styles.button} ${styles.primary}`}
            >
              방 만들기
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
        <div className={styles.form}>
          <input
            type="text"
            placeholder="방 ID를 입력하세요"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
          />
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => setMode('select')} 
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