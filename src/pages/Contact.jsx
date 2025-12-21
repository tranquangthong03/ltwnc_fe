import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import * as signalR from "@microsoft/signalr";
// SỬA DÒNG NÀY: Thay UserMd bằng Stethoscope
import { MessageCircle, Send, X, Stethoscope, ChevronLeft, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const Contact = () => {
    const { user } = useContext(AuthContext);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load lịch sử chat khi chọn bác sĩ
    useEffect(() => {
        const loadChatHistory = async () => {
            if (selectedDoctor && connection && user) {
                setLoading(true);
                try {
                    const history = await connection.invoke("LoadChatHistory", 
                        parseInt(user.userId), 
                        selectedDoctor.maBacSi
                    );
                    setMessages(history || []);
                    console.log("📜 Loaded chat history:", history);
                    scrollToBottom();
                } catch (e) {
                    console.error("Error loading history:", e);
                    setMessages([]);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadChatHistory();
    }, [selectedDoctor, connection, user]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/Doctor/public-list');
                setDoctors(res.data);
            } catch (err) {
                setDoctors([
                    { maBacSi: 1, hoTen: "BS. Nguyễn Văn A", chuyenKhoa: "Tim mạch" },
                    { maBacSi: 2, hoTen: "BS. Trần Thị B", chuyenKhoa: "Nhi khoa" }
                ]);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (user && selectedDoctor && !connection) {
            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:5119/chatHub") // Đảm bảo Port đúng (5119)
                .withAutomaticReconnect()
                .build();

            setConnection(newConnection);
        }
    }, [selectedDoctor, user, connection]);

    useEffect(() => {
        if (connection && connection.state === signalR.HubConnectionState.Disconnected) {
            const handleReceiveMessage = (data) => {
                console.log("📩 Received message:", data);
                setMessages(prev => [...prev, {
                    maNguoiGui: data.maNguoiGui,
                    noiDung: data.noiDung,
                    thoiGianGui: data.thoiGianGui
                }]);
                scrollToBottom();
            };

            connection.start()
                .then(() => {
                    console.log("✅ SignalR Connected");
                    connection.invoke("JoinChat", user.userId.toString());
                    
                    // Đăng ký listener
                    connection.on("ReceiveMessage", handleReceiveMessage);
                })
                .catch(e => {
                    console.error("❌ SignalR Connection failed:", e);
                    toast.error("Không thể kết nối chat");
                });

            return () => {
                // Cleanup listener và connection khi unmount
                connection.off("ReceiveMessage", handleReceiveMessage);
                if (connection.state === signalR.HubConnectionState.Connected) {
                    connection.stop();
                }
            };
        }
    }, [connection, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !connection || !selectedDoctor) return;

        try {
            // SendMessage(int maNguoiGui, int maNguoiNhan, string noiDung)
            await connection.invoke("SendMessage", 
                parseInt(user.userId),        // Người gửi (bệnh nhân)
                selectedDoctor.maBacSi,       // Người nhận (bác sĩ)
                input.trim()                  // Nội dung
            );
            setInput('');
            console.log("✅ Message sent");
        } catch (e) {
            console.error("❌ Error sending message:", e);
            toast.error("Lỗi gửi tin nhắn: " + (e.message || "Không xác định"));
        }
    };

    return (
        <div className="page-container relative min-h-screen">
            <div className="card mb-8">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Liên Hệ & Hỗ Trợ</h2>
                <div className="space-y-2 text-slate-600">
                    <p>Hotline: <span className="font-bold text-blue-600">1900 1234</span></p>
                    <p>Email: hotro@websuckhoe.vn</p>
                    <p>Địa chỉ: 123 Đường Sức Khỏe, Quận 1, TP.HCM</p>
                </div>
            </div>

            <div className="fixed bottom-8 right-8 z-50">
                {!isChatOpen ? (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center gap-2"
                    >
                        <MessageCircle size={24} /> Chat với Bác sĩ
                    </button>
                ) : (
                    <div className="bg-white w-80 h-[500px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-fade-in-up">
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md z-10">
                            <div className="flex items-center gap-2">
                                {selectedDoctor && (
                                    <button onClick={() => setSelectedDoctor(null)} className="hover:bg-blue-500 p-1 rounded-full">
                                        <ChevronLeft size={18} />
                                    </button>
                                )}
                                <span className="font-bold text-sm">
                                    {selectedDoctor ? selectedDoctor.hoTen : "Chọn Bác sĩ tư vấn"}
                                </span>
                            </div>
                            <button onClick={() => setIsChatOpen(false)}><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                            {!user ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-slate-500 mb-4">Vui lòng đăng nhập để chat với bác sĩ.</p>
                                    <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Đăng nhập ngay</a>
                                </div>
                            ) : !selectedDoctor ? (
                                <div className="p-2 space-y-2">
                                    {doctors.map(doc => (
                                        <div
                                            key={doc.maBacSi}
                                            onClick={() => setSelectedDoctor(doc)}
                                            className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                {/* SỬA DÒNG NÀY: Dùng Stethoscope thay vì UserMd */}
                                                <Stethoscope size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{doc.hoTen}</p>
                                                <p className="text-xs text-slate-400">{doc.chuyenKhoa}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 space-y-3 pb-4">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-full py-8">
                                            <Loader className="animate-spin text-blue-600" size={32} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <p className="text-center text-xs text-slate-400 mt-4">Bắt đầu cuộc trò chuyện...</p>
                                    ) : (
                                        messages.map((m, idx) => {
                                            const isMe = m.maNguoiGui === parseInt(user.userId);
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-2.5 rounded-xl text-sm shadow-sm ${
                                                        isMe
                                                            ? 'bg-blue-500 text-white rounded-br-none'
                                                            : 'bg-white border text-slate-700 rounded-bl-none'
                                                    }`}>
                                                        {m.noiDung}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {user && selectedDoctor && (
                            <div className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                                <input
                                    className="flex-1 text-sm outline-none bg-slate-50 px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-300 transition-all"
                                    placeholder="Nhập tin nhắn..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contact;