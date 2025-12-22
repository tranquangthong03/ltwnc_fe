import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Footer from '../components/Footer';
import * as signalR from "@microsoft/signalr";
import {
    MessageCircle, Send, X, Stethoscope, ChevronLeft, Loader,
    Phone, Mail, Clock, HelpCircle, ChevronDown, ChevronUp, User
} from 'lucide-react'; // Đã thêm User, bỏ MapPin
import { toast } from 'react-toastify';

const Contact = () => {
    // --- LOGIC CHAT (GIỮ NGUYÊN) ---
    const { user } = useContext(AuthContext);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // State cho FAQ
    const [openFaq, setOpenFaq] = useState(null);

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
                .withUrl("http://localhost:5119/chatHub")
                .withAutomaticReconnect()
                .build();
            setConnection(newConnection);
        }
    }, [selectedDoctor, user, connection]);

    useEffect(() => {
        if (connection && connection.state === signalR.HubConnectionState.Disconnected) {
            const handleReceiveMessage = (data) => {
                setMessages(prev => [...prev, {
                    maNguoiGui: data.maNguoiGui,
                    noiDung: data.noiDung,
                    thoiGianGui: data.thoiGianGui
                }]);
                scrollToBottom();
            };

            connection.start()
                .then(() => {
                    connection.invoke("JoinChat", user.userId.toString());
                    connection.on("ReceiveMessage", handleReceiveMessage);
                })
                .catch(e => console.error("SignalR Error:", e));

            return () => {
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
            await connection.invoke("SendMessage", parseInt(user.userId), selectedDoctor.maBacSi, input.trim());
            setInput('');
        } catch (e) {
            toast.error("Lỗi gửi tin nhắn");
        }
    };

    const faqs = [
        { q: "Làm sao để đặt lịch khám?", a: "Bạn có thể đặt lịch trực tuyến qua website hoặc gọi đến hotline 1900 1234." },
        { q: "Phòng khám có làm việc cuối tuần không?", a: "Chúng tôi làm việc tất cả các ngày trong tuần, từ 7:00 - 20:00." },
        { q: "Tôi có thể hủy lịch hẹn không?", a: "Có, bạn có thể hủy lịch trước 24h trong phần Quản lý lịch hẹn." }
    ];

    return (
        <div className="bg-white min-h-screen py-10 px-4 md:px-8 font-sans text-slate-700">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* --- HEADER --- */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-emerald-800">Liên Hệ Với Chúng Tôi</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ qua các kênh dưới đây.
                    </p>
                </div>

                {/* --- INFO CARDS (XANH LÁ) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-14 h-14 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-xl text-emerald-900 mb-2">Hotline 24/7</h3>
                        <p className="text-emerald-700/70">Gọi ngay để được tư vấn</p>
                        <p className="text-emerald-700 font-bold text-lg mt-2">1900 1234</p>
                    </div>
                    <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-14 h-14 bg-white text-teal-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-xl text-teal-900 mb-2">Email Hỗ Trợ</h3>
                        <p className="text-teal-700/70">Gửi thắc mắc qua email</p>
                        <p className="text-teal-700 font-bold text-lg mt-2">hotro@websuckhoe.vn</p>
                    </div>
                    <div className="bg-green-50 p-8 rounded-2xl border border-green-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-14 h-14 bg-white text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-bold text-xl text-green-900 mb-2">Giờ Làm Việc</h3>
                        <p className="text-green-700/70">Tất cả các ngày trong tuần</p>
                        <p className="text-green-700 font-bold text-lg mt-2">07:00 - 20:00</p>
                    </div>
                </div>

                {/* --- CONTACT FORM & MAP --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Gửi Tin Nhắn */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg shadow-emerald-100/50 border border-emerald-50">
                        <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
                            <MessageCircle className="text-emerald-600" /> Gửi thắc mắc
                        </h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Họ tên</label>
                                    <input className="w-4/5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">Email</label>
                                    <input className="w-4/5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="email@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Chủ đề</label>
                                <input className="w-4/5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" placeholder="Vấn đề cần hỗ trợ..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">Nội dung</label>
                                <textarea className="w-4/5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none h-32 resize-none transition-all" placeholder="Nhập nội dung chi tiết..."></textarea>
                            </div>
                            <button type="button" className="w-4/5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 transform hover:-translate-y-0.5">
                                Gửi Tin Nhắn
                            </button>
                        </form>
                    </div>

                    {/* Google Map */}
                    <div className="bg-white p-2 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden h-[500px] lg:h-auto">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.77954767773!2d108.21102737510942!3d16.07692563923191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421847f125d0a9%3A0x936779884318eeca!2zNDggQ2FvIFRo4bqvbmcsIFRoYW5oIELDrG5oLCBI4bqjaSBDaMOidSwgxJDDoCBO4bq1bmcgNTUwMDAwLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1766386685586!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0, borderRadius: '12px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Map"
                        ></iframe>
                    </div>
                </div>

                {/* --- FAQ SECTION --- */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-emerald-800 mb-8 flex items-center justify-center gap-2">
                        <HelpCircle className="text-emerald-500" /> Câu Hỏi Thường Gặp
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-4/5 flex justify-between items-center p-5 text-left bg-white hover:bg-emerald-50/50 transition-colors"
                                >
                                    <span className="font-bold text-emerald-900">{faq.q}</span>
                                    {openFaq === idx ? <ChevronUp className="text-emerald-600" /> : <ChevronDown className="text-emerald-400" />}
                                </button>
                                {openFaq === idx && (
                                    <div className="p-5 pt-0 text-slate-600 border-t border-emerald-50 bg-emerald-50/30">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CHAT WIDGET (XANH LÁ) --- */}
            <div className="fixed bottom-8 right-8 z-50">
                {!isChatOpen ? (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-4 rounded-full shadow-2xl shadow-emerald-600/40 transition-transform hover:scale-110 flex items-center gap-2 animate-bounce-slow"
                    >
                        <MessageCircle size={28} />
                        <span className="font-bold pr-2">Chat với BS</span>
                    </button>
                ) : (
                    <div className="bg-white w-80 sm:w-96 h-[550px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-scale-in">
                        {/* Header Chat */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex justify-between items-center shadow-md z-10">
                            <div className="flex items-center gap-2">
                                {selectedDoctor && (
                                    <button onClick={() => setSelectedDoctor(null)} className="hover:bg-white/20 p-1 rounded-full transition">
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">
                                        {selectedDoctor ? selectedDoctor.hoTen : "Tư vấn sức khỏe"}
                                    </span>
                                    <span className="text-[10px] opacity-90 flex items-center gap-1 font-medium">
                                        <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div> Trực tuyến
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
                        </div>

                        {/* Body Chat */}
                        <div className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
                            {!user ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                        <User size={32} />
                                    </div>
                                    <p className="text-slate-500 mb-4 font-medium">Vui lòng đăng nhập để được bác sĩ tư vấn trực tiếp.</p>
                                    <a href="/login" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all">Đăng nhập ngay</a>
                                </div>
                            ) : !selectedDoctor ? (
                                <div className="p-2 space-y-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">Bác sĩ đang trực tuyến</p>
                                    {doctors.map(doc => (
                                        <div
                                            key={doc.maBacSi}
                                            onClick={() => setSelectedDoctor(doc)}
                                            className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                                <Stethoscope size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm group-hover:text-emerald-700">{doc.hoTen}</p>
                                                <p className="text-xs text-slate-400 font-medium">{doc.chuyenKhoa}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 space-y-3 pb-4">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-full py-10">
                                            <Loader className="animate-spin text-emerald-600" size={32} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center mt-10">
                                            <p className="text-sm text-slate-400">Chưa có tin nhắn nào.</p>
                                            <p className="text-xs text-slate-300">Hãy bắt đầu bằng lời chào!</p>
                                        </div>
                                    ) : (
                                        messages.map((m, idx) => {
                                            const isMe = m.maNguoiGui === parseInt(user.userId);
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${isMe
                                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
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

                        {/* Input Area */}
                        {user && selectedDoctor && (
                            <div className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                                <input
                                    className="flex-1 text-sm outline-none bg-slate-50 px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-100 border border-transparent focus:border-emerald-200 transition-all font-medium"
                                    placeholder="Nhập tin nhắn..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 shadow-emerald-200"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
            `}</style>
            <Footer />
        </div>
    );

};

export default Contact;