import React, { useEffect, useState } from 'react';

const ChatRoom = ({ roomId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [nickname, setNickname] = useState('');
    const [nicknameSet, setNicknameSet] = useState(false);

    useEffect(() => {
        // Fetch messages from the server or a local store based on roomId
        const fetchMessages = async () => {
            // Placeholder for fetching messages logic
            const fetchedMessages = []; // Replace with actual fetch logic
            setMessages(fetchedMessages);
        };

        fetchMessages();
    }, [roomId]);

    const handleSendMessage = () => {
        if (newMessage.trim() && nicknameSet) {
            const message = {
                text: newMessage,
                sender: nickname,
                timestamp: new Date().toISOString(),
            };
            setMessages([...messages, message]);
            setNewMessage('');
            // Send message to the server or update local store
        }
    };

    const handleNicknameChange = (e) => {
        setNickname(e.target.value);
    };

    const handleNicknameSubmit = () => {
        if (nickname.trim()) {
            setNicknameSet(true);
        }
    };

    return (
        <div className="chat-room">
            {!nicknameSet ? (
                <div className="nickname-input">
                    <input
                        type="text"
                        value={nickname}
                        onChange={handleNicknameChange}
                        placeholder="Enter your nickname"
                    />
                    <button onClick={handleNicknameSubmit}>Set Nickname</button>
                </div>
            ) : (
                <div>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="message">
                                <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message"
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;