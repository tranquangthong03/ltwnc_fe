import React, { useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RevealOnScroll from '../components/RevealOnScroll';
import { CheckCircle } from 'lucide-react';

const Packages = () => {
    const { user } = useContext(AuthContext);

    const packages = [
        { id: 1, name: "Gói Cơ Bản", price: "500.000", desc: "Phù hợp cho kiểm tra sức khỏe định kỳ.", features: ["Khám tổng quát", "Xét nghiệm máu", "Đo huyết áp"] },
        { id: 2, name: "Gói Nâng Cao", price: "1.200.000", desc: "Tầm soát chuyên sâu các bệnh lý phổ biến.", features: ["Gói cơ bản", "Siêu âm tim", "X-quang phổi", "Tư vấn dinh dưỡng"] },
        { id: 3, name: "Gói VIP", price: "3.000.000", desc: "Chăm sóc toàn diện với đặc quyền riêng.", features: ["Gói nâng cao", "MRI toàn thân", "Phòng chờ VIP", "Bác sĩ trưởng khoa"] }
    ];

    const handleRegister = async (pkg) => {
        if (!user) return toast.error("Vui lòng đăng nhập!");
        try {
            const res = await api.post('/Patient/register-package', { MaBenhNhan: parseInt(user.userId), MaGoi: pkg.id });
            toast.success(`Đăng ký thành công! Mã HĐ: ${res.data.MaHoaDon}`);
        } catch (error) { toast.error("Lỗi đăng ký."); }
    };

    return (
        <div className="page-container">
            <RevealOnScroll>
                <h2 className="section-title">Gói Khám Sức Khỏe</h2>
                <p className="section-subtitle">Chi phí minh bạch - Dịch vụ tận tâm</p>

                <div className="grid-container">
                    {packages.map((pkg, index) => (
                        <div key={pkg.id} className="modern-card" style={{ borderColor: index === 1 ? 'var(--primary)' : '' }}>
                            {index === 1 && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '5px 15px', fontSize: '0.8rem', borderRadius: '0 0 0 10px' }}>Phổ biến</div>}
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{pkg.name}</h3>
                            <div className="price-tag">{pkg.price} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#64748b' }}>VNĐ</span></div>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>{pkg.desc}</p>

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
            </RevealOnScroll>
        </div>
    );
};

export default Packages;