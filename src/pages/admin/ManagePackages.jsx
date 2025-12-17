import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
    Plus, Edit, Trash2, Package, X, Clock, 
    DollarSign, FileText, Check, Sparkles,
    TrendingUp, Shield, Star, ChevronRight
} from 'lucide-react';

const ManagePackages = () => {
    const [packages, setPackages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPkg, setEditingPkg] = useState(null);
    const [formData, setFormData] = useState({ tenGoi: '', giaTien: 0, thoiHanNgay: 365, moTa: '' });

    const fetchPackages = async () => {
        try {
            const res = await api.get('/Packages');
            setPackages(res.data);
        } catch (err) {
            // Mock data with more details
            setPackages([
                { maGoi: 1, tenGoi: 'Gói Tổng Quát VIP', giaTien: 5000000, thoiHanNgay: 365, moTa: 'Khám toàn diện A-Z, bao gồm xét nghiệm máu, X-quang, siêu âm, tư vấn dinh dưỡng' },
                { maGoi: 2, tenGoi: 'Gói Nhi Khoa', giaTien: 2000000, thoiHanNgay: 180, moTa: 'Dành cho trẻ em dưới 12 tuổi, bao gồm khám định kỳ, tiêm chủng' },
                { maGoi: 3, tenGoi: 'Gói Sức Khỏe Cơ Bản', giaTien: 1500000, thoiHanNgay: 90, moTa: 'Khám tổng quát, xét nghiệm cơ bản, đo huyết áp' },
                { maGoi: 4, tenGoi: 'Gói Cao Cấp Plus', giaTien: 8000000, thoiHanNgay: 365, moTa: 'Gói cao cấp nhất với đầy đủ dịch vụ và ưu tiên khám' },
            ]);
        }
    };

    useEffect(() => { fetchPackages(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPkg) {
                await api.put(`/Packages/${editingPkg.maGoi}`, formData);
                toast.success("Cập nhật gói thành công!");
            } else {
                await api.post('/Packages', formData);
                toast.success("Thêm gói mới thành công!");
            }
            setShowModal(false);
            fetchPackages();
        } catch (error) {
            toast.error("Lỗi lưu dữ liệu");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Xóa gói khám này sẽ ảnh hưởng đến các đăng ký hiện tại. Bạn có chắc chắn muốn xóa?")) {
            try {
                await api.delete(`/Packages/${id}`);
                fetchPackages();
                toast.success("Đã xóa gói khám");
            } catch (error) { 
                toast.error("Không thể xóa"); 
            }
        }
    };

    const openModal = (pkg = null) => {
        setEditingPkg(pkg);
        setFormData(pkg || { tenGoi: '', giaTien: 0, thoiHanNgay: 365, moTa: '' });
        setShowModal(true);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Get package tier styling
    const getPackageTier = (price) => {
        if (price >= 7000000) return {
            gradient: 'from-amber-400 via-yellow-500 to-orange-500',
            badge: 'from-amber-500 to-orange-600',
            icon: 'from-amber-100 to-orange-100',
            iconColor: 'text-amber-600',
            tier: 'Premium',
            tierBg: 'bg-amber-500'
        };
        if (price >= 4000000) return {
            gradient: 'from-purple-400 via-violet-500 to-indigo-500',
            badge: 'from-purple-500 to-indigo-600',
            icon: 'from-purple-100 to-indigo-100',
            iconColor: 'text-purple-600',
            tier: 'VIP',
            tierBg: 'bg-purple-500'
        };
        if (price >= 2000000) return {
            gradient: 'from-blue-400 via-cyan-500 to-teal-500',
            badge: 'from-blue-500 to-cyan-600',
            icon: 'from-blue-100 to-cyan-100',
            iconColor: 'text-blue-600',
            tier: 'Plus',
            tierBg: 'bg-blue-500'
        };
        return {
            gradient: 'from-emerald-400 via-green-500 to-teal-500',
            badge: 'from-emerald-500 to-teal-600',
            icon: 'from-emerald-100 to-teal-100',
            iconColor: 'text-emerald-600',
            tier: 'Basic',
            tierBg: 'bg-emerald-500'
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative p-6 md:p-8 lg:p-10">
                {/* Enhanced Header */}
                <div className="mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                                    <Package className="text-white" size={32} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                    <Sparkles size={12} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                                    Quản lý Gói Khám
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium">Tạo và quản lý các gói khám sức khỏe đa dạng</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => openModal()}
                            className="group relative px-6 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-bold shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="relative flex items-center gap-2">
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>Tạo Gói Mới</span>
                            </div>
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Tổng gói</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{packages.length}</p>
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Package className="text-purple-600" size={28} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Đang hoạt động</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{packages.length}</p>
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Check className="text-emerald-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Doanh thu TB</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                        {packages.length ? Math.round(packages.reduce((sum, p) => sum + p.giaTien, 0) / packages.length / 1000000) : 0}M
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TrendingUp className="text-blue-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Gói cao cấp</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        {packages.filter(p => p.giaTien >= 4000000).length}
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Star className="text-amber-600" size={28} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Cards Grid - Premium Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {packages.map((pkg) => {
                        const tier = getPackageTier(pkg.giaTien);
                        return (
                            <div 
                                key={pkg.maGoi}
                                className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60 hover:shadow-2xl hover:shadow-purple-200/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                            >
                                {/* Card Header with Gradient */}
                                <div className={`relative h-40 bg-gradient-to-br ${tier.gradient} p-6 overflow-hidden`}>
                                    {/* Decorative Elements */}
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full"></div>
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full"></div>
                                    <div className="absolute -left-4 -top-4 w-20 h-20 bg-black/10 rounded-full"></div>
                                    
                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                        <button 
                                            onClick={() => openModal(pkg)} 
                                            className="p-2.5 bg-white/90 backdrop-blur-sm text-blue-600 rounded-xl hover:bg-white hover:scale-110 transition-all shadow-lg"
                                        >
                                            <Edit size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(pkg.maGoi)} 
                                            className="p-2.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-xl hover:bg-white hover:scale-110 transition-all shadow-lg"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>

                                    {/* Tier Badge */}
                                    <div className="relative">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${tier.tierBg} text-white text-xs font-bold rounded-full shadow-lg`}>
                                            <Shield size={12} />
                                            {tier.tier}
                                        </span>
                                    </div>

                                    {/* Package Icon */}
                                    <div className="absolute bottom-6 left-6">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${tier.icon} rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50`}>
                                            <Package className={tier.iconColor} size={32} />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 space-y-4">
                                    {/* Package Name */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                                            {pkg.tenGoi}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{pkg.moTa}</p>
                                    </div>

                                    {/* Price Display */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                {formatCurrency(pkg.giaTien)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Package Details */}
                                    <div className="space-y-2.5 pt-2">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className={`w-9 h-9 bg-gradient-to-br ${tier.icon} rounded-xl flex items-center justify-center`}>
                                                <Clock className={tier.iconColor} size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Thời hạn sử dụng</p>
                                                <p className="font-bold text-slate-800">{pkg.thoiHanNgay} ngày</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className={`w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center`}>
                                                <Check className="text-emerald-600" size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Trạng thái</p>
                                                <p className="font-bold text-emerald-600">Đang hoạt động</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <button className={`w-full mt-4 py-3 bg-gradient-to-r ${tier.badge} text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn`}>
                                        <span>Xem chi tiết</span>
                                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                {/* Decorative Bottom Border */}
                                <div className={`h-1 bg-gradient-to-r ${tier.gradient}`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {packages.length === 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 text-center border border-white/60 shadow-xl">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={48} className="text-purple-600"/>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-3">Chưa có gói khám nào</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Bắt đầu tạo các gói khám sức khỏe để cung cấp cho bệnh nhân của bạn</p>
                        <button 
                            onClick={() => openModal()}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <span>Tạo Gói Đầu Tiên</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Enhanced Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="relative px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                            
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                        {editingPkg ? <Edit size={28} className="text-white"/> : <Plus size={28} className="text-white"/>}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">
                                            {editingPkg ? 'Cập nhật Gói Khám' : 'Tạo Gói Khám Mới'}
                                        </h3>
                                        <p className="text-white/80 text-sm mt-0.5">Điền đầy đủ thông tin bên dưới</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all"
                                >
                                    <X size={24}/>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Package Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Package size={16} className="text-purple-600"/>
                                    Tên gói khám *
                                </label>
                                <input 
                                    required 
                                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400" 
                                    value={formData.tenGoi} 
                                    onChange={e => setFormData({...formData, tenGoi: e.target.value})}
                                    placeholder="VD: Gói Khám Tổng Quát VIP"
                                />
                            </div>

                            {/* Price and Duration Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <DollarSign size={16} className="text-emerald-600"/>
                                        Giá tiền (VNĐ) *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            required 
                                            min="0"
                                            step="100000"
                                            className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-mono font-bold text-lg text-slate-800" 
                                            value={formData.giaTien} 
                                            onChange={e => setFormData({...formData, giaTien: Number(e.target.value)})}
                                            placeholder="2000000"
                                        />
                                    </div>
                                    <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center justify-between px-1">
                                        <span>Xem trước:</span>
                                        <span>{formatCurrency(formData.giaTien)}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Clock size={16} className="text-blue-600"/>
                                        Thời hạn (Ngày) *
                                    </label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1"
                                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-lg text-slate-800" 
                                        value={formData.thoiHanNgay} 
                                        onChange={e => setFormData({...formData, thoiHanNgay: Number(e.target.value)})}
                                        placeholder="365"
                                    />
                                    <p className="text-xs text-blue-600 font-bold mt-2 px-1">
                                        ≈ {Math.round(formData.thoiHanNgay / 30)} tháng
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <FileText size={16} className="text-indigo-600"/>
                                    Mô tả chi tiết
                                </label>
                                <textarea 
                                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all h-32 resize-none font-medium text-slate-800 placeholder:text-slate-400" 
                                    value={formData.moTa} 
                                    onChange={e => setFormData({...formData, moTa: e.target.value})}
                                    placeholder="Mô tả chi tiết về gói khám, bao gồm các dịch vụ, quyền lợi..."
                                ></textarea>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-6 border-t-2 border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    className="group px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/40 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <span>{editingPkg ? 'Lưu thay đổi' : 'Tạo gói mới'}</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Animations */}
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

export default ManagePackages;