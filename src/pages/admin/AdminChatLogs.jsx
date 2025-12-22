import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    MessageSquare, User, Clock,
    Bot, Calendar, RefreshCw
} from 'lucide-react';

const AdminChatLogs = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [chatDetails, setChatDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // 1. Gọi API lấy danh sách phiên chat
    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/chat-monitor');
            setSessions(res.data);
            console.log("Dữ liệu sessions:", res.data); // Debug xem key là hoa hay thường
        } catch (error) {
            console.error("Lỗi tải lịch sử chat:", error);
            toast.error("Không thể tải danh sách phiên chat");
        } finally {
            setLoading(false);
        }
    };

    // 2. Gọi API lấy chi tiết (FIXED: Xử lý ID an toàn)
    const handleSelectSession = async (session) => {
        // Tự động lấy ID dù backend trả về MaPhienChat hay maPhienChat
        const sessionId = session.MaPhienChat || session.maPhienChat;

        if (!sessionId) {
            toast.error("Lỗi: Không tìm thấy ID phiên chat");
            return;
        }

        setSelectedSession(session);
        setLoadingDetail(true);
        try {
            const res = await api.get(`/Admin/chat-detail/${sessionId}`);
            setChatDetails(res.data);
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
            toast.error("Không thể tải nội dung cuộc trò chuyện");
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <div className="h-[calc(100vh-64px)] bg-slate-50 flex gap-6 p-6">

            {/* DANH SÁCH PHIÊN CHAT (Bên Trái) */}
            <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-700 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={20} />
                        Lịch sử Tư vấn AI
                    </h2>
                    <button onClick={fetchSessions} title="Tải lại" className="p-2 hover:bg-slate-200 rounded-full transition">
                        <RefreshCw size={16} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {loading ? (
                        <p className="text-center text-slate-400 mt-10">Đang tải...</p>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-slate-400 mt-10">Chưa có dữ liệu.</p>
                    ) : (
                        sessions.map((session, index) => {
                            // Xử lý an toàn các trường dữ liệu (Hoa/Thường)
                            const sId = session.MaPhienChat || session.maPhienChat;
                            const sName = session.TenBenhNhan || session.tenBenhNhan || "Ẩn danh";
                            const sTitle = session.TieuDe || session.tieuDe;
                            const sTime = session.ThoiGianTao || session.thoiGianTao;
                            const sCount = session.SoTinNhan || session.soTinNhan;

                            // Lấy ID của session đang chọn để highlight
                            const currentSelectedId = selectedSession ? (selectedSession.MaPhienChat || selectedSession.maPhienChat) : null;

                            return (
                                <div
                                    key={sId || index} // Fix lỗi "unique key"
                                    onClick={() => handleSelectSession(session)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${currentSelectedId === sId
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-700 text-sm truncate">{sName}</h4>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                            #{sId}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-2">{sTitle}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(sTime)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare size={12} />
                                            {sCount} tin
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* CHI TIẾT TIN NHẮN (Bên Phải) */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {selectedSession ? (
                    <>
                        {/* Header Detail */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {selectedSession.TenBenhNhan || selectedSession.tenBenhNhan || "Ẩn danh"}
                                </h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    Bắt đầu: {formatDate(selectedSession.ThoiGianTao || selectedSession.thoiGianTao)}
                                </p>
                            </div>
                            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                {selectedSession.SoTinNhan || selectedSession.soTinNhan} tin
                            </div>
                        </div>

                        {/* Nội dung chat */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
                            {loadingDetail ? (
                                <div className="flex justify-center items-center h-full text-slate-400">
                                    Đang tải nội dung...
                                </div>
                            ) : chatDetails.length === 0 ? (
                                <div className="text-center text-slate-400 mt-10">Không có tin nhắn nào.</div>
                            ) : (
                                chatDetails.map((msg, idx) => {
                                    // Xử lý an toàn các trường dữ liệu tin nhắn
                                    const mId = msg.MaTinNhan || msg.maTinNhan || idx;
                                    const mSender = msg.Sender || msg.sender;
                                    const mContent = msg.NoiDung || msg.noiDung;
                                    const mTime = msg.ThoiGian || msg.thoiGian;

                                    const isUser = mSender === "Bệnh nhân" || mSender === "user";

                                    return (
                                        <div key={mId} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${isUser ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                                    }`}>
                                                    {isUser ? <User size={16} /> : <Bot size={16} />}
                                                </div>

                                                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                                    }`}>
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>{mContent}</div>
                                                    <div className={`text-[10px] mt-2 text-right opacity-70 ${isUser ? 'text-blue-100' : 'text-slate-400'
                                                        }`}>
                                                        {formatDate(mTime)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} />
                        </div>
                        <p>Chọn phiên chat để xem chi tiết</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatLogs;