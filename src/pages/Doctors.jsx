// src/pages/Doctors.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Import axios instance
import RevealOnScroll from '../components/RevealOnScroll';
import Footer from '../components/Footer';
import {
    Stethoscope, Clock, Star, CalendarCheck, Search, Filter,
    Award, Users, ThumbsUp, ArrowRight, Smartphone, Download, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Thêm state lỗi
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                // Gọi API thực tế
                const response = await api.get('/Doctor');

                // Kiểm tra nếu dữ liệu trả về đúng là mảng
                if (Array.isArray(response.data)) {
                    setDoctors(response.data);
                } else {
                    console.error("API không trả về mảng:", response.data);
                    setDoctors([]);
                }
            } catch (err) {
                console.error("Lỗi tải API Bác sĩ:", err);
                setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.");
                setDoctors([]); // Không dùng dữ liệu giả, để rỗng
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleBookAppointment = (docName) => {
        toast.info(`Đang chuyển đến trang đặt lịch với ${docName}...`);
    };

    // Logic lọc an toàn (tránh lỗi toLowerCase undefined)
    const filteredDoctors = doctors.filter(doc => {
        const name = doc.HoTen || doc.hoTen || "";
        const dept = doc.ChuyenKhoa || doc.chuyenKhoa || "";
        const search = searchTerm.toLowerCase();
        return name.toLowerCase().includes(search) || dept.toLowerCase().includes(search);
    });

    // --- RENDER GIAO DIỆN ---

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Đang đồng bộ dữ liệu bác sĩ...</p>
            </div>
        );
    }

    return (
        <div>
            {/* 1. HEADER & SEARCH */}
            <div style={{ backgroundColor: 'var(--bg-light)', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
                <RevealOnScroll>
                    <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
                        Đội Ngũ <span className="text-gradient">Chuyên Gia</span>
                    </h1>
                    <p className="section-subtitle">
                        Danh sách bác sĩ được cập nhật trực tiếp từ hệ thống dữ liệu bệnh viện.
                    </p>

                    <div className="search-container" style={{ margin: '30px auto', maxWidth: '600px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <Search size={20} style={{ color: 'var(--text-secondary)', marginLeft: '10px' }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn" style={{ width: 'auto', padding: '0 20px', borderRadius: '8px' }}>
                            Tìm Kiếm
                        </button>
                    </div>
                </RevealOnScroll>
            </div>

            {/* 2. DANH SÁCH BÁC SĨ TỪ API */}
            <div className="page-container">
                <RevealOnScroll>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={18} /> Kết quả ({filteredDoctors.length})
                        </h3>
                    </div>

                    {/* Hiển thị Lỗi nếu có */}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px', background: '#fee2e2', borderRadius: '12px', color: '#b91c1c', marginBottom: '30px' }}>
                            <AlertCircle size={40} style={{ marginBottom: '10px' }} />
                            <p>{error}</p>
                            <p style={{ fontSize: '0.9rem' }}>Hãy đảm bảo Backend đang chạy tại port 7004 và Controller cho phép truy cập Public.</p>
                        </div>
                    )}

                    {/* Hiển thị Danh sách */}
                    {!error && filteredDoctors.length > 0 ? (
                        <div className="grid-container">
                            {filteredDoctors.map((doc) => (
                                <div key={doc.MaBacSi || doc.maBacSi || Math.random()} className="doctor-card-wrapper">
                                    <div className="doc-img-container">
                                        <span className="doc-badge">
                                            <Stethoscope size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            {doc.ChuyenKhoa || doc.chuyenKhoa || "Đa Khoa"}
                                        </span>
                                        <img
                                            src={doc.Anh || doc.anh || "/doctor.png"}
                                            alt={doc.HoTen}
                                            className="doc-img"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=Bac+Si" }}
                                        />
                                    </div>

                                    <div className="doc-info">
                                        <h3 className="doc-name">{doc.HoTen || doc.hoTen}</h3>
                                        <span className="doc-dept">{doc.ChuyenKhoa || doc.chuyenKhoa}</span>

                                        <div className="doc-stats">
                                            <div className="doc-stat-item">
                                                <Clock size={16} color="var(--primary)" />
                                                <span>{doc.KinhNghiem || doc.kinhNghiem || "N/A"}</span>
                                            </div>
                                            <div className="doc-stat-item">
                                                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                                                <span>{doc.DanhGia || doc.danhGia || 5.0}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-outline btn-block"
                                            onClick={() => handleBookAppointment(doc.HoTen || doc.hoTen)}
                                            style={{ borderRadius: '50px' }}
                                        >
                                            <CalendarCheck size={18} /> Đặt Lịch Ngay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !error && (
                            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)', border: '2px dashed #e2e8f0', borderRadius: '20px' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Chưa có dữ liệu bác sĩ nào.</p>
                                <p>Vui lòng kiểm tra Database hoặc nhập dữ liệu bác sĩ vào hệ thống.</p>
                            </div>
                        )
                    )}
                </RevealOnScroll>
            </div>

            {/* 3. TRUST SECTION */}
            <div className="trust-section" style={{ marginTop: '60px' }}>
                <RevealOnScroll>
                    <div className="trust-grid">
                        <div className="trust-image-box">
                            <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600" alt="Team bác sĩ" className="main-trust-img" />
                            <div className="float-badge">
                                <div style={{ background: '#fbbf24', padding: '10px', borderRadius: '50%' }}>
                                    <Star size={24} color="white" fill="white" />
                                </div>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '1.2rem' }}>4.9/5.0</strong>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chất lượng điều trị</span>
                                </div>
                            </div>
                        </div>
                        <div className="trust-content">
                            <h2 className="section-title" style={{ textAlign: 'left' }}>Tại Sao Chọn <br /><span className="text-gradient">Đội Ngũ Của Chúng Tôi?</span></h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Không chỉ giỏi chuyên môn, các bác sĩ tại Healthes System còn luôn đặt y đức lên hàng đầu.</p>
                            <ul className="trust-list">
                                <li className="trust-item">
                                    <div className="trust-icon"><Award size={24} /></div>
                                    <div className="trust-text"><h4>Chuyên Môn Cao</h4><p>Đội ngũ Giáo sư, Tiến sĩ đầu ngành.</p></div>
                                </li>
                                <li className="trust-item">
                                    <div className="trust-icon"><Users size={24} /></div>
                                    <div className="trust-text"><h4>Hội Chẩn Đa Khoa</h4><p>Phối hợp điều trị tối ưu.</p></div>
                                </li>
                            </ul>
                            <Link to="/contact" className="btn btn-primary">Liên Hệ Tư Vấn <ArrowRight size={18} /></Link>
                        </div>
                    </div>
                </RevealOnScroll>
            </div>

            {/* 4. APP BANNER */}
            <div className="app-section">
                <RevealOnScroll>
                    <div className="app-container">
                        <div className="app-content">
                            <h2>Kết Nối Bác Sĩ Mọi Lúc</h2>
                            <p>Tải ứng dụng Healthes System để đặt lịch và video call trực tiếp.</p>
                            <div className="app-btns">
                                <a href="#" className="store-btn"><Smartphone size={24} /> App Store</a>
                                <a href="#" className="store-btn"><Download size={24} /> Google Play</a>
                            </div>
                        </div>
                        <div className="app-image" style={{ display: 'flex', alignItems: 'center' }}>
                            <Smartphone size={180} color="white" strokeWidth={1} style={{ opacity: 0.9 }} />
                        </div>
                    </div>
                </RevealOnScroll>
            </div>

            <Footer />
        </div>
    );
};

export default Doctors;