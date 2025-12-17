import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
    Plus, Edit, Trash2, Search, X, 
    Mail, Phone, Stethoscope, DollarSign,
    Award, ChevronRight, Filter, ArrowUpDown, RefreshCw,
    User, TrendingUp
} from 'lucide-react';

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- STATE BỘ LỌC ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [sortConfig, setSortConfig] = useState('newest');

    // State Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState({
        tenDangNhap: '', matKhau: '', hoTen: '', email: '',
        soDienThoai: '', chuyenKhoa: '', soChungChi: '', giaKham: 0, gioiThieu: ''
    });

    const formatCurrency = (value) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            // Test kết nối API trước
            console.log("Testing API connection...");
            try {
                const testRes = await api.get('/Doctor/test');
                console.log("API test successful:", testRes.data);
            } catch (testError) {
                console.error("API test failed:", testError);
                toast.error("Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.");
                setLoading(false);
                return;
            }

            // Thử gọi API từ AdminController
            const res = await api.get('/Admin/doctors');
            console.log("Dữ liệu bác sĩ từ API:", res.data);
            
            // Debug từng bác sĩ
            res.data.forEach((doctor, index) => {
                console.log(`Bác sĩ ${index + 1}:`, {
                    MaBacSi: doctor.MaBacSi,
                    HoTen: doctor.HoTen,
                    Email: doctor.Email,
                    SoDienThoai: doctor.SoDienThoai,
                    ChuyenKhoa: doctor.ChuyenKhoa,
                    GiaKham: doctor.GiaKham,
                    SoChungChi: doctor.SoChungChi
                });
            });
            
            setDoctors(res.data);
            
            if (res.data.length === 0) {
                toast.info("Chưa có bác sĩ nào trong hệ thống");
            } else {
                toast.success(`Đã tải thành công ${res.data.length} bác sĩ`);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách bác sĩ:", error);
            if (error.response?.status === 401) {
                toast.error("Bạn cần đăng nhập với quyền Admin để xem danh sách này.");
            } else if (error.response?.status === 403) {
                toast.error("Bạn không có quyền truy cập chức năng này.");
            } else {
                toast.error("Không thể tải dữ liệu bác sĩ. Vui lòng kiểm tra kết nối API.");
            }
            // Fallback to empty array instead of mock data
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    const specialties = useMemo(() => {
        const specs = doctors.map(d => d.ChuyenKhoa || d.chuyenKhoa).filter(Boolean);
        return [...new Set(specs)];
    }, [doctors]);

    const processedDoctors = useMemo(() => {
        let result = [...doctors];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(d => 
                (d.HoTen || d.hoTen || "")?.toLowerCase().includes(lowerTerm) ||
                (d.Email || d.email || "")?.toLowerCase().includes(lowerTerm) ||
                (d.SoDienThoai || d.soDienThoai || "")?.includes(lowerTerm)
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
            default:
                result.sort((a, b) => (b.MaBacSi || b.maBacSi || 0) - (a.MaBacSi || a.maBacSi || 0));
                break;
        }

        return result;
    }, [doctors, searchTerm, selectedSpecialty, sortConfig]);

    const handleSave = async (e) => {
        e.preventDefault();
        console.log("Saving doctor with data:", currentDoctor);
        
        try {
            if (isEditing) {
                // Payload cho cập nhật (UpdateDoctorDto)
                const updatePayload = {
                    hoTen: currentDoctor.hoTen,
                    email: currentDoctor.email,
                    soDienThoai: currentDoctor.soDienThoai,
                    chuyenKhoa: currentDoctor.chuyenKhoa,
                    soChungChi: currentDoctor.soChungChi,
                    giaKham: Number(currentDoctor.giaKham),
                    gioiThieu: currentDoctor.gioiThieu
                };
                
                console.log("Update payload:", updatePayload);
                await api.put(`/Doctor/${currentDoctor.maNguoiDung}`, updatePayload);
                toast.success("Cập nhật thành công!");
            } else {
                // Payload cho tạo mới (CreateDoctorDto)
                const createPayload = {
                    tenDangNhap: currentDoctor.tenDangNhap,
                    matKhau: currentDoctor.matKhau,
                    hoTen: currentDoctor.hoTen,
                    email: currentDoctor.email,
                    soDienThoai: currentDoctor.soDienThoai,
                    chuyenKhoa: currentDoctor.chuyenKhoa,
                    soChungChi: currentDoctor.soChungChi,
                    giaKham: Number(currentDoctor.giaKham),
                    gioiThieu: currentDoctor.gioiThieu
                };
                
                console.log("Create payload:", createPayload);
                await api.post('/Doctor', createPayload);
                toast.success("Thêm bác sĩ thành công!");
            }
            setShowModal(false);
            fetchDoctors();
        } catch (error) {
            console.error("Error saving doctor:", error);
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này?")) {
            try {
                await api.delete(`/Doctor/${id}`);
                setDoctors(doctors.filter(d => d.maNguoiDung !== id));
                toast.success("Đã xóa bác sĩ");
            } catch (error) {
                toast.error("Không thể xóa");
            }
        }
    };

    const openModal = (doctor = null) => {
        if (doctor) {
            setIsEditing(true);
            console.log("Editing doctor:", doctor);
            setCurrentDoctor({
                maNguoiDung: doctor.MaBacSi || doctor.maBacSi || doctor.maNguoiDung,
                tenDangNhap: doctor.TenDangNhap || doctor.tenDangNhap || '',
                matKhau: '',
                hoTen: doctor.HoTen || doctor.hoTen || '',
                email: doctor.Email || doctor.email || '',
                soDienThoai: doctor.SoDienThoai || doctor.soDienThoai || '',
                chuyenKhoa: doctor.ChuyenKhoa || doctor.chuyenKhoa || '',
                soChungChi: doctor.SoChungChi || doctor.soChungChi || '',
                giaKham: doctor.GiaKham || doctor.giaKham || 0,
                gioiThieu: doctor.MoTa || doctor.moTa || doctor.gioiThieu || ''
            });
        } else {
            setIsEditing(false);
            setCurrentDoctor({ 
                tenDangNhap: '', 
                matKhau: '', 
                hoTen: '', 
                email: '', 
                soDienThoai: '', 
                chuyenKhoa: '', 
                soChungChi: '', 
                giaKham: 0, 
                gioiThieu: '' 
            });
        }
        setShowModal(true);
    };


    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative p-6 md:p-8 lg:p-10">
                {/* Header Section - Redesigned */}
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
                            className="group relative px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <div className="flex items-center gap-2">
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>Thêm Bác sĩ</span>
                            </div>
                            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Tổng bác sĩ</p>
                                    <p className="text-3xl font-bold text-slate-800 mt-1">{doctors.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <User className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Đang hiển thị</p>
                                    <p className="text-3xl font-bold text-emerald-600 mt-1">{processedDoctors.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="text-emerald-600" size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Chuyên khoa</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-1">{specialties.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Stethoscope className="text-purple-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filter Section */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-lg shadow-slate-200/50 border border-white/60 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Box */}
                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur transition-opacity"></div>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                            <input 
                                className="relative w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-200/60 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Specialty Filter */}
                        <div className="min-w-[220px] relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={18} />
                            <select 
                                className="relative w-full pl-11 pr-10 py-3.5 bg-slate-50/50 border-2 border-slate-200/60 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none appearance-none cursor-pointer text-slate-700 font-semibold transition-all"
                                value={selectedSpecialty}
                                onChange={e => setSelectedSpecialty(e.target.value)}
                            >
                                <option value="All">Tất cả chuyên khoa</option>
                                {specialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={18} />
                        </div>

                        {/* Sort Filter */}
                        <div className="min-w-[200px] relative group">
                            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={18} />
                            <select 
                                className="relative w-full pl-11 pr-10 py-3.5 bg-slate-50/50 border-2 border-slate-200/60 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none appearance-none cursor-pointer text-slate-700 font-semibold transition-all"
                                value={sortConfig}
                                onChange={e => setSortConfig(e.target.value)}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="name-asc">Tên A-Z</option>
                                <option value="price-asc">Giá: Thấp → Cao</option>
                                <option value="price-desc">Giá: Cao → Thấp</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={18} />
                        </div>

                        {/* Reset Button */}
                        {(searchTerm || selectedSpecialty !== 'All' || sortConfig !== 'newest') && (
                            <button 
                                onClick={() => { setSearchTerm(''); setSelectedSpecialty('All'); setSortConfig('newest'); }}
                                className="group px-4 py-3.5 text-slate-600 hover:text-white bg-slate-100 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-lg flex items-center gap-2"
                                title="Xóa bộ lọc"
                            >
                                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                <span className="hidden lg:inline">Đặt lại</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Doctor Cards Grid - Modern Card Design */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    ) : processedDoctors.length === 0 ? (
                        <div className="col-span-full">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-200/60">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-slate-400"/>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy bác sĩ</h3>
                                <p className="text-slate-500 mb-6">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setSelectedSpecialty('All'); setSortConfig('newest'); }}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Xóa bộ lọc
                            </button>
                            </div>
                        </div>
                    ) : (
                        processedDoctors.map((doc) => (
                            <div 
                                key={doc.MaBacSi || doc.maBacSi || doc.maNguoiDung}
                                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/60 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="relative h-32 bg-blue-600 p-6 overflow-hidden">
                                    <div className="absolute inset-0 bg-black/5"></div>
                                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                                    
                                    <div className="relative flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl font-bold text-slate-700">
                                                {(doc.HoTen || doc.hoTen || "B")?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-lg drop-shadow-lg">{doc.HoTen || doc.hoTen || "Chưa có tên"}</p>
                                                <p className="text-white/80 text-xs font-medium">ID: #{doc.MaBacSi || doc.maBacSi || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 space-y-4">
                                    {/* Specialty Badge */}
                                    <div className="flex items-center justify-between">
                                        <span className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-md flex items-center gap-2">
                                            <Stethoscope size={14}/> {doc.ChuyenKhoa || doc.chuyenKhoa || "Chưa có chuyên khoa"}
                                        </span>
                                        {(doc.SoChungChi || doc.soChungChi) && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
                                                <Award size={12}/> {doc.SoChungChi || doc.soChungChi}
                                            </span>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors group/item">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover/item:bg-blue-100 transition-colors">
                                                <Mail size={14} className="text-slate-500 group-hover/item:text-blue-600"/>
                                            </div>
                                            <span className="font-medium truncate">{doc.Email || doc.email || "—"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 hover:text-emerald-600 transition-colors group/item">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover/item:bg-emerald-100 transition-colors">
                                                <Phone size={14} className="text-slate-500 group-hover/item:text-emerald-600"/>
                                            </div>
                                            <span className="font-medium">{doc.SoDienThoai || doc.soDienThoai || "—"}</span>
                                        </div>
                                    </div>

                                    {/* Price Section */}
                                    <div className="pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Giá khám</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                {formatCurrency(doc.GiaKham || doc.giaKham || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={() => openModal(doc)} 
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-semibold group/btn"
                                        >
                                            <Edit size={16} className="group-hover/btn:rotate-12 transition-transform"/>
                                            <span>Sửa</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(doc.MaBacSi || doc.maBacSi || doc.maNguoiDung)} 
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all font-semibold group/btn"
                                        >
                                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform"/>
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Enhanced Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="relative px-8 py-6 bg-blue-600 flex justify-between items-center shrink-0 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                            <div className="relative flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    {isEditing ? <Edit size={24} className="text-white"/> : <Plus size={24} className="text-white"/>}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        {isEditing ? 'Cập nhật hồ sơ bác sĩ' : 'Thêm bác sĩ mới'}
                                    </h3>
                                    <p className="text-white/80 text-sm mt-0.5">Điền đầy đủ thông tin bên dưới</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="relative text-white/80 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all"
                            >
                                <X size={24}/>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <form onSubmit={handleSave} className="p-8 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                {/* Login Credentials (Only for new doctor) */}
                                {!isEditing && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <User size={14} className="text-white"/>
                                            </div>
                                            Thông tin đăng nhập
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-blue-900 uppercase tracking-wide">Tên đăng nhập *</label>
                                                <input 
                                                    required 
                                                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none text-sm font-semibold text-blue-900 transition-all" 
                                                    value={currentDoctor.tenDangNhap} 
                                                    onChange={e => setCurrentDoctor({...currentDoctor, tenDangNhap: e.target.value})}
                                                    placeholder="Nhập tên đăng nhập"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-blue-900 uppercase tracking-wide">Mật khẩu *</label>
                                                <input 
                                                    required 
                                                    type="password" 
                                                    className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none text-sm font-semibold text-blue-900 transition-all" 
                                                    value={currentDoctor.matKhau} 
                                                    onChange={e => setCurrentDoctor({...currentDoctor, matKhau: e.target.value})}
                                                    placeholder="Nhập mật khẩu"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Personal Information */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center">
                                            <User size={14} className="text-white"/>
                                        </div>
                                        Thông tin cá nhân
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Họ và Tên *</label>
                                            <input 
                                                required 
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium" 
                                                value={currentDoctor.hoTen} 
                                                onChange={e => setCurrentDoctor({...currentDoctor, hoTen: e.target.value})}
                                                placeholder="VD: BS. Nguyễn Văn A"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Email *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                                <input 
                                                    required 
                                                    type="email" 
                                                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium" 
                                                    value={currentDoctor.email} 
                                                    onChange={e => setCurrentDoctor({...currentDoctor, email: e.target.value})}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Số điện thoại</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                                <input 
                                                    type="text" 
                                                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium" 
                                                    value={currentDoctor.soDienThoai} 
                                                    onChange={e => setCurrentDoctor({...currentDoctor, soDienThoai: e.target.value})}
                                                    placeholder="0901234567"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                                            <Stethoscope size={14} className="text-white"/>
                                        </div>
                                        Thông tin chuyên môn
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Chuyên khoa *</label>
                                            <div className="relative">
                                                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                                <input 
                                                    required 
                                                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium" 
                                                    value={currentDoctor.chuyenKhoa} 
                                                    onChange={e => setCurrentDoctor({...currentDoctor, chuyenKhoa: e.target.value})}
                                                    placeholder="VD: Tim mạch, Nhi khoa..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Số chứng chỉ</label>
                                            <div className="relative">
                                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                                <input 
                                                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium" 
                                                    value={currentDoctor.soChungChi} 
                                                    onChange={e => setCurrentDoctor({...currentDoctor, soChungChi: e.target.value})}
                                                    placeholder="CCHN-001"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Giá khám (VNĐ) *</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    step="1000" 
                                                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono font-bold text-lg" 
                                                    value={currentDoctor.giaKham} 
                                                    onChange={e => setCurrentDoctor({...currentDoctor, giaKham: e.target.value})}
                                                    placeholder="200000"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between px-2">
                                                <p className="text-xs text-slate-500">Xem trước:</p>
                                                <p className="text-sm font-bold text-emerald-600">
                                                    {formatCurrency(currentDoctor.giaKham)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-slate-700">Giới thiệu</label>
                                            <textarea 
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all h-28 resize-none font-medium" 
                                                value={currentDoctor.gioiThieu} 
                                                onChange={e => setCurrentDoctor({...currentDoctor, gioiThieu: e.target.value})}
                                                placeholder="Nhập thông tin giới thiệu về bác sĩ..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 pt-8 mt-8 border-t-2 border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="px-6 py-3 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit" 
                                    className="group px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/30 font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <span>{isEditing ? 'Lưu thay đổi' : 'Tạo mới'}</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { 
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ManageDoctors;