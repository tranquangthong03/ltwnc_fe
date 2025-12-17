// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Stethoscope, 
    Package, 
    CalendarCheck, 
    Receipt, 
    LogOut, 
    Settings, 
    Activity,
    ChevronRight,
    MessageSquareText
} from 'lucide-react';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Cấu trúc Menu mới dựa trên SQL
    const menuGroups = [
        {
            title: "Hệ thống",
            items: [
                { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
            ]
        },
        {
            title: "Quản lý nhân sự",
            items: [
                { path: '/admin/users', icon: <Users size={20} />, label: 'Bệnh nhân' },
                { path: '/admin/doctors', icon: <Stethoscope size={20} />, label: 'Bác sĩ' },
            ]
        },
        {
            title: "Dịch vụ & Vận hành",
            items: [
                { path: '/admin/packages', icon: <Package size={20} />, label: 'Gói khám' },
                { path: '/admin/appointments', icon: <CalendarCheck size={20} />, label: 'Lịch hẹn' },
                { path: '/admin/invoices', icon: <Receipt size={20} />, label: 'Hóa đơn & Doanh thu' },
            ]
        },
        {
            title: "Khác",
            items: [
                { path: '/admin/chat-logs', icon: <MessageSquareText size={20} />, label: 'Lịch sử Chat AI' },
                { path: '/admin/settings', icon: <Settings size={20} />, label: 'Cài đặt' },
            ]
        }
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50 overflow-hidden font-sans border-r border-slate-800">
            {/* 1. Header Logo */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <Activity size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                            HealthAdmin
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Management</p>
                    </div>
                </div>
            </div>
            
            {/* 2. Menu Navigation (Có phân nhóm) */}
            <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {group.title}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link 
                                        key={item.path}
                                        to={item.path} 
                                        className={`relative group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
                                            ${isActive 
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 z-10">
                                            <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>

                                        {/* Chỉ hiện mũi tên khi active */}
                                        {isActive && (
                                            <ChevronRight size={16} className="text-white/80 animate-pulse" />
                                        )}
                                        
                                        {/* Hiệu ứng nền mờ khi active */}
                                        {isActive && <div className="absolute inset-0 bg-white/10 rounded-xl"></div>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* 3. User Profile Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-3 group hover:border-blue-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-xs text-slate-400 truncate">Online</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-300 group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                    <span className="text-sm font-medium">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;