import React, { useState, useEffect } from 'react';
import api from '../../services/api'; //
import { Users, Stethoscope, Calendar, TrendingUp, DollarSign, Activity, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        appointmentsToday: 0,
        monthlyRevenue: 0,
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);

    // Fetch Data from Backend
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

    if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu tổng quan...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            {/* 1. Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Tổng quan hệ thống</h1>
                <p className="text-slate-500 mt-2">Chào mừng trở lại! Đây là báo cáo số liệu mới nhất.</p>
            </div>

            {/* 2. Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
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

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột trái: Quick Actions */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Quản lý Bác sĩ</h3>
                            <p className="text-indigo-100 text-sm mb-4">Thêm mới, xét duyệt hoặc chỉnh sửa thông tin đội ngũ y tế.</p>
                            <a href="/admin/doctors" className="inline-block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Truy cập ngay
                            </a>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Quản lý Gói khám</h3>
                            <p className="text-pink-100 text-sm mb-4">Cập nhật giá, dịch vụ và các ưu đãi mới cho khách hàng.</p>
                            <a href="/admin/packages" className="inline-block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Truy cập ngay
                            </a>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Hoạt động gần đây (Real Data) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" /> Hoạt động mới
                    </h3>
                    <div className="space-y-6">
                        {stats.recentActivities.length === 0 ? (
                            <p className="text-slate-400 text-sm">Chưa có hoạt động nào.</p>
                        ) : (
                            stats.recentActivities.map((act) => (
                                <div key={act.id} className="flex gap-4 relative pl-4 border-l-2 border-slate-100 pb-2 last:pb-0">
                                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                    <div>
                                        <p className="text-sm text-slate-800 font-medium">
                                            <span className="font-bold text-blue-600">{act.user}</span> {act.action}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{formatTime(act.time)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <a href="/admin/appointments" className="w-4/5 mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        Xem tất cả lịch hẹn <ArrowUpRight size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;