import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Calendar, Activity, DollarSign, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [recentPatients, setRecentPatients] = useState([]);
    const [stats, setStats] = useState([
        { title: "Bệnh Nhân Hôm Nay", value: "0", icon: <Users size={24} />, color: "bg-blue-500" },
        { title: "Lịch Hẹn Sắp Tới", value: "0", icon: <Calendar size={24} />, color: "bg-purple-500" },
        { title: "Tổng Ca Khám", value: "0", icon: <Activity size={24} />, color: "bg-emerald-500" },
        { title: "Doanh Thu Tháng", value: "0 ₫", icon: <DollarSign size={24} />, color: "bg-amber-500" },
    ]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Hoàn thành</span>;
            case 'Confirmed': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Đã xác nhận</span>;
            case 'Pending': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">Chờ duyệt</span>;
            case 'Cancelled': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">Đã hủy</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy giá khám (Backend trả về giaKham)
                const profileRes = await api.get('/Doctor/profile');
                const pricePerVisit = profileRes.data.giaKham || 0;

                // 2. Lấy lịch hẹn
                const scheduleRes = await api.get('/Doctor/schedule');
                const appointments = scheduleRes.data;

                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                // a. Bệnh nhân hôm nay (ngayHen)
                const todayPatients = appointments.filter(a => {
                    if (!a.ngayHen) return false;
                    const apptDate = new Date(a.ngayHen);
                    return apptDate.getDate() === today.getDate() &&
                        apptDate.getMonth() === currentMonth &&
                        apptDate.getFullYear() === currentYear;
                }).length;

                // b. Sắp tới (trangThai, ngayHen)
                const upcoming = appointments.filter(a =>
                    (a.trangThai === 'Pending' || a.trangThai === 'Confirmed') &&
                    new Date(a.ngayHen) >= today
                ).length;

                // c. Tổng ca (trangThai)
                const completedTotal = appointments.filter(a => a.trangThai === 'Completed').length;

                // d. Doanh thu
                const completedThisMonth = appointments.filter(a => {
                    if (!a.ngayHen) return false;
                    const d = new Date(a.ngayHen);
                    return a.trangThai === 'Completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                }).length;
                const monthlyRevenue = completedThisMonth * pricePerVisit;

                setStats([
                    { title: "Bệnh Nhân Hôm Nay", value: todayPatients, icon: <Users size={24} />, color: "bg-blue-500" },
                    { title: "Lịch Hẹn Sắp Tới", value: upcoming, icon: <Calendar size={24} />, color: "bg-purple-500" },
                    { title: "Tổng Ca Khám", value: completedTotal, icon: <Activity size={24} />, color: "bg-emerald-500" },
                    { title: "Doanh Thu Tháng", value: formatCurrency(monthlyRevenue), icon: <DollarSign size={24} />, color: "bg-amber-500" },
                ]);

                setRecentPatients(appointments.slice(0, 5));

            } catch (error) {
                console.error("Lỗi tải dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Bảng Điều Khiển</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-lg shadow-gray-200`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Lịch Khám Gần Đây</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-500 text-sm">
                                <th className="py-3 px-4">Họ Tên</th>
                                <th className="py-3 px-4">Ngày Hẹn</th>
                                <th className="py-3 px-4">Giờ</th>
                                <th className="py-3 px-4">Lý Do Khám</th>
                                <th className="py-3 px-4">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPatients.length === 0 ? (
                                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Chưa có dữ liệu.</td></tr>
                            ) : (
                                recentPatients.map((item) => (
                                    <tr key={item.maLichHen} className="border-b border-slate-50 hover:bg-slate-50">
                                        {/* SỬA LỖI Ở ĐÂY: Dùng camelCase (chữ thường đầu) */}
                                        <td className="py-3 px-4 font-medium text-slate-700">{item.tenBenhNhan}</td>
                                        <td className="py-3 px-4 text-slate-600">{formatDate(item.ngayHen)}</td>
                                        <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.gioHen}</td>
                                        <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]" title={item.lyDoKham}>
                                            {item.lyDoKham || 'Không có ghi chú'}
                                        </td>
                                        <td className="py-3 px-4">{getStatusBadge(item.trangThai)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;