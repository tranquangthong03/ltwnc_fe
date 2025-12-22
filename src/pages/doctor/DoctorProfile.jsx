import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    User, Phone, Award, Stethoscope, DollarSign, Save, Loader,
    MapPin, Mail, Camera, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const DoctorProfile = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        fullName: '', phone: '', specialty: '', experience: 0, price: 0, bio: '', email: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/Doctor/profile');
                const d = res.data;
                setProfile({
                    fullName: d.hoTen || '',
                    phone: d.soDienThoai || '',
                    specialty: d.chuyenKhoa || '',
                    experience: d.kinhNghiem || 0,
                    price: d.giaKham || 0,
                    bio: d.moTa || '',
                    email: d.email || 'doctor@system.com'
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
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
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <Loader className="animate-spin text-emerald-400 mb-3" size={40} />
            <p className="text-slate-400 font-medium animate-pulse">Đang tải...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">

            {/* --- HEADER CARD --- */}
            <div className="relative bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group">
                {/* Ảnh bìa: Dùng màu Teal-400 và Emerald-400 cho dịu mắt */}
                <div className="h-52 bg-gradient-to-r from-emerald-400 to-teal-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md flex items-center gap-2 transition-all">
                            <Camera size={16} /> Đổi ảnh bìa
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-end -mt-14 gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-md">
                                {/* Chữ: Màu Emerald-500, căn giữa */}
                                <div className="w-4/5 h-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl font-bold text-emerald-500 border border-slate-100 overflow-hidden leading-none pt-2">
                                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'D'}
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 bg-white text-slate-600 border border-slate-100 p-2 rounded-xl hover:text-emerald-500 transition-all shadow-sm">
                                <Camera size={16} />
                            </button>
                        </div>

                        {/* Tên & Info */}
                        <div className="flex-1 mb-2 text-center md:text-left">
                            <h1 className="text-3xl font-extrabold text-slate-700 tracking-tight">
                                {profile.fullName || "Chưa cập nhật tên"}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6 text-slate-500 mt-2 text-sm font-medium">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Stethoscope size={16} /> {profile.specialty || "Chuyên khoa trống"}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg">
                                    <MapPin size={16} className="text-rose-400" /> Bệnh viện Đa Khoa
                                </span>
                            </div>
                        </div>

                        {/* Nút Save: Màu dịu hơn (Emerald-500) */}
                        <div className="mb-3 hidden md:block">
                            <button
                                onClick={handleSave}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Save size={18} /> Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FORM INPUTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Cột Trái: Thông tin cá nhân */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
                                <User size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-700">Thông tin cá nhân</h3>
                                <p className="text-slate-400 text-xs font-medium">Thông tin liên hệ cơ bản</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Họ và tên</label>
                                <input
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    className="w-4/5 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-slate-700"
                                    placeholder="Nhập họ tên..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        className="w-4/5 pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-slate-700"
                                        placeholder="0912..."
                                    />
                                </div>
                            </div>
                            {/* Email Readonly */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Email đăng nhập</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        disabled
                                        value={profile.email}
                                        className="w-4/5 pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Giới thiệu bản thân</label>
                                <textarea
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleChange}
                                    className="w-4/5 px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none h-28 resize-none leading-relaxed text-slate-600"
                                    placeholder="Viết đôi dòng giới thiệu..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột Phải: Thông tin Chuyên môn */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                            <div className="p-2.5 bg-teal-50 text-teal-500 rounded-xl">
                                <Award size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-700">Chuyên môn</h3>
                                <p className="text-slate-400 text-xs font-medium">Thông tin hành nghề</p>
                            </div>
                        </div>

                        <div className="space-y-5 flex-1">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Chuyên khoa</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={16} />
                                    <input
                                        name="specialty"
                                        value={profile.specialty}
                                        onChange={handleChange}
                                        className="w-4/5 pl-10 pr-4 py-2.5 bg-teal-50/30 border border-transparent rounded-xl focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none font-bold text-teal-700 placeholder:text-teal-700/50"
                                        placeholder="Tim mạch..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Kinh nghiệm (Năm)</label>
                                <div className="relative">
                                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={16} />
                                    <input
                                        name="experience"
                                        type="number"
                                        value={profile.experience}
                                        onChange={handleChange}
                                        className="w-4/5 pl-10 pr-4 py-2.5 bg-orange-50/50 border border-transparent rounded-xl focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold text-orange-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Giá khám / Lượt</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        name="price"
                                        type="number"
                                        value={profile.price}
                                        onChange={handleChange}
                                        className="w-4/5 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-mono font-bold text-emerald-600 text-lg"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VND</div>
                                </div>
                                <p className="text-xs text-right text-emerald-500 font-medium mt-1">
                                    {formatCurrency(profile.price)}
                                </p>
                            </div>
                        </div>

                        {/* Mobile Save Button */}
                        <div className="mt-6 md:hidden">
                            <button onClick={handleSave} className="w-4/5 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md transition-all active:scale-95">
                                <Save size={18} /> Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;