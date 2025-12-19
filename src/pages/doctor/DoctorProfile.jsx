import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Phone, Award, Stethoscope, DollarSign, Save, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const DoctorProfile = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        fullName: '', phone: '', specialty: '', experience: 0, price: 0, bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/Doctor/profile');
                const d = res.data;

                // MAP DỮ LIỆU TỪ BACKEND (camelCase)
                setProfile({
                    fullName: d.hoTen || '',
                    phone: d.soDienThoai || '',
                    specialty: d.chuyenKhoa || '',
                    experience: d.kinhNghiem || 0,
                    price: d.giaKham || 0,
                    bio: d.moTa || ''
                });
            } catch (error) {
                toast.error("Lỗi tải thông tin.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            // Gửi dữ liệu đi (Backend nhận PascalCase hay camelCase đều được, nhưng tốt nhất gửi đúng DTO)
            const payload = {
                HoTen: profile.fullName,
                SoDienThoai: profile.phone,
                ChuyenKhoa: profile.specialty,
                KinhNghiem: parseInt(profile.experience) || 0,
                GiaKham: parseFloat(profile.price) || 0,
                GioiThieu: profile.bio
            };

            await api.put('/Doctor/profile', payload);
            toast.success("Cập nhật thành công!");
        } catch (error) {
            toast.error("Lỗi cập nhật.");
        }
    };

    const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">Hồ Sơ Bác Sĩ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Họ Tên</label>
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-slate-50">
                        <User size={18} className="text-slate-400 mr-3" />
                        <input name="fullName" value={profile.fullName} onChange={handleChange} className="w-full bg-transparent outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Số Điện Thoại</label>
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-slate-50">
                        <Phone size={18} className="text-slate-400 mr-3" />
                        <input name="phone" value={profile.phone} onChange={handleChange} className="w-full bg-transparent outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Chuyên Khoa</label>
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-slate-50">
                        <Stethoscope size={18} className="text-slate-400 mr-3" />
                        <input name="specialty" value={profile.specialty} onChange={handleChange} className="w-full bg-transparent outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kinh Nghiệm (Năm)</label>
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-slate-50">
                        <Award size={18} className="text-slate-400 mr-3" />
                        <input name="experience" type="number" value={profile.experience} onChange={handleChange} className="w-full bg-transparent outline-none" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Giá Khám (VNĐ)</label>
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-slate-50">
                        <DollarSign size={18} className="text-slate-400 mr-3" />
                        <input name="price" type="number" value={profile.price} onChange={handleChange} className="w-full bg-transparent outline-none font-bold" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Giới Thiệu</label>
                    <textarea name="bio" value={profile.bio} onChange={handleChange} className="w-full border rounded-lg p-3 h-32 resize-none outline-none" />
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all">
                    <Save size={20} /> Lưu Thay Đổi
                </button>
            </div>
        </div>
    );
};

export default DoctorProfile;