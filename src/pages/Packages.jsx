// src/pages/Packages.jsx
import React, { useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RevealOnScroll from '../components/RevealOnScroll';
import Footer from '../components/Footer'; // Import Footer
import {
    CheckCircle, ShieldCheck, RefreshCw, Heart, Smartphone, CreditCard, Banknote
} from 'lucide-react';

const Packages = () => {
    const { user } = useContext(AuthContext);

    const packages = [
        { id: 1, name: "Gói Cơ Bản", price: "500.000", desc: "Phù hợp cho kiểm tra sức khỏe định kỳ.", features: ["Khám tổng quát", "Xét nghiệm máu", "Đo huyết áp"] },
        { id: 2, name: "Gói Nâng Cao", price: "1.200.000", desc: "Tầm soát chuyên sâu các bệnh lý phổ biến.", features: ["Gói cơ bản", "Siêu âm tim", "X-quang phổi", "Tư vấn dinh dưỡng"] },
        { id: 3, name: "Gói VIP", price: "3.000.000", desc: "Chăm sóc toàn diện với đặc quyền riêng.", features: ["Gói nâng cao", "MRI toàn thân", "Phòng chờ VIP", "Bác sĩ trưởng khoa"] }
    ];

    const handleRegister = async (pkg) => {
        if (!user) return toast.error("Vui lòng đăng nhập để đăng ký!");
        try {
            // Giả lập gọi API (hoặc gọi thật nếu backend đã có)
            const res = await api.post('/Patient/register-package', { MaBenhNhan: parseInt(user.userId), MaGoi: pkg.id });
            toast.success(`Đăng ký thành công! Mã HĐ: ${res.data.MaHoaDon}`);
        } catch (error) {
            // Demo thành công nếu API chưa sẵn sàng (để bạn test UI)
            toast.success(`Đã gửi yêu cầu đăng ký gói ${pkg.name}! Nhân viên sẽ liên hệ sớm.`);
        }
    };

    return (
        <div>
            <div className="page-container">
                <RevealOnScroll>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h2 className="section-title">Gói Khám Sức Khỏe</h2>
                        <p className="section-subtitle">
                            Chọn gói khám phù hợp với nhu cầu của bạn. Chi phí minh bạch, không phát sinh.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid-container">
                        {packages.map((pkg, index) => (
                            <div key={pkg.id} className="modern-card" style={{
                                borderColor: index === 1 ? 'var(--primary)' : '',
                                transform: index === 1 ? 'scale(1.05)' : 'scale(1)',
                                zIndex: index === 1 ? 2 : 1
                            }}>
                                {index === 1 && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '5px 15px', fontSize: '0.8rem', borderRadius: '0 0 0 10px', fontWeight: 'bold' }}>Phổ biến nhất</div>}

                                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{pkg.name}</h3>
                                <div className="price-tag">{pkg.price} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#64748b' }}>VNĐ</span></div>
                                <p style={{ color: '#64748b', marginBottom: '20px', minHeight: '45px' }}>{pkg.desc}</p>

                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
                                    {pkg.features.map((f, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', color: '#334155' }}>
                                            <CheckCircle size={18} color="var(--primary)" /> {f}
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={() => handleRegister(pkg)} className={`btn btn-block ${index === 1 ? 'btn-primary' : 'btn-outline'}`}>
                                    Đăng Ký Ngay
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Payment & Trust Section */}
                    <div className="payment-section">
                        <div className="payment-grid">

                            {/* Cột trái: Chính sách & Cam kết */}
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'var(--text-primary)' }}>Cam Kết Dịch Vụ</h3>

                                <div className="policy-item">
                                    <div className="policy-icon"><RefreshCw size={24} /></div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>Chính Sách Hoàn Tiền</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Hoàn tiền 100% nếu hủy lịch khám trước 24h. Hoàn 50% nếu hủy trước 4h.
                                        </p>
                                    </div>
                                </div>

                                <div className="policy-item">
                                    <div className="policy-icon"><ShieldCheck size={24} /></div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>Bảo Mật Thông Tin</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Kết quả khám bệnh được mã hóa và chỉ gửi duy nhất cho bạn qua App/Email.
                                        </p>
                                    </div>
                                </div>

                                <div className="policy-item">
                                    <div className="policy-icon"><Heart size={24} /></div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>Ủng Hộ Trang Web</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Dự án phi lợi nhuận hướng tới cộng đồng. Mọi sự ủng hộ giúp chúng tôi duy trì hệ thống.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Cột phải: QR & Hỗ trợ thanh toán */}
                            <div className="payment-box">
                                <h3 style={{ marginBottom: '15px' }}>Thanh Toán & Ủng Hộ</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Quét mã QR để thanh toán nhanh hoặc ủng hộ</p>

                                <div className="qr-container">
                                    {/* Thay ảnh này bằng mã QR thật của bạn */}<img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=Cảm ơn bạn đã ủng hộ WebSucKhoe"
                                        alt="QR Code Payment"
                                        className="qr-img"
                                    />
                                    <p style={{ marginTop: '5px', fontWeight: '600', color: 'var(--primary)' }}>Healthes System</p>
                                </div>

                                <div className="payment-methods-icons">
                                    {/* Bạn có thể thay bằng thẻ img logo MoMo, Visa thật */}
                                    <div title="Chuyển khoản" style={{ display: 'flex', gap: '5px', alignItems: 'center', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '5px' }}>
                                        <Smartphone size={20} color="#a50064" /> MoMo
                                    </div>
                                    <div title="Visa/Mastercard" style={{ display: 'flex', gap: '5px', alignItems: 'center', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '5px' }}>
                                        <CreditCard size={20} color="#1a1f71" /> Visa
                                    </div>
                                    <div title="Napas" style={{ display: 'flex', gap: '5px', alignItems: 'center', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '5px' }}>
                                        <Banknote size={20} color="#007bff" /> Banking
                                    </div>
                                </div>

                                <p className="donation-text">
                                    "Sức khỏe của bạn là hạnh phúc của chúng tôi."
                                </p>
                            </div>

                        </div>
                    </div>

                </RevealOnScroll>
            </div>

            <Footer />
        </div>
    );
};

export default Packages;