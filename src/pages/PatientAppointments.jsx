import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
// SỬA LỖI Ở ĐÂY: Import đầy đủ các icon từ lucide-react
import { Clock, User, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';

const PatientAppointments = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user) return;
            try {
                const res = await api.get('/Patient/appointments');
                setAppointments(res.data);
            } catch (error) {
                console.error("Lỗi tải lịch hẹn:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [user]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Đã duyệt</span>;
            case 'Pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Chờ duyệt</span>;
            case 'Completed': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Hoàn thành</span>;
            case 'Cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Đã hủy</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="container mx-auto px-4 py-10 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">Lịch Sử Khám Bệnh</h2>

            {appointments.length === 0 ? (
                <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">Bạn chưa có lịch hẹn nào.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {appointments.map((item) => (
                        <div key={item.maLichHen} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center font-bold border border-blue-100">
                                    <span className="text-lg">{new Date(item.ngayGioHen).getDate()}</span>
                                    <span className="text-xs uppercase">Tháng {new Date(item.ngayGioHen).getMonth() + 1}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <User size={18} className="text-blue-500" /> {item.tenBacSi}
                                    </h4>
                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                        <Clock size={14} /> {new Date(item.ngayGioHen).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        <span className="mx-2 text-slate-300">|</span>
                                        {item.chuyenKhoa}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                                {getStatusBadge(item.trangThai)}
                                <p className="text-sm text-slate-600 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg max-w-xs truncate">
                                    <FileText size={14} className="text-slate-400" />
                                    Lý do: {item.lyDoKham}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;