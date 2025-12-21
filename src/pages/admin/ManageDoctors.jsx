import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api'; // Đảm bảo đường dẫn import đúng
import { toast } from 'react-toastify';
import {
    Plus, Edit, Trash2, Search, X,
    Mail, Phone, Stethoscope, DollarSign,
    Award, ChevronRight, Filter, ArrowUpDown, RefreshCw,
    User, Users, TrendingUp, UserCheck, UserX
} from 'lucide-react';

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- STATE BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [sortConfig, setSortConfig] = useState('newest');
    const [statusFilter, setStatusFilter] = useState('all');

    // State Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Initial State cho form
    const initialFormState = {
        maNguoiDung: 0,
        tenDangNhap: '',
        matKhau: '',
        hoTen: '',
        email: '',
        soDienThoai: '',
        chuyenKhoa: '',
        soChungChi: '',
        giaKham: '',
        gioiThieu: ''
    };

    const [currentDoctor, setCurrentDoctor] = useState(initialFormState);

    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // --- FETCH DATA ---
    const fetchDoctors = async () => {
        setLoading(true);
        try {
            // Gọi API AdminController -> GetDoctors
            const res = await api.get('/Admin/doctors');
            setDoctors(res.data);
            console.log("Doctors loaded:", res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách bác sĩ:", error);
            // toast.error("Không thể tải dữ liệu bác sĩ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    // --- LOGIC LỌC & SẮP XẾP ---
    const specialties = useMemo(() => {
        // Xử lý cả PascalCase và camelCase
        const specs = doctors.map(d => d.ChuyenKhoa || d.chuyenKhoa).filter(Boolean);
        return [...new Set(specs)];
    }, [doctors]);

    const processedDoctors = useMemo(() => {
        let result = [...doctors];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(d =>
                (d.HoTen || d.hoTen || "").toLowerCase().includes(lowerTerm) ||
                (d.Email || d.email || "").toLowerCase().includes(lowerTerm) ||
                (d.SoDienThoai || d.soDienThoai || "").includes(lowerTerm)
            );
        }

        if (selectedSpecialty !== 'All') {
            result = result.filter(d => (d.ChuyenKhoa || d.chuyenKhoa) === selectedSpecialty);
        }

        switch (sortConfig) {
            case 'price-asc':
                result.sort((a, b) => (a.GiaKham || a.giaKham || 0) - (b.GiaKham || b.giaKham || 0));
                break;
            case 'price-desc':
                result.sort((a, b) => (b.GiaKham || b.giaKham || 0) - (a.GiaKham || a.giaKham || 0));
                break;
            case 'name-asc':
                result.sort((a, b) => (a.HoTen || a.hoTen || "").localeCompare(b.HoTen || b.hoTen || ""));
                break;
            default: // Newest (theo ID giảm dần)
                result.sort((a, b) => (b.MaBacSi || b.maBacSi || 0) - (a.MaBacSi || a.maBacSi || 0));
                break;
        }

        // Lọc theo trạng thái (nếu không phải là "tất cả")
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            result = result.filter(d => (d.TrangThai === isActive));
        }

        return result;
    }, [doctors, searchTerm, selectedSpecialty, sortConfig, statusFilter]);

    // --- XỬ LÝ LƯU (THÊM / SỬA) ---
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            // Chuẩn bị payload khớp với Backend DTO (DoctorCreateDto / DoctorUpdateDto)
            const payload = {
                hoTen: currentDoctor.hoTen,
                email: currentDoctor.email,
                soDienThoai: currentDoctor.soDienThoai,
                chuyenKhoa: currentDoctor.chuyenKhoa,
                soChungChi: currentDoctor.soChungChi,
                giaKham: Number(currentDoctor.giaKham),
                gioiThieu: currentDoctor.gioiThieu
            };

            if (isEditing) {
                // UPDATE: /api/Admin/update-doctor/{id}
                await api.put(`/Admin/update-doctor/${currentDoctor.maNguoiDung}`, payload);
                toast.success("Cập nhật thành công!");
            } else {
                // CREATE: /api/Admin/add-doctor
                // Payload create cần thêm username/pass
                const createPayload = {
                    ...payload,
                    tenDangNhap: currentDoctor.tenDangNhap,
                    matKhau: currentDoctor.matKhau
                };
                await api.post('/Admin/add-doctor', createPayload);
                toast.success("Thêm bác sĩ thành công!");
            }

            setShowModal(false);
            fetchDoctors(); // Refresh list
        } catch (error) {
            console.error("Error saving doctor:", error);
            const errorMessage = error.response?.data?.message || error.response?.data || "Có lỗi xảy ra";
            toast.error(typeof errorMessage === 'string' ? errorMessage : "Lỗi server");
        }
    };

    // --- XỬ LÝ XÓA ---
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này? Hành động này cũng sẽ xóa tài khoản người dùng.")) {
            try {
                // DELETE: /api/Admin/delete-user/{id}
                await api.delete(`/Admin/delete-user/${id}`);
                // Cập nhật UI ngay lập tức
                setDoctors(prev => prev.filter(d => (d.MaBacSi || d.maBacSi) !== id));
                toast.success("Đã xóa bác sĩ");
            } catch (error) {
                console.error(error);
                toast.error("Không thể xóa. Có thể bác sĩ đang có lịch hẹn.");
            }
        }
    };

    // --- MỞ MODAL ---
    const openModal = (doctor = null) => {
        if (doctor) {
            setIsEditing(true);
            // Mapping dữ liệu từ Backend (PascalCase hoặc camelCase) sang Form State (camelCase)
            setCurrentDoctor({
                maNguoiDung: doctor.MaBacSi || doctor.maBacSi,
                tenDangNhap: doctor.TenDangNhap || doctor.tenDangNhap || '',
                matKhau: '', // Không hiển thị mật khẩu
                hoTen: doctor.HoTen || doctor.hoTen || '',
                email: doctor.Email || doctor.email || '',
                soDienThoai: doctor.SoDienThoai || doctor.soDienThoai || '',
                chuyenKhoa: doctor.ChuyenKhoa || doctor.chuyenKhoa || '',
                soChungChi: doctor.SoChungChi || doctor.soChungChi || '',
                giaKham: doctor.GiaKham || doctor.giaKham || 0,
                gioiThieu: doctor.GioiThieu || doctor.gioiThieu || doctor.MoTa || doctor.moTa || ''
            });
        } else {
            setIsEditing(false);
            setCurrentDoctor(initialFormState);
        }
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Background Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative p-6 md:p-8 lg:p-10">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Stethoscope className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
                                    Quản lý Bác sĩ
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium">Hệ thống quản lý đội ngũ y bác sĩ chuyên nghiệp</p>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="group px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus size={20} />
                            <span>Thêm Bác sĩ</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Tổng bác sĩ</p>
                                    <p className="text-2xl font-bold text-slate-800">{doctors.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <User className="text-blue-600" size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Chuyên khoa</p>
                                    <p className="text-2xl font-bold text-purple-600">{specialties.length}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Stethoscope className="text-purple-600" size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Hiển thị</p>
                                    <p className="text-2xl font-bold text-emerald-600">{processedDoctors.length}</p>
                                </div>
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                    <TrendingUp className="text-emerald-600" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar - FIXED */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg mb-6 overflow-hidden">
                    <div className="p-5">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Box */}
                            <div className="lg:w-2/3 relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur transition-opacity"></div>
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên, email, sđt..."
                                    className="relative w-full pl-12 pr-10 py-3.5 bg-slate-50/50 border-2 border-slate-200/60 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition z-10"
                                        title="Xóa từ khóa"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter Buttons */}
                            <div className="flex gap-2 lg:w-1/3 justify-end flex-wrap lg:flex-nowrap">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter("all")}
                                    className={
                                        "px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap " +
                                        (statusFilter === "all"
                                            ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-500/30"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-200")
                                    }
                                >
                                    <Users size={18} />
                                    <span className="hidden sm:inline">Tất cả</span>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter("active")}
                                    className={
                                        "px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap " +
                                        (statusFilter === "active"
                                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200")
                                    }
                                >
                                    <UserCheck size={18} />
                                    <span className="hidden sm:inline">Hoạt động</span>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter("locked")}
                                    className={
                                        "px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap " +
                                        (statusFilter === "locked"
                                            ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30"
                                            : "bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200")
                                    }
                                >
                                    <UserX size={18} />
                                    <span className="hidden sm:inline">Đã khóa</span>
                                </button>
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        {(searchTerm || statusFilter !== "all") && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                <span className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                                    <Filter size={14} />
                                    Bộ lọc đang áp dụng:
                                </span>
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                        Từ khóa: "{searchTerm}"
                                        <button 
                                          type="button" 
                                          onClick={() => setSearchTerm("")} 
                                          className="hover:text-blue-900 transition"
                                        >
                                          <X size={14} />
                                        </button>
                                    </span>
                                )}
                                {statusFilter !== "all" && (
                                    <span className={
                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border " +
                                        (statusFilter === "active" 
                                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                          : "bg-red-100 text-red-700 border-red-200")
                                    }>
                                        Trạng thái: {statusFilter === "active" ? "Hoạt động" : "Đã khóa"}
                                        <button 
                                          type="button" 
                                          onClick={() => setStatusFilter("all")} 
                                          className="hover:opacity-70 transition"
                                        >
                                          <X size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Doctor Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : processedDoctors.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <Search size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Không tìm thấy bác sĩ nào</h3>
                            <p className="text-slate-500">Thử thay đổi bộ lọc hoặc tìm kiếm lại</p>
                        </div>
                    ) : (
                        processedDoctors.map((doc) => (
                            <div
                                key={doc.MaBacSi || doc.maBacSi}
                                className="group bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 relative p-6">
                                    <div className="absolute inset-0 bg-white/5 pattern-grid opacity-20"></div>
                                    <div className="absolute -bottom-10 left-6">
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-white">
                                            {(doc.HoTen || doc.hoTen)?.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                                        #{doc.MaBacSi || doc.maBacSi}
                                    </div>
                                </div>

                                <div className="pt-12 px-6 pb-6">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-xl text-slate-800 line-clamp-1" title={doc.HoTen || doc.hoTen}>
                                            {doc.HoTen || doc.hoTen}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                                            <Mail size={14} /> {doc.Email || doc.email}
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Stethoscope size={16} className="text-blue-500" /> Chuyên khoa
                                            </span>
                                            <span className="font-bold text-slate-800">{doc.ChuyenKhoa || doc.chuyenKhoa}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-slate-600 font-medium">
                                                <DollarSign size={16} className="text-emerald-500" /> Giá khám
                                            </span>
                                            <span className="font-bold text-emerald-600">{formatCurrency(doc.GiaKham || doc.giaKham)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Phone size={16} className="text-purple-500" /> SĐT
                                            </span>
                                            <span className="font-semibold text-slate-700">{doc.SoDienThoai || doc.soDienThoai || "—"}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(doc)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm group/btn"
                                        >
                                            <Edit size={16} className="group-hover/btn:rotate-12 transition-transform" /> Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.MaBacSi || doc.maBacSi)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all font-semibold text-sm group/btn"
                                        >
                                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    {isEditing ? <Edit size={24} /> : <Plus size={24} />}
                                    {isEditing ? 'Cập nhật thông tin bác sĩ' : 'Thêm bác sĩ mới'}
                                </h3>
                                <p className="text-blue-100 text-sm mt-1">Vui lòng điền đầy đủ thông tin bên dưới</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSave} className="p-8 overflow-y-auto flex-1 bg-white">
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Thông tin đăng nhập (Chỉ hiện khi tạo mới) */}
                                {!isEditing && (
                                    <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/60 grid md:grid-cols-2 gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                        <div className="md:col-span-2 mb-[-10px]">
                                            <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                                                <User size={16} /> Thông tin đăng nhập
                                            </h4>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                                placeholder="VD: user01"
                                                value={currentDoctor.tenDangNhap}
                                                onChange={e => setCurrentDoctor({ ...currentDoctor, tenDangNhap: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                type="password"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                                placeholder="••••••"
                                                value={currentDoctor.matKhau}
                                                onChange={e => setCurrentDoctor({ ...currentDoctor, matKhau: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Thông tin cá nhân */}
                                <div className="md:col-span-2 mt-2">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                                        Thông tin cá nhân
                                    </h4>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                        placeholder="VD: Nguyễn Văn A"
                                        value={currentDoctor.hoTen}
                                        onChange={e => setCurrentDoctor({ ...currentDoctor, hoTen: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="email"
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="email@example.com"
                                            value={currentDoctor.email}
                                            onChange={e => setCurrentDoctor({ ...currentDoctor, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="0901234567"
                                            value={currentDoctor.soDienThoai}
                                            onChange={e => setCurrentDoctor({ ...currentDoctor, soDienThoai: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Thông tin chuyên môn */}
                                <div className="md:col-span-2 mt-4">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                                        Thông tin chuyên môn
                                    </h4>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Chuyên khoa <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="VD: Tim mạch"
                                            value={currentDoctor.chuyenKhoa}
                                            onChange={e => setCurrentDoctor({ ...currentDoctor, chuyenKhoa: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giá khám (VNĐ) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="1000"
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium font-mono"
                                            placeholder="200000"
                                            value={currentDoctor.giaKham}
                                            onChange={e => setCurrentDoctor({ ...currentDoctor, giaKham: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Số chứng chỉ</label>
                                    <div className="relative">
                                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="CCHN-123"
                                            value={currentDoctor.soChungChi}
                                            onChange={e => setCurrentDoctor({ ...currentDoctor, soChungChi: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu / Mô tả</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium h-24 resize-none"
                                        placeholder="Nhập thông tin giới thiệu về bác sĩ..."
                                        value={currentDoctor.gioiThieu}
                                        onChange={e => setCurrentDoctor({ ...currentDoctor, gioiThieu: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                                >
                                    <span>{isEditing ? 'Lưu thay đổi' : 'Tạo mới'}</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDoctors;