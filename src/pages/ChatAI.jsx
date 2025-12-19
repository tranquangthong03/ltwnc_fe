// src/pages/ChatAI.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Send, Plus, Bot, User,
    MoreHorizontal, X, MessageSquare, Loader
} from 'lucide-react';
import { toast } from 'react-toastify';

const ChatAI = () => {
    const { user } = useContext(AuthContext); // Ensure AuthContext provides 'user'
    const [messages, setMessages] = useState([
        { role: 'model', content: 'Xin chào! Tôi là trợ lý sức khỏe AI (Gemini). Bạn có thể gửi câu hỏi hoặc hình ảnh bệnh án để tôi tư vấn.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [maPhienChat, setMaPhienChat] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.warning("File quá lớn. Vui lòng chọn ảnh dưới 5MB.");
                return;
            }
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    // Clear selected file
    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async () => {
        // Debugging: Log user object to check if userId exists
        // console.log("Current User:", user); 

        if (!user) {
            toast.error("Vui lòng đăng nhập để chat.");
            return;
        }

        if (!input.trim() && !selectedFile) return;

        // 1. Create User Message for UI
        const userMsg = {
            role: 'user',
            content: input,
            image: previewUrl
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Store file reference before clearing for API call
        const fileToSend = selectedFile;
        clearFile();

        try {
            // 2. Prepare Payload
            // Assuming your backend expects JSON. If it supports file upload, 
            // you might need to change this to FormData.
            // For now, we follow the existing text-based logic.

            let contentToSend = userMsg.content;

            // Note: This only sends the FILE NAME. 
            // To actually analyze the image, you need to implement file upload in backend 
            // or convert image to Base64 here.
            if (fileToSend) {
                contentToSend += ` [Đã đính kèm ảnh: ${fileToSend.name}]`;
                // TODO: If backend supports Base64, convert fileToSend to Base64 here and add to payload
            }

            // CHECK: Verify the property name for user ID in your AuthContext (e.g., userId vs id vs MaNguoiDung)
            const userId = user.userId || user.maNguoiDung || user.id;

            const payload = {
                MaNguoiDung: userId,
                MaPhienChat: maPhienChat, // Can be null for new session
                NoiDung: contentToSend
            };

            const response = await api.post('/Chat/send', payload);

            if (response.data) {
                const botReply = response.data.BotReply || response.data.botReply; // Check case sensitivity
                const newSessionId = response.data.MaPhienChat || response.data.maPhienChat;

                if (!maPhienChat && newSessionId) setMaPhienChat(newSessionId);

                setMessages(prev => [...prev, { role: 'model', content: botReply }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', content: 'Xin lỗi, tôi không thể kết nối đến máy chủ lúc này. Vui lòng thử lại sau.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handlePromptClick = (text) => {
        setInput(text);
    };

    if (!user) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2>Vui lòng đăng nhập</h2>
                <p>Bạn cần đăng nhập để sử dụng tính năng Chat AI.</p>
                <a href="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>Đăng nhập ngay</a>
            </div>
        );
    }

    return (
        <div className="chat-layout">
            {/* SIDEBAR */}
            <div className="chat-sidebar">
                <button className="new-chat-btn" onClick={() => { setMessages([]); setMaPhienChat(null); }}>
                    <Plus size={18} /> Cuộc Trò Chuyện Mới
                </button>

                <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Gần đây</h4>
                <div className="history-list">
                    <div className="history-item"><MessageSquare size={16} /> Tư vấn sức khỏe</div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar user" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                        {user.hoTen ? user.hoTen.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {user.hoTen || user.name || "Người dùng"}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Thành viên</div>
                    </div>
                </div>
            </div>

            {/* MAIN CHAT */}
            <div className="chat-main">
                {/* Header */}
                <div className="chat-header">
                    <Bot color="var(--primary)" /> Trợ Lý Sức Khỏe Gemini
                    <div style={{ marginLeft: 'auto' }}>
                        <MoreHorizontal size={20} color="#94a3b8" style={{ cursor: 'pointer' }} />
                    </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
                            <div className={`avatar ${msg.role === 'user' ? 'user' : 'bot'}`}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                                <div className="message-content">
                                    {msg.content}
                                </div>
                                {msg.image && (
                                    <img src={msg.image} alt="uploaded" className="attached-image" />
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message-row bot">
                            <div className="avatar bot"><Bot size={18} /></div>
                            <div className="message-content" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <Loader className="animate-spin" size={16} />
                                <span>Đang suy nghĩ...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    {previewUrl && (
                        <div className="preview-container">
                            <img src={previewUrl} alt="Preview" className="preview-img" />
                            <button onClick={clearFile} className="remove-preview"><X size={12} /></button>
                        </div>
                    )}

                    <div className="input-wrapper">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*,.pdf,.doc"
                            onChange={handleFileSelect}
                        />

                        <button className="action-btn" onClick={() => fileInputRef.current.click()} title="Đính kèm ảnh/file">
                            <Plus size={20} />
                        </button>

                        <textarea
                            className="chat-textarea"
                            placeholder="Nhập triệu chứng hoặc tải ảnh bệnh án..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />

                        <button
                            onClick={handleSend}
                            disabled={loading || (!input.trim() && !selectedFile)}
                            className="action-btn send-btn"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px' }}>
                        AI có thể mắc lỗi. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatAI;