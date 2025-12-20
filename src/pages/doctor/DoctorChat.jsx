import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import * as signalR from "@microsoft/signalr";
import { Send, User, Search, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DoctorChat = () => {
    const { user } = useContext(AuthContext);
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [patients, setPatients] = useState([]); // Danh sách bệnh nhân đã nhắn tin
    const [selectedPatient, setSelectedPatient] = useState(null);
    const messagesEndRef = useRef(null);

    // 1. Kết nối SignalR
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5119/chatHub") // Đổi port Backend
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    // 2. Start và Join Room Bác sĩ
    useEffect(() => {
        if (connection && user) {
            connection.start()
                .then(() => {
                    console.log("Doctor Connected SignalR");
                    connection.invoke("JoinChat", user.userId.toString());

                    // Nhận tin nhắn Realtime
                    connection.on("ReceiveMessage", (role, msg, time) => {
                        // Thêm tin nhắn vào khung chat nếu đang mở đúng bệnh nhân đó
                        setMessages(prev => [...prev, { vaiTro: role, noiDung: msg, thoiGianGui: time }]);

                        // Nếu tin nhắn từ bệnh nhân mới, cần reload lại list patients (hoặc xử lý logic update list tại đây)
                        if (role === 'BenhNhan') {
                            toast.info("Có tin nhắn mới!");
                        }
                    });
                })
                .catch(err => console.error("Connection failed: ", err));
        }
    }, [connection, user]);

    // 3. Lấy danh sách bệnh nhân (Giả lập hoặc gọi API lấy từ lịch sử chat)
    useEffect(() => {
        // TODO: Gọi API Backend lấy danh sách những bệnh nhân đã từng chat với bác sĩ này
        // api.get(`/Chat/patients-chat-history/${user.userId}`).then(...)

        // Mock data
        setPatients([
            { id: 2, hoTen: "Trần Văn Bệnh Nhân", lastMsg: "Bác sĩ ơi cho em hỏi..." },
            { id: 5, hoTen: "Lê Thị C", lastMsg: "Cảm ơn bác sĩ" },
        ]);
    }, []);

    const sendMessage = async () => {
        if (connection && input && selectedPatient) {
            try {
                // Gửi tin nhắn: role = BacSi, userId = DoctorID, receiverId = PatientID
                await connection.invoke("SendMessage", "BacSi", parseInt(user.userId), selectedPatient.id, input);
                setInput('');
            } catch (e) {
                console.error(e);
            }
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
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <MessageSquare size={20} className="text-emerald-600" /> Tư vấn trực tuyến
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" placeholder="Tìm bệnh nhân..." />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {patients.map(p => (
                        <div
                            key={p.id}
                            onClick={() => { setSelectedPatient(p); setMessages([]); /* TODO: Load lịch sử chat cũ của BN này */ }}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-all border-b border-slate-100 
                                ${selectedPatient?.id === p.id ? 'bg-white border-l-4 border-l-emerald-500 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                <User size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-700 text-sm truncate">{p.hoTen}</p>
                                <p className="text-xs text-slate-500 truncate">{p.lastMsg}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedPatient ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3 shadow-sm z-10">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                {selectedPatient.hoTen.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{selectedPatient.hoTen}</h4>
                                <span className="text-xs text-green-500 flex items-center gap-1">● Đang hoạt động</span>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                            {messages.map((m, index) => (
                                <div key={index} className={`flex ${m.vaiTro === 'BacSi' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm shadow-sm ${m.vaiTro === 'BacSi'
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                        }`}>
                                        {m.noiDung}
                                        <p className={`text-[10px] mt-1 text-right ${m.vaiTro === 'BacSi' ? 'text-emerald-100' : 'text-slate-400'}`}>
                                            {m.thoiGianGui ? new Date(m.thoiGianGui).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                                        </p>
                                    </div>
                                </div>
                            ))}
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