// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn, User, Lock } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/Auth/login', { Username: username, Password: password });

            // Xử lý token (Lưu ý: API .NET Core có thể trả về chữ thường 'token' thay vì 'Token')
            // Mình sẽ kiểm tra cả 2 trường hợp cho chắc ăn
            const token = res.data.Token || res.data.token;

            if (!token) throw new Error("Không nhận được token");

            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const decoded = JSON.parse(jsonPayload);

            // Backend trả về Role hoặc role, UserId hoặc UserID...
            // Cần map đúng key từ JWT decoded
            const userData = {
                userId: decoded.UserID || decoded.nameid,
                role: decoded.role || decoded.Role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
                name: decoded.HoTen || decoded.unique_name
            };

            login(token, userData);
            toast.success(`Chào mừng ${userData.name} quay trở lại!`);
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error("Sai tài khoản hoặc mật khẩu");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box">
                <h2 className="section-title">Đăng Nhập</h2>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-secondary)' }}>
                    Vui lòng đăng nhập để tiếp tục
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên đăng nhập</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '13px', left: '12px', color: '#94a3b8' }} />
                            <input
                                type="text"
                                className="form-input"
                                style={{ paddingLeft: '40px' }}
                                placeholder="Nhập tên đăng nhập"
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '13px', left: '12px', color: '#94a3b8' }} />
                            <input
                                type="password"
                                className="form-input"
                                style={{ paddingLeft: '40px' }}
                                placeholder="Nhập mật khẩu"
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
                        <LogIn size={18} /> Đăng Nhập
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                    Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;