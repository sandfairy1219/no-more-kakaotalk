import React from 'react';

interface CreateRoomButtonProps {
  onCreate: () => void;
}

const CreateRoomButton: React.FC<CreateRoomButtonProps> = ({ onCreate }) => {
  return (
    <button 
      onClick={onCreate} 
      className="bg-blue-500 text-white py-2 px-4 rounded"
    >
      새 채팅방 만들기
    </button>
  );
};

export default CreateRoomButton;