import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Users, 
    Stethoscope, 
    Calendar, 
    TrendingUp, 
    DollarSign, 
    Activity, 
    ArrowUpRight 
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        appointmentsToday: 0,
        monthlyRevenue: 0,
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/Admin/dashboard-stats');
                setStats(res.data);
            } catch (error) {
                console.error("Lỗi tải dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    };

    const statCards = [
        { title: "Tổng Bệnh nhân", value: stats.totalPatients, icon: <Users size={24} />, color: "bg-blue-500", trend: "Hoạt động" },
        { title: "Bác sĩ", value: stats.totalDoctors, icon: <Stethoscope size={24} />, color: "bg-emerald-500", trend: "Đội ngũ" },
        { title: "Lịch hẹn hôm nay", value: stats.appointmentsToday, icon: <Calendar size={24} />, color: "bg-violet-500", trend: "Hôm nay" },
        { title: "Doanh thu tháng", value: formatCurrency(stats.monthlyRevenue), icon: <DollarSign size={24} />, color: "bg-amber-500", trend: "Tháng này" },
    ];

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Đang tải dữ liệu tổng quan...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Tổng quan hệ thống</h1>
                <p className="text-slate-500 mt-2">Chào mừng trở lại! Đây là báo cáo số liệu mới nhất.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg shadow-opacity-20`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-emerald-500 flex items-center font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp size={14} className="mr-1" /> {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. Card Quản lý Bác sĩ - Màu Tím chuẩn hình cũ */}
                        <div className="bg-[#7C3AED] p-8 rounded-2xl text-white shadow-lg relative overflow-hidden h-52 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Quản lý Bác sĩ</h3>
                                <p className="text-white/80 text-sm">Thêm mới, xét duyệt hoặc chỉnh sửa thông tin đội ngũ y tế.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/admin/doctors')}
                                className="w-fit bg-[#A78BFA] hover:bg-[#9061F9] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-none cursor-pointer"
                            >
                                Truy cập ngay
                            </button>
                        </div>

                        {/* 2. Card Quản lý Gói khám - Màu Hồng chuẩn hình cũ */}
                        <div className="bg-[#E11D48] p-8 rounded-2xl text-white shadow-lg relative overflow-hidden h-52 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Quản lý Gói khám</h3>
                                <p className="text-white/80 text-sm">Cập nhật giá, dịch vụ và các ưu đãi mới cho khách hàng.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/admin/packages')}
                                className="w-fit bg-[#FB7185] hover:bg-[#F43F5E] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-none cursor-pointer"
                            >
                                Truy cập ngay
                            </button>
                        </div>

                    </div>
                </div>

                {/* Hoạt động mới */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" /> Hoạt động mới
                    </h3>
                    <div className="space-y-6 flex-grow">
                        {stats.recentActivities.map((act) => (
                            <div key={act.id} className="flex gap-4 relative pl-4 border-l-2 border-slate-100 pb-2 last:pb-0">
                                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                <div>
                                    <p className="text-sm text-slate-800">
                                        <span className="font-bold text-blue-600">{act.user}</span> {act.action}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">{formatTime(act.time)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => navigate('/admin/appointments')}
                        className="mt-6 w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer bg-white"
                    >
                        Xem tất cả lịch hẹn <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;