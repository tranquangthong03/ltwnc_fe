// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HeartPulse, Home, Stethoscope, MessageCircle, Package, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo">
                    {/* Đổi màu icon sang màu accent */}
                    <HeartPulse color="var(--accent)" size={32} style={{ filter: 'drop-shadow(0 0 10px var(--accent-glow))' }} />
                    <span>WebSucKhoe<span style={{ color: 'var(--accent)' }}>.VN</span></span>
                </Link>

                <ul className="nav-links">
                    <li><Link to="/"><Home size={18} /> Trang Chủ</Link></li>
                    <li><Link to="/doctors"><Stethoscope size={18} /> Bác Sĩ</Link></li>
                    <li><Link to="/chat-ai"><MessageCircle size={18} /> Trợ Lý AI</Link></li>
                    <li><Link to="/packages"><Package size={18} /> Gói Khám</Link></li>
                </ul>

                <div className="auth-buttons">
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Chào, {user.name}</span>
                            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '0.9rem' }}>
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '10px 25px' }}>
                            <User size={18} /> Đăng Nhập
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;