import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/Auth/login', { Username: username, Password: password });

            // Xử lý decode token như cũ
            const base64Url = res.data.Token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const decoded = JSON.parse(jsonPayload);

            login(res.data.Token, { userId: decoded.UserID, role: decoded.role, name: decoded.HoTen });
            toast.success("Đăng nhập thành công!");
            navigate('/');
        } catch (err) {
            toast.error("Sai tài khoản hoặc mật khẩu");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-form-box">
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#007bff' }}>Đăng Nhập</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập:</label>
                        <input type="text" className="form-input" onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu:</label>
                        <input type="password" className="form-input" onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Đăng Nhập</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
            </div>
        </div>
    );
};

export default Login;