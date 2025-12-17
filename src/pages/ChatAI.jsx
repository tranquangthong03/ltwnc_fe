// src/pages/ChatAI.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ChatAI = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([{ role: 'model', content: 'Xin chào! Tôi là trợ lý sức khỏe AI. Bạn cần tư vấn gì hôm nay?' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [maPhienChat, setMaPhienChat] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Gọi API Backend: /api/Chat/send
            const response = await api.post('/Chat/send', {
                MaNguoiDung: user.userId,
                MaPhienChat: maPhienChat, // Gửi null nếu là chat mới
                NoiDung: userMsg.content
            });

            const botReply = response.data.BotReply;
            const newSessionId = response.data.MaPhienChat;

            if (!maPhienChat) setMaPhienChat(newSessionId);

            setMessages(prev => [...prev, { role: 'model', content: botReply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: 'Xin lỗi, tôi đang gặp sự cố kết nối.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="login-require">Vui lòng đăng nhập để chat với AI.</div>;
    return (
        <div className="chat-container-full">
            <div className="chat-header">
                <span>🤖</span> Trợ Lý Sức Khỏe AI (Gemini)
            </div>

            <div className="chat-body">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-model'}`}>
                        {msg.content}
                    </div>
                ))}
                {loading && <div className="chat-bubble bubble-model">Đang soạn tin...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-footer">
                <input
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập triệu chứng..."
                    disabled={loading}
                />
                <button onClick={handleSend} className="btn btn-primary">Gửi</button>
            </div>
        </div>
    );
};

export default ChatAI;