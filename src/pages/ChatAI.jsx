// src/pages/ChatAI.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Send, Paperclip, Image as ImageIcon, Plus, Bot, User,
    MoreHorizontal, X, MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';

const ChatAI = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { role: 'model', content: 'Xin chào! Tôi là trợ lý sức khỏe AI (Gemini). Bạn có thể gửi câu hỏi hoặc hình ảnh bệnh án để tôi tư vấn.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [maPhienChat, setMaPhienChat] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null); // State file upload
    const [previewUrl, setPreviewUrl] = useState(null);     // State xem trước ảnh

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);

    // Xử lý chọn file
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
                toast.warning("File quá lớn. Vui lòng chọn ảnh dưới 5MB.");
                return;
            }
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    // Xóa file đang chọn
    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedFile) || !user) return;

        // 1. Tạo tin nhắn phía User
        const userMsg = {
            role: 'user',
            content: input,
            image: previewUrl // Lưu ảnh để hiển thị trên UI
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Reset file input ngay lập tức sau khi gửi
        clearFile();

        try {
            // LƯU Ý: Ở đây mình giả lập gửi file bằng cách gửi tên file vào text
            // Nếu Backend hỗ trợ file, bạn cần dùng FormData
            let contentToSend = userMsg.content;
            if (selectedFile) {
                contentToSend += ` [Đã đính kèm ảnh: ${selectedFile.name}]`;
            }

            const response = await api.post('/Chat/send', {
                MaNguoiDung: user.userId,
                MaPhienChat: maPhienChat,
                NoiDung: contentToSend
            });

            const botReply = response.data.BotReply;
            const newSessionId = response.data.MaPhienChat;

            if (!maPhienChat) setMaPhienChat(newSessionId);

            setMessages(prev => [...prev, { role: 'model', content: botReply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', content: 'Xin lỗi, tôi không thể kết nối đến máy chủ lúc này.' }]);
        } finally {
            setLoading(false);
        }
    };

    // Gợi ý nhanh
    const quickPrompts = [
        "Triệu chứng đau đầu kéo dài?",
        "Chế độ ăn cho người tiểu đường?",
        "Lịch tiêm phòng cho trẻ em?"
    ];

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
            {/* SIDEBAR - LỊCH SỬ CHAT */}
            <div className="chat-sidebar">
                <button className="new-chat-btn" onClick={() => { setMessages([]); setMaPhienChat(null); }}>
                    <Plus size={18} /> Cuộc Trò Chuyện Mới
                </button>

                <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Gần đây</h4>
                <div className="history-list">
                    {/* Mock data lịch sử */}
                    <div className="history-item"><MessageSquare size={16} /> Tư vấn đau dạ dày</div>
                    <div className="history-item"><MessageSquare size={16} /> Lịch khám Nhi</div>
                    <div className="history-item"><MessageSquare size={16} /> Chỉ số BMI</div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar user" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                        {user.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Gói Cơ Bản</div>
                    </div>
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="chat-main">
                {/* Header Mobile (Optional) */}
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <Bot color="var(--primary)" /> Trợ Lý Sức Khỏe Gemini
                    </div>
                    <MoreHorizontal size={20} color="#94a3b8" style={{ cursor: 'pointer' }} />
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
                                {/* Hiển thị ảnh nếu có */}
                                {msg.image && (
                                    <img src={msg.image} alt="uploaded" className="attached-image" />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="message-row bot">
                            <div className="avatar bot"><Bot size={18} /></div>
                            <div className="message-content" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <span className="typing-dot" style={{ animationDelay: '0s' }}>•</span>
                                <span className="typing-dot" style={{ animationDelay: '0.2s' }}>•</span>
                                <span className="typing-dot" style={{ animationDelay: '0.4s' }}>•</span>
                            </div>
                        </div>
                    )}

                    {/* Gợi ý nhanh nếu chưa có chat */}
                    {messages.length === 1 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {quickPrompts.map((p, i) => (
                                <button key={i} onClick={() => handlePromptClick(p)} style={{
                                    padding: '8px 15px', borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem'
                                }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    {/* Preview ảnh upload */}
                    {previewUrl && (
                        <div className="preview-container">
                            <img src={previewUrl} alt="Preview" className="preview-img" />
                            <button onClick={clearFile} className="remove-preview"><X size={12} /></button>
                        </div>
                    )}

                    <div className="input-wrapper">
                        {/* Nút Upload File ẩn */}
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
                        AI có thể mắc lỗi. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa cho các quyết định y tế quan trọng.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatAI;