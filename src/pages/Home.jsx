// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RevealOnScroll from '../components/RevealOnScroll';
import Footer from '../components/Footer';
import { ArrowRight, Activity, ShieldCheck, Clock, Sparkles, Search, Award, Users, ThumbsUp, HeartPulse, UserCheck } from 'lucide-react';

const Home = () => {
    // --- 1. LOGIC TYPEWRITER EFFECT (Đã sửa lỗi Hook) ---
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [delta, setDelta] = useState(150);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toRotate = ["Toàn Diện", "Tận Tâm", "Chuyên Nghiệp", "Hiện Đại"];
    const period = 2000;

    useEffect(() => {
        const tick = () => {
            let i = loopNum % toRotate.length;
            let fullText = toRotate[i];
            let updatedText = isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1);

            setText(updatedText);

            if (isDeleting) {
                setDelta(80);
            }

            if (!isDeleting && updatedText === fullText) {
                setIsDeleting(true);
                setDelta(period);
            } else if (isDeleting && updatedText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                setDelta(150);
            }
        };

        let ticker = setInterval(() => {
            tick();
        }, delta);

        return () => clearInterval(ticker);
    }, [text, delta, isDeleting, loopNum, toRotate]); // Đã thêm đầy đủ dependencies
    // -----------------------------------------------------

    const news = [
        { id: 1, title: "5 Cách tăng cường hệ miễn dịch mùa lạnh", date: "15/12/2024", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=300" },
        { id: 2, title: "Lịch khám sức khỏe định kỳ năm 2025", date: "10/12/2024", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300" },
        { id: 3, title: "Công nghệ AI trong chẩn đoán sớm ung thư", date: "05/12/2024", img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=300" }
    ];

    return (
        <div>
            {/* HERO SECTION */}
            <div className="hero-wrapper">
                {/* CỘT TRÁI */}
                <div className="hero-content">
                    <RevealOnScroll>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--primary)', fontWeight: 600 }}>
                            <Sparkles size={20} /> <span>Hệ sinh thái y tế 4.0</span>
                        </div>

                        <h1 className="hero-title">
                            Chăm Sóc Sức Khỏe <br />
                            <span className="text-gradient">{text}</span>
                            <span className="typewriter-cursor"></span>
                        </h1>

                        <p className="hero-desc">
                            Hệ thống Healthes System kết nối bạn với chuyên gia y tế hàng đầu. Đặt lịch khám, tư vấn AI và quản lý hồ sơ sức khỏe chỉ trong một chạm.
                        </p>

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

                {/* CỘT PHẢI */}
                <div className="hero-image-container">
                    <RevealOnScroll>
                        <div className="doctor-frame">
                            <img src="/doctor.png" alt="Bác sĩ" />
                        </div>

                        <div className="floating-card float-1">
                            <div className="card-icon-box"><HeartPulse size={20} /></div>
                            <div className="floating-text">
                                <span>Chuyên khoa</span>
                                <strong>Tim Mạch</strong>
                            </div>
                        </div>

                        <div className="floating-card float-2">
                            <div className="card-icon-box"><UserCheck size={20} /></div>
                            <div className="floating-text">
                                <span>Bác sĩ uy tín</span>
                                <strong>Top 1% VN</strong>
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>
            </div>

            {/* STATS SECTION */}
            <div className="stats-section">
                <RevealOnScroll>
                    <div className="stats-grid">
                        <div><div className="stat-number">15+</div><div className="stat-label">Năm Kinh Nghiệm</div></div>
                        <div><div className="stat-number">50+</div><div className="stat-label">Bác Sĩ Chuyên Khoa</div></div>
                        <div><div className="stat-number">10k+</div><div className="stat-label">Bệnh Nhân Tin Dùng</div></div>
                        <div><div className="stat-number">24/7</div><div className="stat-label">Hỗ Trợ Y Tế</div></div>
                    </div>
                </RevealOnScroll>
            </div>

            {/* FEATURES SECTION */}
            <div className="page-container">
                <RevealOnScroll>
                    <h2 className="section-title">Tại Sao Chọn Healthes System?</h2>
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

            {/* EXPERIENCE SECTION */}
            <div className="experience-section">
                <RevealOnScroll>
                    <div className="exp-content">
                        <h2 className="section-title">Đội Ngũ Chuyên Gia Hàng Đầu</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                            Chúng tôi tự hào sở hữu đội ngũ y bác sĩ giàu kinh nghiệm, từng công tác tại các bệnh viện lớn như Bạch Mai, Chợ Rẫy, Việt Đức.
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

            {/* NEWS SECTION */}
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
                                    {/* Sửa thẻ a thành Link hoặc button để fix lỗi warning */}
                                    <Link to={`/news/${item.id}`} className="news-link">Đọc tiếp &rarr;</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </RevealOnScroll>
            </div>

            <Footer />
        </div>
    );
};

export default Home;