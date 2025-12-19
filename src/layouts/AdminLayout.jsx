// src/layouts/AdminLayout.jsx
import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
    const { user } = useContext(AuthContext);

    // DEBUG: Mở F12 (Console) để xem dòng này in ra gì
    console.log("Current User:", user);

    // 1. Nếu chưa đăng nhập -> Đá về Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Kiểm tra quyền Admin (Chuyển về chữ thường để so sánh chuẩn xác)
    // Nếu trong DB lưu là 'admin' mà code so sánh 'Admin' thì sẽ bị lỗi này
    const role = user.role ? user.role.toLowerCase() : '';

    if (role !== 'admin') {
        console.warn("User không phải Admin! Role thực tế:", role);
        return <Navigate to="/" replace />; // Đá về trang chủ nếu không phải Admin
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <div className="w-64 fixed h-full z-20">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 transition-all duration-300">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;