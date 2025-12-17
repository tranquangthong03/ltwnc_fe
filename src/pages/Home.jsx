// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import RevealOnScroll from '../components/RevealOnScroll';
import Footer from '../components/Footer'; // Import Footer
import { ArrowRight, Activity, ShieldCheck, Clock, Sparkles, Search, Award, Users, ThumbsUp } from 'lucide-react';

const Home = () => {
    // Dữ liệu giả lập Tin tức
    const news = [
        { id: 1, title: "5 Cách tăng cường hệ miễn dịch mùa lạnh", date: "15/12/2024", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=300" },
        { id: 2, title: "Lịch khám sức khỏe định kỳ năm 2025", date: "10/12/2024", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300" },
        { id: 3, title: "Công nghệ AI trong chẩn đoán sớm ung thư", date: "05/12/2024", img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=300" }
    ];

    return (
        <div>
            {/* 1. HERO SECTION (Giữ nguyên) */}
            <div className="hero-wrapper">
                <div className="hero-content">
                    <RevealOnScroll>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                            <Sparkles size={20} /> <span>Hệ sinh thái y tế 4.0</span>
                        </div>
                        <h1 className="hero-title">Chăm Sóc Sức Khỏe <br /> <span className="text-gradient">Toàn Diện & Tận Tâm</span></h1>
                        <p className="hero-desc">Đặt lịch khám bệnh nhanh chóng, kết nối với bác sĩ chuyên khoa và nhận tư vấn sức khỏe mọi lúc, mọi nơi.</p>

                        <div className="search-container">
                            <input type="text" className="search-input" placeholder="Tìm triệu chứng, bác sĩ..." />
                            <button className="search-btn"><Search size={20} /></button>
                        </div>

                        <div className="hero-btns" style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                            <Link to="/doctors" className="btn btn-primary">Đặt Lịch Ngay <ArrowRight size={20} /></Link>
                            <Link to="/chat-ai" className="btn btn-outline">Chat Với AI</Link>
                        </div>
                    </RevealOnScroll>
                </div>
                <div className="hero-image-container">
                    <RevealOnScroll>
                        <div className="doctor-frame-bg"></div>
                        <div className="doctor-frame"><img src="/doctor.png" alt="Bác sĩ" /></div>
                    </RevealOnScroll>
                </div>
            </div>

            {/* 2. STATS SECTION (Mới) */}
            <div className="stats-section">
                <RevealOnScroll>
                    <div className="stats-grid">
                        <div>
                            <div className="stat-number">15+</div>
                            <div className="stat-label">Năm Kinh Nghiệm</div>
                        </div>
                        <div>
                            <div className="stat-number">50+</div>
                            <div className="stat-label">Bác Sĩ Chuyên Khoa</div>
                        </div>
                        <div>
                            <div className="stat-number">10k+</div>
                            <div className="stat-label">Bệnh Nhân Tin Dùng</div>
                        </div>
                        <div>
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Hỗ Trợ Y Tế</div>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>

            {/* 3. FEATURES SECTION */}
            <div className="page-container">
                <RevealOnScroll>
                    <h2 className="section-title">Tại Sao Chọn Chúng Tôi?</h2>
                    <p className="section-subtitle">Giải pháp y tế tối ưu cho mọi gia đình</p>
                    <div className="grid-container">
                        <div className="modern-card">
                            <div className="card-icon"><Activity size={28} /></div>
                            <h3>Chẩn Đoán Thông Minh</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>AI hỗ trợ phân tích triệu chứng nhanh chóng, chính xác.</p>
                        </div>
                        <div className="modern-card">
                            <div className="card-icon"><ShieldCheck size={28} /></div>
                            <h3>Bảo Mật Tuyệt Đối</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Dữ liệu y tế được mã hóa theo tiêu chuẩn quốc tế.</p>
                        </div>
                        <div className="modern-card">
                            <div className="card-icon"><Clock size={28} /></div>
                            <h3>Tiết Kiệm Thời Gian</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Không cần xếp hàng, đặt lịch khám chỉ với 1 chạm.</p>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>

            {/* 4. EXPERIENCE SECTION (Mới) */}
            <div className="experience-section">
                <RevealOnScroll>
                    <div className="exp-content">
                        <h2 className="section-title">Đội Ngũ Chuyên Gia Hàng Đầu</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                            Chúng tôi tự hào sở hữu đội ngũ y bác sĩ giàu kinh nghiệm, từng công tác tại các bệnh viện lớn như Bạch Mai, Chợ Rẫy, Việt Đức. Sự tận tâm và chuyên môn cao là cam kết của chúng tôi.
                        </p>
                        <div className="exp-badges">
                            <div className="badge"><Award size={16} style={{ display: 'inline' }} /> Chứng chỉ Quốc tế</div>
                            <div className="badge"><Users size={16} style={{ display: 'inline' }} /> Tận tâm - Chu đáo</div>
                            <div className="badge"><ThumbsUp size={16} style={{ display: 'inline' }} /> 99% Hài lòng</div>
                        </div>
                        <div style={{ marginTop: '40px' }}>
                            <Link to="/doctors" className="btn btn-outline">Xem Danh Sách Bác Sĩ</Link>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>

            {/* 5. NEWS SECTION (Mới) */}
            <div className="page-container">
                <RevealOnScroll>
                    <h2 className="section-title">Tin Tức & Sự Kiện</h2>
                    <p className="section-subtitle">Cập nhật thông tin y tế mới nhất</p>
                    <div className="grid-container">
                        {news.map(item => (
                            <div key={item.id} className="modern-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <img src={item.img} alt={item.title} className="news-img" />
                                <div className="news-body">
                                    <span className="news-date">{item.date}</span>
                                    <h3 className="news-title">{item.title}</h3>
                                    <a href="#" className="news-link">Đọc tiếp &rarr;</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>

            {/* 6. FOOTER (Mới) */}
            <Footer />
        </div>
    );
};

export default Home;