// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Cột 1: Thông tin chung */}
                <div className="footer-col">
                    <h3>WebSucKhoe.VN</h3>
                    <p>Hệ thống y tế công nghệ cao, mang đến giải pháp chăm sóc sức khỏe toàn diện cho gia đình bạn.</p>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                        <Facebook size={20} />
                        <Instagram size={20} />
                        <Youtube size={20} />
                    </div>
                </div>

                {/* Cột 2: Liên kết nhanh */}
                <div className="footer-col">
                    <h3>Liên Kết</h3>
                    <Link to="/">Trang Chủ</Link>
                    <Link to="/doctors">Đội Ngũ Bác Sĩ</Link>
                    <Link to="/packages">Gói Khám Bệnh</Link>
                    <Link to="/chat-ai">Tư Vấn AI</Link>
                </div>

                {/* Cột 3: Liên hệ */}
                <div className="footer-col">
                    <h3>Liên Hệ</h3>
                    <p><MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} /> 123 Đường Nguyễn Văn Linh, Đà Nẵng</p>
                    <p><Phone size={16} style={{ display: 'inline', marginRight: '5px' }} /> 1900 1234 (Hotline 24/7)</p>
                    <p><Mail size={16} style={{ display: 'inline', marginRight: '5px' }} /> hotro@websuckhoe.vn</p>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; 2025 WebSucKhoe.VN - Bản quyền thuộc về bạn.
            </div>
        </footer>
    );
};

export default Footer;