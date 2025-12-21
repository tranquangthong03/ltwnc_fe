import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import * as signalR from "@microsoft/signalr";
import { Send, User, Search, MessageSquare, Loader } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DoctorChat = () => {
    const { user } = useContext(AuthContext);
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [conversations, setConversations] = useState([]); // Danh sách cuộc trò chuyện
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);

    // 1. Khởi tạo SignalR connection
    useEffect(() => {
        if (user && !connection) {
            const token = localStorage.getItem('token');
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:5119/chatHub", {
                    accessTokenFactory: () => token || ''
                })
                .withAutomaticReconnect()
                .build();

            setConnection(newConnection);
        }
    }, [user]);

    // 2. Start connection
    useEffect(() => {
        if (connection && user) {
            connection.start()
                .then(() => {
                    console.log("✅ Doctor SignalR Connected");
                    setIsConnected(true);
                    connection.invoke("JoinChat", user.userId.toString());
                })
                .catch(err => {
                    console.error("❌ Connection failed:", err);
                    setIsConnected(false);
                    toast.error("Không thể kết nối chat");
                });

            return () => {
                if (connection.state === signalR.HubConnectionState.Connected) {
                    connection.stop();
                    setIsConnected(false);
                }
            };
        }
    }, [connection, user]);

    // 3. Lắng nghe tin nhắn mới
    useEffect(() => {
        if (connection) {
            const handleReceiveMessage = (data) => {
                console.log("📩 Doctor received message:", data);
                
                // Nếu tin nhắn thuộc cuộc trò chuyện đang mở
                if (selectedConversation && 
                    (data.maNguoiGui === selectedConversation.maBenhNhan || 
                     data.maNguoiNhan === selectedConversation.maBenhNhan)) {
                    setMessages(prev => [...prev, {
                        maNguoiGui: data.maNguoiGui,
                        noiDung: data.noiDung,
                        thoiGianGui: data.thoiGianGui
                    }]);
                    scrollToBottom();
                }

                // Reload danh sách conversations
                loadConversations();
                
                // Hiển thị toast nếu tin nhắn từ bệnh nhân
                if (data.maNguoiGui !== parseInt(user.userId)) {
                    toast.info("Có tin nhắn mới từ bệnh nhân!");
                }
            };

            connection.on("ReceiveMessage", handleReceiveMessage);

            return () => {
                connection.off("ReceiveMessage", handleReceiveMessage);
            };
        }
    }, [connection, selectedConversation, user]);

    // 4. Load danh sách cuộc trò chuyện
    const loadConversations = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/ChatRealTime/conversations/${user.userId}`);
            setConversations(res.data);
            console.log("📋 Loaded conversations:", res.data);
        } catch (err) {
            console.error("Error loading conversations:", err);
        }
    };

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    // 5. Load lịch sử chat khi chọn cuộc trò chuyện
    const handleSelectConversation = async (conv) => {
        setSelectedConversation(conv);
        setLoading(true);
        try {
            if (connection) {
                const history = await connection.invoke("LoadChatHistory", 
                    parseInt(user.userId), 
                    conv.maBenhNhan
                );
                setMessages(history || []);
                console.log("📜 Loaded history:", history);
                scrollToBottom();

                // Đánh dấu đã đọc
                await api.put(`/ChatRealTime/mark-read/${conv.maCuocTroChuyen}/${user.userId}`);
                loadConversations();
            }
        } catch (e) {
            console.error("Error loading history:", e);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!connection || !input.trim() || !selectedConversation) return;

        // Kiểm tra connection state
        if (connection.state !== signalR.HubConnectionState.Connected) {
            toast.error("Chưa kết nối. Vui lòng chờ...");
            return;
        }

        try {
            // SendMessage(int maNguoiGui, int maNguoiNhan, string noiDung)
            await connection.invoke("SendMessage", 
                parseInt(user.userId),              // Người gửi (bác sĩ)
                selectedConversation.maBenhNhan,    // Người nhận (bệnh nhân)
                input.trim()                        // Nội dung
            );
            setInput('');
            console.log("✅ Message sent");
        } catch (e) {
            console.error("❌ Error sending message:", e);
            toast.error("Lỗi gửi tin nhắn: " + (e.message || "Không xác định"));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare size={20} className="text-emerald-600" /> Tư vấn trực tuyến
                        </h3>
                        {isConnected ? (
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Đã kết nối
                            </span>
                        ) : (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Đang kết nối...
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" placeholder="Tìm bệnh nhân..." />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p className="text-sm">Chưa có tin nhắn nào</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.maCuocTroChuyen}
                                onClick={() => handleSelectConversation(conv)}
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-all border-b border-slate-100 
                                    ${selectedConversation?.maCuocTroChuyen === conv.maCuocTroChuyen ? 'bg-white border-l-4 border-l-emerald-500 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                    <User size={20} />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-slate-700 text-sm truncate">{conv.benhNhan.hoTen}</p>
                                        {conv.soTinNhanChuaDoc > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                                {conv.soTinNhanChuaDoc}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {conv.tinNhanCuoi?.noiDung || 'Chưa có tin nhắn'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3 shadow-sm z-10">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                {selectedConversation.benhNhan.hoTen.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{selectedConversation.benhNhan.hoTen}</h4>
                                <p className="text-xs text-slate-500">{selectedConversation.benhNhan.email}</p>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader className="animate-spin text-emerald-600" size={32} />
                                </div>
                            ) : messages.length === 0 ? (
                                <p className="text-center text-slate-400 mt-8">Bắt đầu cuộc trò chuyện...</p>
                            ) : (
                                messages.map((m, index) => {
                                    const isMe = m.maNguoiGui === parseInt(user.userId);
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm shadow-sm ${
                                                isMe
                                                    ? 'bg-emerald-600 text-white rounded-br-none'
                                                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                            }`}>
                                                {m.noiDung}
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                    {m.thoiGianGui ? new Date(m.thoiGianGui).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Nhập tin nhắn tư vấn..."
                                    className="flex-1 bg-transparent px-2 py-1 outline-none text-slate-700"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                        <MessageSquare size={64} className="mb-4 text-slate-200" />
                        <p>Chọn một bệnh nhân để bắt đầu tư vấn.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorChat;