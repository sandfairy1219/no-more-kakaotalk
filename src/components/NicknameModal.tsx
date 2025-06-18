import React, { useState } from 'react';

interface NicknameModalProps {
  onSetNickname: (nickname: string) => void;
  onClose: () => void;
}

const NicknameModal: React.FC<NicknameModalProps> = ({ onSetNickname, onClose }) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSetNickname(nickname);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">Set Your Nickname</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="border p-2 w-full mb-4"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Set Nickname
          </button>
          <button type="button" onClick={onClose} className="ml-2 p-2">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default NicknameModal;