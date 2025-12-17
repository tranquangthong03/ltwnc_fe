// src/pages/Doctors.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Import axios instance
import RevealOnScroll from '../components/RevealOnScroll';
import { Stethoscope, Clock, Star, MapPin, CalendarCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dữ liệu mẫu (Fallback) phòng trường hợp API chưa có dữ liệu
    const mockDoctors = [
        { MaBacSi: 1, HoTen: "BS. Nguyễn Văn A", ChuyenKhoa: "Tim Mạch", KinhNghiem: "10 năm", DanhGia: 4.9, Anh: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400" },
        { MaBacSi: 2, HoTen: "BS. Trần Thị B", ChuyenKhoa: "Nhi Khoa", KinhNghiem: "8 năm", DanhGia: 4.8, Anh: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400" },
        { MaBacSi: 3, HoTen: "BS. Lê Hoàng C", ChuyenKhoa: "Da Liễu", KinhNghiem: "15 năm", DanhGia: 5.0, Anh: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400" },
        { MaBacSi: 4, HoTen: "BS. Phạm Minh D", ChuyenKhoa: "Thần Kinh", KinhNghiem: "12 năm", DanhGia: 4.7, Anh: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400" },
    ];

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Gọi API lấy danh sách bác sĩ từ Backend
                // Lưu ý: Backend cần có endpoint GET /api/Doctor trả về danh sách
                const response = await api.get('/Doctor');

                if (response.data && response.data.length > 0) {
                    setDoctors(response.data);
                } else {
                    // Nếu API trả về rỗng, dùng dữ liệu mẫu để demo giao diện
                    setDoctors(mockDoctors);
                }
            } catch (error) {
                console.error("Lỗi tải bác sĩ:", error);
                // Nếu lỗi kết nối (Backend chưa bật), dùng dữ liệu mẫu
                setDoctors(mockDoctors);
                // toast.error("Không thể kết nối đến máy chủ. Đang hiển thị dữ liệu mẫu.");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleBookAppointment = (docName) => {
        toast.info(`Đang chuyển đến trang đặt lịch với ${docName}...`);
        // Logic chuyển hướng hoặc mở modal đặt lịch ở đây
    };

    if (loading) {
        return (
            <div className="page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="spinner"></div>
                <p>Đang tải danh sách bác sĩ...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <RevealOnScroll>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 className="section-title">Đội Ngũ Chuyên Gia</h2>
                    <p className="section-subtitle">
                        Gặp gỡ những bác sĩ đầu ngành, tận tâm và giàu kinh nghiệm của chúng tôi.
                    </p>
                </div>

                <div className="grid-container">
                    {doctors.map((doc) => (
                        <div key={doc.MaBacSi || doc.id} className="doctor-card-wrapper">
                            {/* Ảnh Bác sĩ */}
                            <div className="doc-img-container">
                                <span className="doc-badge">
                                    <Stethoscope size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                    {doc.ChuyenKhoa || "Đa Khoa"}
                                </span>
                                <img
                                    src={doc.Anh || doc.AnhDaiDien || "/doctor.png"}
                                    alt={doc.HoTen}
                                    className="doc-img"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=Bac+Si" }} // Fallback ảnh lỗi
                                />
                            </div>

                            {/* Thông tin */}
                            <div className="doc-info">
                                <h3 className="doc-name">{doc.HoTen}</h3>
                                <span className="doc-dept">{doc.ChuyenKhoa || "Chuyên khoa Nội"}</span>

                                <div className="doc-stats">
                                    <div className="doc-stat-item">
                                        <Clock size={16} color="var(--primary)" />
                                        <span>{doc.KinhNghiem || "5+ năm"}</span>
                                    </div>
                                    <div className="doc-stat-item">
                                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                                        <span>{doc.DanhGia || "4.8"} (120+)</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-outline btn-block"
                                    onClick={() => handleBookAppointment(doc.HoTen)}
                                    style={{ borderRadius: '50px' }}
                                >
                                    <CalendarCheck size={18} /> Đặt Lịch Ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </RevealOnScroll>
        </div>
    );
};

export default Doctors;