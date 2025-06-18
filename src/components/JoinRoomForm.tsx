import React, { useState } from 'react';

const JoinRoomForm: React.FC<{ onJoin: (roomId: string, nickname: string) => void }> = ({ onJoin }) => {
    const [roomId, setRoomId] = useState('');
    const [nickname, setNickname] = useState('');

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId && nickname) {
            onJoin(roomId, nickname);
        }
    };

    return (
        <form onSubmit={handleJoin} className="flex flex-col space-y-4">
            <input
                type="text"
                placeholder="Room Code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="p-2 border border-gray-300 rounded"
                required
            />
            <input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="p-2 border border-gray-300 rounded"
                required
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                Join Room
            </button>
        </form>
    );
};

export default JoinRoomForm;