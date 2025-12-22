import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    User,
    Users,
    FileText,
    LogOut,
    Stethoscope,
    Menu
} from 'lucide-react';

const DoctorLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/doctor/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { path: '/doctor/schedule', label: 'Lịch làm việc', icon: Calendar },
        { path: '/doctor/patients', label: 'Bệnh nhân', icon: Users },
        { path: '/doctor/chat', label: 'Tư vấn trực tuyến', icon: MessageSquare },
        { path: '/doctor/diagnosis', label: 'Phiếu khám bệnh', icon: FileText },
        { path: '/doctor/profile', label: 'Hồ sơ cá nhân', icon: User },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

            {/* --- SIDEBAR --- */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shadow-sm z-20">
                {/* Logo Area */}
                <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-50">
                    {/* Logo nhạt hơn, dùng teal-400 */}
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                        <Stethoscope size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-slate-700 tracking-tight leading-none">
                            Doctor<span className="text-emerald-500">Care</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">Cổng thông tin</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu chính</p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium text-sm no-underline relative overflow-hidden
                                ${isActive
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' // Active: Nền nhạt, chữ đậm
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-500'   // Inactive
                                }
                            `}
                        >
                            <item.icon size={20} className={`transition-transform duration-300 ${item.path === location.pathname ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="relative z-10">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-slate-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all font-medium text-sm group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/30">
                {/* Header Mobile */}
                <div className="lg:hidden bg-white h-16 border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
                    <span className="font-bold text-emerald-600">Doctor Portal</span>
                    <button className="p-2 bg-slate-50 rounded-lg"><Menu size={20} /></button>
                </div>

                {/* Nội dung thay đổi (Outlet) */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DoctorLayout;