import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const DoctorSchedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = async () => {
        try {
            const response = await api.get(`/Doctor/schedule`);
            setAppointments(response.data);
        } catch (error) {
            console.error("Lỗi tải lịch hẹn:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSchedule(); }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            // Gửi status tiếng Việt nếu backend trả về tiếng Việt
            await api.put(`/Doctor/appointment/${id}/status`, { status });
            toast.success("Đã cập nhật trạng thái!");
            fetchSchedule();
        } catch (error) {
            toast.error("Lỗi cập nhật.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': 
            case 'DaDuyet':
                return 'bg-green-100 text-green-700';
            case 'Pending': 
            case 'ChoDuyet':
                return 'bg-yellow-100 text-yellow-700';
            case 'Cancelled': 
            case 'DaHuy':
                return 'bg-red-100 text-red-700';
            case 'Completed': 
            case 'DaKham':
                return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Confirmed': 
            case 'DaDuyet':
                return 'Đã xác nhận';
            case 'Pending': 
            case 'ChoDuyet':
                return 'Chờ duyệt';
            case 'Cancelled': 
            case 'DaHuy':
                return 'Đã hủy';
            case 'Completed': 
            case 'DaKham':
                return 'Đã khám';
            default: return status;
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto" /> Đang tải lịch...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Lịch Hẹn Khám</h1>
                <div className="flex gap-2">
                    <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center gap-2">
                        <Calendar size={18} /> Làm mới
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {appointments.length > 0 ? appointments.map((app) => (
                    <div key={app.maLichHen} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center font-bold border border-blue-100">
                                {/* Sửa: gioHen */}
                                <span className="text-xl">{app.gioHen ? app.gioHen.substring(0, 5) : "--:--"}</span>
                            </div>
                            <div>
                                {/* Sửa: tenBenhNhan */}
                                <h3 className="font-bold text-lg text-slate-800">{app.tenBenhNhan || "Bệnh nhân ẩn"}</h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {/* Sửa: ngayHen */}
                                        {app.ngayHen ? new Date(app.ngayHen).toLocaleDateString('vi-VN') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                {/* Sửa: lyDoKham, trangThai */}
                                <p className="text-sm font-medium text-slate-700 max-w-[200px] truncate">{app.lyDoKham || "Khám bệnh"}</p>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 inline-block ${getStatusColor(app.trangThai)}`}>
                                    {getStatusText(app.trangThai)}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                {(app.trangThai === 'Pending' || app.trangThai === 'ChoDuyet') && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(app.maLichHen, 'DaDuyet')} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg" title="Duyệt">
                                            <CheckCircle size={20} />
                                        </button>
                                        <button onClick={() => handleUpdateStatus(app.maLichHen, 'DaHuy')} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg" title="Hủy">
                                            <XCircle size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-slate-500 py-10">Chưa có lịch hẹn nào.</p>
                )}
            </div>
        </div>
    );
};

export default DoctorSchedule;