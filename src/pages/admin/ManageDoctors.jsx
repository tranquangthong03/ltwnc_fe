import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    Plus, Edit, Trash2, Search, X,
    Mail, Phone, Stethoscope, DollarSign,
    Award, RefreshCw,
    Users, UserCheck, UserX,
    MoreHorizontal, ShieldCheck, FileText, Lock, User, Image
} from 'lucide-react';

const ManageDoctors = () => {
    // =========================================================================
    // PHẦN LOGIC (GIỮ NGUYÊN HOÀN TOÀN)
    // =========================================================================
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
        gioiThieu: '',
        anhBacSi: '' // Đường dẫn ảnh
    };

    const [currentDoctor, setCurrentDoctor] = useState(initialFormState);
    const [selectedImage, setSelectedImage] = useState(null); // File ảnh được chọn
    const [imagePreview, setImagePreview] = useState(null); // Preview ảnh

    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // --- XỬ LÝ CHỌỌ ẢNH ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ảnh không được vượt quá 5MB');
                return;
            }
            
            // Kiểm tra loại file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF)');
                return;
            }

            setSelectedImage(file);
            
            // Tạo preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- FETCH DATA ---
    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/doctors');
            setDoctors(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách bác sĩ:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    // --- LOGIC LỌC & SẮP XẾP ---
    const specialties = useMemo(() => {
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
            default: // Newest
                result.sort((a, b) => (b.MaBacSi || b.maBacSi || 0) - (a.MaBacSi || a.maBacSi || 0));
                break;
        }

        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            result = result.filter(d => (d.TrangThai === isActive));
        }

        return result;
    }, [doctors, searchTerm, selectedSpecialty, sortConfig, statusFilter]);

    // --- XỬ LÝ LƯU ---
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                hoTen: currentDoctor.hoTen,
                email: currentDoctor.email,
                soDienThoai: currentDoctor.soDienThoai,
                chuyenKhoa: currentDoctor.chuyenKhoa,
                soChungChi: currentDoctor.soChungChi,
                giaKham: Number(currentDoctor.giaKham),
                gioiThieu: currentDoctor.gioiThieu
            };

            let doctorId = currentDoctor.maNguoiDung;

            if (isEditing) {
                await api.put(`/Admin/update-doctor/${doctorId}`, payload);
                toast.success("Cập nhật thành công!");
            } else {
                const createPayload = {
                    ...payload,
                    tenDangNhap: currentDoctor.tenDangNhap,
                    matKhau: currentDoctor.matKhau
                };
                const response = await api.post('/Admin/add-doctor', createPayload);
                
                // Lấy ID bác sĩ vừa tạo từ response
                doctorId = response.data.maBacSi || response.data.MaBacSi;
                toast.success("Thêm bác sĩ thành công!");
            }

            // Upload ảnh nếu có
            if (selectedImage && doctorId) {
                const formData = new FormData();
                formData.append('imageFile', selectedImage);
                
                try {
                    await api.post(`/Admin/upload-doctor-image/${doctorId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    toast.success('Ảnh đã được tải lên!');
                } catch (imgError) {
                    console.error('Lỗi upload ảnh:', imgError);
                    toast.warning('Lưu thông tin thành công nhưng không thể tải ảnh');
                }
            }

            setShowModal(false);
            setSelectedImage(null);
            setImagePreview(null);
            fetchDoctors();
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
                await api.delete(`/Admin/delete-user/${id}`);
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
            setCurrentDoctor({
                maNguoiDung: doctor.MaBacSi || doctor.maBacSi,
                tenDangNhap: doctor.TenDangNhap || doctor.tenDangNhap || '',
                matKhau: '',
                hoTen: doctor.HoTen || doctor.hoTen || '',
                email: doctor.Email || doctor.email || '',
                soDienThoai: doctor.SoDienThoai || doctor.soDienThoai || '',
                chuyenKhoa: doctor.ChuyenKhoa || doctor.chuyenKhoa || '',
                soChungChi: doctor.SoChungChi || doctor.soChungChi || '',
                giaKham: doctor.GiaKham || doctor.giaKham || 0,
                gioiThieu: doctor.GioiThieu || doctor.gioiThieu || doctor.MoTa || doctor.moTa || '',
                anhBacSi: doctor.AnhBacSi || doctor.anhBacSi || ''
            });
            // Set preview ảnh hiện tại nếu có
            if (doctor.AnhBacSi || doctor.anhBacSi) {
                setImagePreview(`http://localhost:5119${doctor.AnhBacSi || doctor.anhBacSi}`);
            } else {
                setImagePreview(null);
            }
        } else {
            setIsEditing(false);
            setCurrentDoctor(initialFormState);
            setImagePreview(null);
        }
        setSelectedImage(null);
        setShowModal(true);
    };

    // =========================================================================
    // PHẦN GIAO DIỆN (ĐÃ FIX LỖI Z-INDEX VÀ LAYOUT)
    // =========================================================================
    return (
        <div className="min-h-screen bg-slate-50/50 relative">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 p-6 lg:p-10 max-w-[1920px] mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
                            Quản lý Bác sĩ
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">
                            Danh sách đội ngũ chuyên gia y tế
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-4/5 lg:w-auto">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {doctors.length} bác sĩ trong hệ thống
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={22} strokeWidth={2.5} />
                            <span>Thêm mới</span>
                        </button>
                    </div>
                </div>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <Users size={24} />
                            </div>
                            <p className="text-slate-500 font-semibold mb-1">Tổng số lượng</p>
                            <h3 className="text-3xl font-bold text-slate-800">{doctors.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                                <Award size={24} />
                            </div>
                            <p className="text-slate-500 font-semibold mb-1">Chuyên khoa</p>
                            <h3 className="text-3xl font-bold text-slate-800">{specialties.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                <UserCheck size={24} />
                            </div>
                            <p className="text-slate-500 font-semibold mb-1">Đang hoạt động</p>
                            <h3 className="text-3xl font-bold text-slate-800">{processedDoctors.length}</h3>
                        </div>
                    </div>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="sticky top-4 z-30 mb-8">
                    <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
                        <div className="relative w-4/5 md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, email, SĐT..."
                                className="w-4/5 pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex w-4/5 md:w-auto items-center gap-2">
                            <div className="flex w-4/5 md:w-auto bg-slate-100/50 p-1.5 rounded-xl gap-1 overflow-x-auto">
                                {[
                                    { id: 'all', label: 'Tất cả', icon: Users },
                                    { id: 'active', label: 'Hoạt động', icon: UserCheck },
                                    { id: 'locked', label: 'Đã khóa', icon: UserX }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setStatusFilter(filter.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${statusFilter === filter.id
                                            ? 'bg-white text-slate-800 shadow-sm'
                                            : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                            }`}
                                    >
                                        <filter.icon size={16} className={statusFilter === filter.id ? 'text-blue-600' : ''} />
                                        <span>{filter.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={fetchDoctors} className="p-3 bg-white text-slate-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors hidden md:block border border-slate-100 shadow-sm" title="Tải lại">
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- MAIN GRID LIST --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse shadow-sm border border-slate-100"></div>
                        ))
                    ) : processedDoctors.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700">Không tìm thấy kết quả</h3>
                            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100">
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : (
                        processedDoctors.map((doc) => {
                            const avatarLetter = (doc.HoTen || doc.hoTen || "D").charAt(0).toUpperCase();
                            const status = doc.TrangThai === false ? 'locked' : 'active';
                            const doctorImage = doc.AnhBacSi || doc.anhBacSi;

                            return (
                                <div key={doc.MaBacSi || doc.maBacSi} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
                                    <div className={`h-1.5 w-4/5 ${status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <div className="p-6 pb-0 flex justify-between items-start">
                                        {/* Hiển thị ảnh hoặc avatar mặc định */}
                                        {doctorImage ? (
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-100">
                                                <img 
                                                    src={`http://localhost:5119${doctorImage}`} 
                                                    alt={doc.HoTen || doc.hoTen}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFMkU4RjAiLz48cGF0aCBkPSJNMzIgMzJDMzYuNDE4MyAzMiA0MCAyOC40MTgzIDQwIDI0QzQwIDE5LjU4MTcgMzYuNDE4MyAxNiAzMiAxNkMyNy41ODE3IDE2IDI0IDE5LjU4MTcgMjQgMjRDMjQgMjguNDE4MyAyNy41ODE3IDMyIDMyIDMyWiIgZmlsbD0iIzk0QTNCOCIvPjxwYXRoIGQ9Ik0xNiA0OEMxNiA0MC4yNjggMjIuMjY4IDM0IDMwIDM0SDM0QzQxLjczMiAzNCA0OCA0MC4yNjggNDggNDhWNTJIMTZWNDhaIiBmaWxsPSIjOTRBM0I4Ii8+PC9zdmc+';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${status === 'active' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-400'}`}>
                                                {avatarLetter}
                                            </div>
                                        )}
                                        <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal /></button>
                                    </div>
                                    <div className="p-6 flex-1">
                                        <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                            {doc.HoTen || doc.hoTen}
                                        </h3>
                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                                            {doc.ChuyenKhoa || doc.chuyenKhoa}
                                        </span>
                                        <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 my-4">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Giá khám</p>
                                                <p className="font-bold text-emerald-600 text-sm">{formatCurrency(doc.GiaKham || doc.giaKham)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">ID Bác sĩ</p>
                                                <p className="font-bold text-slate-700 text-sm">#{doc.MaBacSi || doc.maBacSi}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-slate-500">
                                            <div className="flex items-center gap-3"><Mail size={14} className="shrink-0" /> <span className="truncate">{doc.Email || doc.email}</span></div>
                                            <div className="flex items-center gap-3"><Phone size={14} className="shrink-0" /> <span>{doc.SoDienThoai || doc.soDienThoai || '—'}</span></div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50/50">
                                        <button onClick={() => openModal(doc)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all">
                                            <Edit size={16} /> Sửa
                                        </button>
                                        <button onClick={() => handleDelete(doc.MaBacSi || doc.maBacSi)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition-all">
                                            <Trash2 size={16} /> Xóa
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* --- MODAL FORM (ĐÃ SỬA: Z-INDEX CAO & THU GỌN) --- */}
                {showModal && (
                    // FIX: z-[9999] để đè lên Sidebar, thay vì z-[100]
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>

                        {/* FIX: Thay max-w-5xl thành max-w-4xl để input đỡ bị dài */}
                        <div className="relative w-4/5 max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
                            {/* Header Modal */}
                            <div className="px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                        {isEditing ? <Edit size={20} /> : <Plus size={20} />}
                                    </div>
                                    {isEditing ? 'Cập nhật thông tin bác sĩ' : 'Thêm bác sĩ mới'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body Modal */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                                <form id="doctorForm" onSubmit={handleSave} className="space-y-6">

                                    {/* SECTION 1: TÀI KHOẢN */}
                                    {!isEditing && (
                                        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500"></div>
                                            <h3 className="text-blue-800 font-bold mb-4 flex items-center gap-2 text-lg">
                                                <ShieldCheck className="text-blue-600" /> Thông tin đăng nhập
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <User size={16} className="text-slate-400" /> Tên đăng nhập <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        required
                                                        className="w-4/5 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium bg-slate-50 focus:bg-white"
                                                        placeholder="VD: bacsi_tuan"
                                                        value={currentDoctor.tenDangNhap}
                                                        onChange={e => setCurrentDoctor({ ...currentDoctor, tenDangNhap: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <Lock size={16} className="text-slate-400" /> Mật khẩu <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        required type="password"
                                                        className="w-4/5 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium bg-slate-50 focus:bg-white"
                                                        placeholder="••••••"
                                                        value={currentDoctor.matKhau}
                                                        onChange={e => setCurrentDoctor({ ...currentDoctor, matKhau: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* SECTION 2: CHIA 2 CỘT (Cá nhân - Chuyên môn) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* CỘT TRÁI: CÁ NHÂN */}
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">1</div>
                                                <h3 className="font-bold text-slate-700 text-base">Thông tin cá nhân</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-600">Họ và tên <span className="text-red-500">*</span></label>
                                                    <input
                                                        required
                                                        className="w-4/5 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                        placeholder="Nguyễn Văn A"
                                                        value={currentDoctor.hoTen}
                                                        onChange={e => setCurrentDoctor({ ...currentDoctor, hoTen: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-600">Email <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                        <input
                                                            required type="email"
                                                            className="w-4/5 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                            placeholder="email@benhvien.com"
                                                            value={currentDoctor.email}
                                                            onChange={e => setCurrentDoctor({ ...currentDoctor, email: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-600">Số điện thoại</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                        <input
                                                            className="w-4/5 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                                            placeholder="0912..."
                                                            value={currentDoctor.soDienThoai}
                                                            onChange={e => setCurrentDoctor({ ...currentDoctor, soDienThoai: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CỘT PHẢI: CHUYÊN MÔN */}
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">2</div>
                                                <h3 className="font-bold text-slate-700 text-base">Chuyên môn & Công việc</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-600">Chuyên khoa <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                        <input
                                                            required
                                                            className="w-4/5 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                                            placeholder="VD: Tim mạch..."
                                                            value={currentDoctor.chuyenKhoa}
                                                            onChange={e => setCurrentDoctor({ ...currentDoctor, chuyenKhoa: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-600">Giá khám</label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input
                                                                type="number" required min="0" step="1000"
                                                                className="w-4/5 pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                                                value={currentDoctor.giaKham}
                                                                onChange={e => setCurrentDoctor({ ...currentDoctor, giaKham: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-600">Chứng chỉ</label>
                                                        <div className="relative">
                                                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input
                                                                className="w-4/5 pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                                                placeholder="Số CCHN"
                                                                value={currentDoctor.soChungChi}
                                                                onChange={e => setCurrentDoctor({ ...currentDoctor, soChungChi: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                                        <FileText size={16} className="text-slate-400" /> Giới thiệu
                                                    </label>
                                                    <textarea
                                                        className="w-4/5 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all h-20 resize-none"
                                                        placeholder="Nhập thông tin giới thiệu..."
                                                        value={currentDoctor.gioiThieu}
                                                        onChange={e => setCurrentDoctor({ ...currentDoctor, gioiThieu: e.target.value })}
                                                    ></textarea>
                                                </div>

                                                {/* UPLOAD ẢNH */}
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                                        <Image size={16} className="text-slate-400" /> Ảnh bác sĩ
                                                    </label>
                                                    <div className="flex items-start gap-4">
                                                        {/* Preview ảnh */}
                                                        <div className="flex-shrink-0">
                                                            {imagePreview ? (
                                                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-200 shadow-md group">
                                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setImagePreview(null);
                                                                            setSelectedImage(null);
                                                                        }}
                                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                                    >
                                                                        <X className="text-white" size={20} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                                                                    <Image className="text-slate-400" size={32} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Input file */}
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                id="doctorImage"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                className="hidden"
                                                            />
                                                            <label
                                                                htmlFor="doctorImage"
                                                                className="cursor-pointer inline-block px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all font-semibold text-sm"
                                                            >
                                                                Chọn ảnh từ máy
                                                            </label>
                                                            <p className="text-xs text-slate-500 mt-2">
                                                                JPG, PNG hoặc GIF (tối đa 5MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer Modal */}
                            <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                                    Hủy bỏ
                                </button>
                                <button form="doctorForm" type="submit" className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                                    {isEditing ? 'Lưu thay đổi' : 'Tạo mới bác sĩ'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default ManageDoctors;