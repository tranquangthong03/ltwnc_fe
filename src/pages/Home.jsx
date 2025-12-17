// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import RevealOnScroll from '../components/RevealOnScroll';
import { ArrowRight, Activity, ShieldCheck, Clock, Sparkles } from 'lucide-react';

const Home = () => {
    return (
        <div>
            {/* Hero Section - Bố cục mới */}
            <div className="hero-wrapper">
                {/* Cột trái: Nội dung text */}
                <div className="hero-content">
                    <RevealOnScroll>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--accent)' }}>
                            <Sparkles size={20} /> <span>Nền tảng y tế tương lai</span>
                        </div>
                        <h1 className="hero-title">
                            Chăm Sóc Sức Khỏe <br />
                            <span className="text-gradient">Thông Minh Hơn.</span>
                        </h1>
                        <p className="hero-desc">
                            Kết nối tức thì với các chuyên gia y tế hàng đầu và trải nghiệm công nghệ chẩn đoán AI tiên tiến, mọi lúc, mọi nơi.
                        </p>
                        <div className="hero-btns" style={{ display: 'flex', gap: '20px' }}>
                            <Link to="/doctors" className="btn btn-primary">
                                Đặt Lịch Khám <ArrowRight size={20} />
                            </Link>
                            <Link to="/chat-ai" className="btn btn-outline">
                                Trợ Lý AI
                            </Link>
                        </div>
                    </RevealOnScroll>
                </div>

                {/* Cột phải: Khung ảnh bác sĩ */}
                <div className="hero-image-container">
                    <RevealOnScroll>
                        <div className="doctor-frame">
                            {/* Đảm bảo bạn đã có file doctor.png trong thư mục public */}
                            <img src="/doctor.png" alt="Bác sĩ chuyên khoa" />
                        </div>
                    </RevealOnScroll>
                </div>
            </div>

            {/* Features Section */}
            <div className="page-container">
                <RevealOnScroll>
                    <h2 className="section-title">Tại Sao Chọn Chúng Tôi?</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px' }}>Giải pháp y tế toàn diện cho kỷ nguyên số</p>

                    <div className="grid-container">
                        <div className="modern-card">
                            <div className="card-icon"><Activity size={30} /></div>
                            <h3>Công Nghệ AI Tiên Tiến</h3>
                            <p>Tích hợp Gemini AI giúp phân tích triệu chứng và đưa ra tư vấn sơ bộ chính xác 24/7.</p>
                        </div>
                        <div className="modern-card">
                            <div className="card-icon"><ShieldCheck size={30} /></div>
                            <h3>Bảo Mật Cấp Cao</h3>
                            <p>Hồ sơ sức khỏe điện tử được mã hóa đầu cuối, đảm bảo riêng tư tuyệt đối cho bạn.</p>
                        </div>
                        <div className="modern-card">
                            <div className="card-icon"><Clock size={30} /></div>
                            <h3>Tiết Kiệm Thời Gian</h3>
                            <p>Đặt lịch khám online không chờ đợi. Nhận kết quả và đơn thuốc ngay trên ứng dụng.</p>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>
        </div>
    );
};

export default Home;