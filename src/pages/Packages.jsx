import React, { useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RevealOnScroll from '../components/RevealOnScroll';
import Footer from '../components/Footer';
import { CheckCircle, ShieldCheck, RefreshCw, Heart, Smartphone, CreditCard, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Packages = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    // State lưu gói hiện tại của user (nếu có)
    const [currentSub, setCurrentSub] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch dữ liệu gói và trạng thái đăng ký của user
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy danh sách gói
                const pkgRes = await api.get('/Patient/packages');
                setPackages(pkgRes.data);

                // Nếu đã đăng nhập, lấy thông tin gói đang dùng
                if (user) {
                    try {
                        const subRes = await api.get('/Patient/current-subscription');
                        setCurrentSub(subRes.data); // data sẽ là { maGoi, trangThai, ... } hoặc null
                    } catch (err) {
                        console.warn("Không lấy được thông tin gói cá nhân", err);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                // Mock data nếu API lỗi
                setPackages([
                    { maGoi: 1, tenGoi: "Gói Cơ Bản", giaTien: 500000, moTa: "Khám tổng quát, Xét nghiệm máu" },
                    { maGoi: 2, tenGoi: "Gói Nâng Cao", giaTien: 1200000, moTa: "Gói cơ bản, Siêu âm tim, X-quang" },
                    { maGoi: 3, tenGoi: "Gói VIP", giaTien: 3000000, moTa: "Gói nâng cao, Phòng VIP, Bác sĩ trưởng khoa" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // 2. Xử lý Đăng ký
    const handleRegister = async (pkg) => {
        if (!user) {
            toast.info("Vui lòng đăng nhập để đăng ký!");
            return navigate('/login');
        }

        // Cho phép đăng ký nhiều gói hoặc chuyển đổi gói (tùy logic backend)
        // if (currentSub) { ... } -> Đã bỏ chặn

        if (window.confirm(`Xác nhận đăng ký "${pkg.tenGoi}"?`)) {
            try {
                await api.post('/Patient/register-package', { MaGoi: pkg.maGoi });
                toast.success("Đăng ký thành công! Vui lòng thanh toán để kích hoạt.");

                // Refresh lại trạng thái ngay lập tức
                const subRes = await api.get('/Patient/current-subscription');
                setCurrentSub(subRes.data);

            } catch (error) {
                toast.error(error.response?.data || "Đăng ký thất bại");
            }
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    const parseFeatures = (desc) => desc ? desc.split(/[\n,-]+/).map(s => s.trim()).filter(s => s) : [];

    // Helper: Xác định trạng thái nút bấm cho từng gói
    const getButtonStatus = (pkgId) => {
        if (!currentSub) return { text: "Đăng Ký Ngay", disabled: false, cls: "btn-primary" };

        if (currentSub.maGoi === pkgId) {
            if (currentSub.trangThai === 'DangDung') {
                return { text: "Đã Đăng Ký (Đang dùng)", disabled: true, cls: "bg-emerald-500 text-white cursor-default" };
            }
            if (currentSub.trangThai === 'ChoDuyet') {
                return { text: "Chờ Duyệt...", disabled: true, cls: "bg-orange-400 text-white cursor-default" };
            }
        }

        // Nếu đã có gói khác thì vẫn cho phép đăng ký gói mới (thay đổi logic cũ)
        return { text: "Đăng Ký Ngay", disabled: false, cls: "btn-primary" };
    };

    return (
        <div>
            <div className="page-container">
                <RevealOnScroll>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '40px' }}>
                        <h2 className="section-title">Gói Khám Sức Khỏe</h2>
                        <p className="section-subtitle">Chọn gói khám phù hợp với nhu cầu. Chi phí minh bạch.</p>
                    </div>

                    {loading ? <div className="text-center py-20">Đang tải...</div> : (
                        <div className="grid-container">
                            {packages.map((pkg, index) => {
                                const btnStatus = getButtonStatus(pkg.maGoi);

                                return (
                                    <div key={pkg.maGoi} className="modern-card" style={{
                                        borderColor: index === 1 ? 'var(--primary)' : '',
                                        transform: index === 1 ? 'scale(1.05)' : 'scale(1)',
                                        zIndex: index === 1 ? 2 : 1
                                    }}>
                                        {index === 1 && <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '5px 15px', fontSize: '0.8rem', borderRadius: '0 0 0 10px', fontWeight: 'bold' }}>Phổ biến nhất</div>}

                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{pkg.tenGoi}</h3>
                                        <div className="price-tag">{formatCurrency(pkg.giaTien)}</div>

                                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px', marginTop: '20px' }}>
                                            {parseFeatures(pkg.moTa).map((f, i) => (
                                                <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', color: '#334155' }}>
                                                    <CheckCircle size={18} color="var(--primary)" /> {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleRegister(pkg)}
                                            disabled={btnStatus.disabled}
                                            className={`btn btn-block ${btnStatus.cls !== "btn-primary" ? "" : (index === 1 ? 'btn-primary' : 'btn-outline')}`}
                                            // Nếu có class riêng từ logic trạng thái thì dùng style inline đè lên hoặc class
                                            style={btnStatus.disabled ? { background: btnStatus.cls.includes('emerald') ? '#10b981' : (btnStatus.cls.includes('orange') ? '#f97316' : '#e2e8f0'), color: btnStatus.disabled ? 'white' : '', borderColor: 'transparent' } : {}}
                                        >
                                            {btnStatus.text}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Payment Info Section (Giữ nguyên như cũ) */}
                    <div className="payment-section">
                        <div className="payment-grid">
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: 'var(--text-primary)' }}>Cam Kết Dịch Vụ</h3>
                                <div className="policy-item">
                                    <div className="policy-icon"><RefreshCw size={24} /></div>
                                    <div><h4 style={{ margin: '0 0 5px 0' }}>Hoàn Tiền</h4><p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hoàn tiền 100% nếu hủy trước 24h.</p></div>
                                </div>
                                <div className="policy-item">
                                    <div className="policy-icon"><ShieldCheck size={24} /></div>
                                    <div><h4 style={{ margin: '0 0 5px 0' }}>Bảo Mật</h4><p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thông tin được mã hóa tuyệt đối.</p></div>
                                </div>
                            </div>
                            <div className="payment-box">
                                <h3 style={{ marginBottom: '15px' }}>Thanh Toán</h3>
                                <div className="qr-container">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=Healthes-Payment" alt="QR" className="qr-img" />
                                </div>
                                <div className="payment-methods-icons">
                                    <div title="MoMo" style={{ display: 'flex', gap: '5px', alignItems: 'center', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '5px' }}><Smartphone size={20} color="#a50064" /> MoMo</div>
                                    <div title="Visa" style={{ display: 'flex', gap: '5px', alignItems: 'center', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '5px' }}><CreditCard size={20} color="#1a1f71" /> Visa</div>
                                    <div title="Banking" style={{ display: 'flex', gap: '5px', alignItems: 'center', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '5px' }}><Banknote size={20} color="#007bff" /> Bank</div>
                                </div>
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