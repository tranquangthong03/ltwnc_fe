import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

const ManageAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('ChoDuyet'); // 'ChoDuyet', 'DaDuyet', 'HoanThanh'

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/Appointment');
            setAppointments(res.data);
        } catch (error) {
            // Mock data
            setAppointments([
                { maLichHen: 101, benhNhan: 'Nguyễn Văn A', bacSi: 'BS. Tuấn', ngayGioHen: '2025-12-20T09:00:00', trangThai: 'ChoDuyet', lyDo: 'Đau đầu' },
                { maLichHen: 102, benhNhan: 'Trần Thị B', bacSi: 'BS. Lan', ngayGioHen: '2025-12-21T14:30:00', trangThai: 'DaDuyet', lyDo: 'Khám định kỳ' },
            ]);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/Appointment/${id}/status`, { status });
            toast.success(`Đã chuyển trạng thái: ${status}`);
            setAppointments(appointments.map(a => a.maLichHen === id ? { ...a, trangThai: status } : a));
        } catch (error) { toast.error("Lỗi cập nhật"); }
    };

    const filteredList = appointments.filter(a => filter === 'All' ? true : a.trangThai === filter);

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
                {filteredList.length === 0 ? <p className="text-center text-slate-500 py-10">Không có lịch hẹn nào.</p> :
                filteredList.map(apt => (
                    <div key={apt.maLichHen} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <CalendarCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">BN: {apt.benhNhan} <span className="text-slate-400 font-normal">đặt với</span> {apt.bacSi}</h4>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(apt.ngayGioHen).toLocaleString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[apt.trangThai]}`}>{apt.trangThai}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1 italic">"Lý do: {apt.lyDo}"</p>
                            </div>
                        </div>

                        {/* Actions */}
                        {apt.trangThai === 'ChoDuyet' && (
                            <div className="flex gap-2">
                                <button onClick={() => updateStatus(apt.maLichHen, 'DaDuyet')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium flex items-center gap-2">
                                    <CheckCircle size={16}/> Duyệt
                                </button>
                                <button onClick={() => updateStatus(apt.maLichHen, 'DaHuy')} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium flex items-center gap-2">
                                    <XCircle size={16}/> Hủy
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