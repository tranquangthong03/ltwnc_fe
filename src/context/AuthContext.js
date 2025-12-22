// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react'; // 1. Thêm useContext
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

// 2. Thêm hàm này để fix lỗi "export 'useAuth' was not found"
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Giữ nguyên logic decode thủ công của bạn
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const decoded = JSON.parse(jsonPayload);
                setUser({
                    userId: decoded.UserID || decoded.nameid,
                    role: decoded.role,
                    name: decoded.HoTen
                });
            } catch (error) {
                console.error("Lỗi decode token:", error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};