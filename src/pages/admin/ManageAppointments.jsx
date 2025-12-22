import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

const ManageAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('ChoDuyet'); // 'ChoDuyet', 'DaDuyet', 'HoanThanh', 'DaHuy'

    const fetchAppointments = async () => {
        try {
            // SỬA: Gọi API Admin thay vì /Appointment
            const res = await api.get('/Admin/appointments');
            setAppointments(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch hẹn:", error);
            toast.error("Không tải được danh sách lịch hẹn");
            setAppointments([]); // Xóa mock data để tránh hiểu nhầm
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const updateStatus = async (id, status) => {
        try {
            // SỬA: Gọi API Admin đúng endpoint
            await api.put(`/Admin/appointment/${id}/status`, { status });
            toast.success(`Đã chuyển trạng thái: ${status}`);

            // Cập nhật lại state ngay lập tức mà không cần load lại trang
            setAppointments(appointments.map(a =>
                a.maLichHen === id ? { ...a, trangThai: status } : a
            ));
        } catch (error) {
            console.error(error);
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    // Logic lọc danh sách theo tab hiện tại
    const filteredList = appointments.filter(a => {
        const status = a.trangThai || a.TrangThai;
        return filter === 'All' ? true : status === filter;
    });

    const statusColors = {
        'ChoDuyet': 'bg-yellow-100 text-yellow-700',
        'DaDuyet': 'bg-blue-100 text-blue-700',
        'HoanThanh': 'bg-emerald-100 text-emerald-700',
        'DaHuy': 'bg-red-100 text-red-700'
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Quản lý Lịch hẹn</h2>

            {/* Tabs Filter */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2 overflow-x-auto">
                {['ChoDuyet', 'DaDuyet', 'HoanThanh', 'DaHuy'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                            ${filter === status ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                        {status === 'ChoDuyet' ? 'Chờ duyệt' : status === 'DaDuyet' ? 'Đã duyệt' : status === 'HoanThanh' ? 'Hoàn thành' : 'Đã hủy'}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredList.length === 0 ? <p className="text-center text-slate-500 py-10">Không có lịch hẹn nào ở trạng thái này.</p> :
                    filteredList.map(apt => (
                        <div key={apt.maLichHen || apt.MaLichHen} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <CalendarCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">
                                        BN: {apt.benhNhan || apt.BenhNhan} <span className="text-slate-400 font-normal">đặt với</span> {apt.bacSi || apt.BacSi}
                                    </h4>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> {new Date(apt.ngayGioHen || apt.NgayGioHen).toLocaleString('vi-VN')}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[apt.trangThai || apt.TrangThai]}`}>
                                            {apt.trangThai || apt.TrangThai}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 italic">"Lý do: {apt.lyDo || apt.LyDo}"</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {(apt.trangThai || apt.TrangThai) === 'ChoDuyet' && (
                                <div className="flex gap-2">
                                    <button onClick={() => updateStatus(apt.maLichHen || apt.MaLichHen, 'DaDuyet')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium flex items-center gap-2">
                                        <CheckCircle size={16} /> Duyệt
                                    </button>
                                    <button onClick={() => updateStatus(apt.maLichHen || apt.MaLichHen, 'DaHuy')} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium flex items-center gap-2">
                                        <XCircle size={16} /> Hủy
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};
export default ManageAppointments;