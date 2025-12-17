// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
// Import Footer nếu có

const MainLayout = () => {
    return (
        <div className="main-layout">
            {/* Hiệu ứng nền chỉ hiện ở trang người dùng */}
            <div className="background-effects">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <Navbar />
            
            <div className="main-content">
                <Outlet />
            </div>
            
            {/* <Footer /> */}
        </div>
    );
};

export default MainLayout;