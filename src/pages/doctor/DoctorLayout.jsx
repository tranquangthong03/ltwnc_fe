// src/pages/doctor/DoctorLayout.jsx
import React, { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Calendar, FileText,
    MessageSquare, User, LogOut, HeartPulse
} from 'lucide-react';

const DoctorLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/doctor/dashboard', label: 'Tổng Quan', icon: <LayoutDashboard size={20} /> },
        { path: '/doctor/patients', label: 'Quản Lý Bệnh Nhân', icon: <Users size={20} /> },
        { path: '/doctor/schedule', label: 'Lịch Hẹn Khám', icon: <Calendar size={20} /> },
        { path: '/doctor/diagnosis', label: 'Tạo Phiếu Khám', icon: <FileText size={20} /> },
        { path: '/doctor/profile', label: 'Hồ Sơ Của Tôi', icon: <User size={20} /> },
    ];

    const isActive = (path) => location.pathname === path ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50';

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <HeartPulse size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Doctor Portal</h2>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Healthes System</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive(item.path)}`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                            {user?.name?.charAt(0) || 'BS'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-700 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500">Bác sĩ chuyên khoa</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} /> Đăng Xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DoctorLayout;