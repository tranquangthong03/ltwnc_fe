import React from 'react';
import { Users, Stethoscope, Calendar, TrendingUp, DollarSign, Activity, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
    // Dữ liệu giả lập (Sau này bạn sẽ thay bằng API fetch từ backend)
    const stats = [
        { title: "Tổng Người dùng", value: "1,250", icon: <Users size={24} />, color: "bg-blue-500", trend: "+12%" },
        { title: "Bác sĩ", value: "45", icon: <Stethoscope size={24} />, color: "bg-emerald-500", trend: "+5%" },
        { title: "Lịch hẹn hôm nay", value: "28", icon: <Calendar size={24} />, color: "bg-violet-500", trend: "+18%" },
        { title: "Doanh thu tháng", value: "150tr", icon: <DollarSign size={24} />, color: "bg-amber-500", trend: "+8%" },
    ];

    const recentActivities = [
        { id: 1, user: "Nguyễn Văn A", action: "đã đặt lịch khám", time: "5 phút trước" },
        { id: 2, user: "Trần Thị B", action: "đăng ký gói khám tổng quát", time: "15 phút trước" },
        { id: 3, user: "BS. Lê Tuấn", action: "cập nhật hồ sơ", time: "1 giờ trước" },
        { id: 4, user: "Phạm Văn C", action: "hủy lịch hẹn", time: "2 giờ trước" },
    ];

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            {/* 1. Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Tổng quan hệ thống</h1>
                <p className="text-slate-500 mt-2">Chào mừng trở lại, Admin! Đây là báo cáo hôm nay của bạn.</p>
            </div>

            {/* 2. Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
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
                            <span className="text-slate-400 ml-2">so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cột trái: Biểu đồ hoặc Danh sách chính (Chiếm 2 phần) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Giả lập biểu đồ doanh thu bằng CSS đơn giản */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Thống kê truy cập</h3>
                            <button className="text-blue-600 text-sm font-medium hover:underline">Xem chi tiết</button>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group">
                                    <div 
                                        style={{ height: `${h}%` }} 
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                                    ></div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded transition-opacity">
                                        {h * 10} lượt
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase">
                            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                        </div>
                    </div>

                    {/* Quick Actions (Thay thế cho Service Card cũ) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Quản lý Bác sĩ</h3>
                            <p className="text-indigo-100 text-sm mb-4">Thêm mới, xét duyệt hoặc chỉnh sửa thông tin đội ngũ y tế.</p>
                            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Truy cập ngay
                            </button>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Quản lý Gói khám</h3>
                            <p className="text-pink-100 text-sm mb-4">Cập nhật giá, dịch vụ và các ưu đãi mới cho khách hàng.</p>
                            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Truy cập ngay
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Hoạt động gần đây (Chiếm 1 phần) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500"/> Hoạt động gần đây
                    </h3>
                    <div className="space-y-6">
                        {recentActivities.map((act) => (
                            <div key={act.id} className="flex gap-4 relative pl-4 border-l-2 border-slate-100 pb-2 last:pb-0">
                                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                <div>
                                    <p className="text-sm text-slate-800 font-medium">
                                        <span className="font-bold text-blue-600">{act.user}</span> {act.action}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        Xem tất cả <ArrowUpRight size={16}/>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;