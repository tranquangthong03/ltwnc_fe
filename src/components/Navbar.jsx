// src/components/Navbar.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Stethoscope, MessageCircle, Package, LogOut, User, Search, Phone } from 'lucide-react';
const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Tìm kiếm:", searchTerm);
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="nav-container">

                {/* 1. LOGO: Healthes System */}
                <Link to="/" className="logo-wrapper">
                    <div className="logo-icon-box">H</div>
                    <span className="brand-name">Healthes System</span>
                </Link>

                {/* 2. MENU LINKS (Giờ nằm giữa, gần logo hơn) */}
                <ul className="nav-links">
                    <li><Link to="/" className={`nav-link-item ${isActive('/')}`}><Home size={18} /> Trang Chủ</Link></li>
                    <li><Link to="/doctors" className={`nav-link-item ${isActive('/doctors')}`}><Stethoscope size={18} /> Bác Sĩ</Link></li>
                    <li><Link to="/chat-ai" className={`nav-link-item ${isActive('/chat-ai')}`}><MessageCircle size={18} /> AI Chat</Link></li>
                    <li><Link to="/packages" className={`nav-link-item ${isActive('/packages')}`}><Package size={18} /> Gói Khám</Link></li>
                    <li><Link to="/contact" className={`nav-link-item ${isActive('/contact')}`}><Phone size={18} /> Liên Hệ</Link></li>

                </ul>

                {/* 3. THANH TÌM KIẾM (Đã chuyển sang phải) */}
                <div className="nav-search">
                    <form onSubmit={handleSearch}>
                        <div className="nav-search-box">
                            <Search size={16} className="search-icon-nav" style={{ color: '#94a3b8' }} />
                            <input
                                type="text"
                                className="nav-search-input"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                {/* 4. AUTH BUTTONS */}
                <div className="auth-buttons">
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span className="user-welcome">Hi, {user.name}</span>
                            <button
                                onClick={() => { logout(); navigate('/login'); }}
                                className="btn btn-outline"
                                style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #cbd5e1' }}
                                title="Đăng xuất"
                            >
                                <LogOut size={16} color="var(--danger)" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-login-nav">
                            <User size={18} /> Đăng Nhập
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;