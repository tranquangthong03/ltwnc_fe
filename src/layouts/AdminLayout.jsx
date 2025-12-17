// src/layouts/AdminLayout.jsx
import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
    const { user } = useContext(AuthContext);

    // Bảo vệ Route: Nếu không phải Admin thì đá về trang login
    // Logic check role dựa trên token decoded
    if (!user || user.role !== 'Admin') { 
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar (Đã được định nghĩa fixed position và w-72 trong component Sidebar) */}
            <Sidebar />

            {/* Nội dung chính (Main Content) */}
            {/* ml-72: Tạo margin-left 18rem (288px) để tránh bị Sidebar che mất */}
            <div className="flex-1 ml-72 transition-all duration-300">
                {/* Outlet là nơi render các trang con (Dashboard, Doctors, Users...) */}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;