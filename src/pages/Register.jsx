// src/pages/Register.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus, User, Lock, Mail, Phone, MapPin, Calendar, Heart } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        TenDangNhap: '',
        MatKhau: '',
        HoTen: '',
        Email: '',
        SoDienThoai: '',
        GioiTinh: 'Nam',
        DiaChi: '',
        NgaySinh: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                TenDangNhap: formData.TenDangNhap,
                MatKhau: formData.MatKhau,
                HoTen: formData.HoTen,
                Email: formData.Email,
                SoDienThoai: formData.SoDienThoai,
                GioiTinh: formData.GioiTinh,
                DiaChi: formData.DiaChi,
                NgaySinh: formData.NgaySinh || null
            };
            
            console.log('Sending register payload:', payload);
            
            // Gọi API đăng ký
            await api.post('/Auth/register', payload);

            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login'); // Chuyển về trang đăng nhập
        } catch (err) {
            // Lấy lỗi từ Backend trả về (nếu có)
            console.error('Register error:', err.response?.data || err.message);
            const errorMsg = err.response?.data || "Đăng ký thất bại. Vui lòng thử lại.";
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box" style={{ maxWidth: '500px' }}> {/* Box rộng hơn chút */}
                <h2 className="section-title">Đăng Ký Tài Khoản</h2>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-secondary)' }}>
                    Tạo tài khoản để chăm sóc sức khỏe toàn diện
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '13px', left: '12px', color: '#94a3b8' }} />
                            <input
                                type="text" name="HoTen" className="form-input" style={{ paddingLeft: '40px' }}
                                placeholder="Nguyễn Văn A" onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Tên đăng nhập</label>
                            <input type="text" name="TenDangNhap" className="form-input" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mật khẩu</label>
                            <input type="password" name="MatKhau" className="form-input" onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name="Email" className="form-input" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số điện thoại</label>
                            <input type="text" name="SoDienThoai" className="form-input" onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Ngày sinh</label>
                            <input type="date" name="NgaySinh" className="form-input" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Giới tính</label>
                            <select name="GioiTinh" className="form-input" onChange={handleChange} value={formData.GioiTinh}>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Địa chỉ</label>
                        <input type="text" name="DiaChi" className="form-input" onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
                        <UserPlus size={18} /> Đăng Ký Ngay
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;