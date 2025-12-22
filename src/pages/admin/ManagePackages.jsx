import React, { useState, useEffect } from 'react';
import api from '../../services/api'; //
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
            // SỬA: Gọi đúng API /Admin/packages
            const res = await api.get('/Admin/packages');
            setPackages(res.data);
        } catch (err) {
            toast.error("Không thể tải danh sách gói khám");
        }
    };

    useEffect(() => { fetchPackages(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPkg) {
                // SỬA: Gọi đúng API PUT /Admin/packages/{id}
                await api.put(`/Admin/packages/${editingPkg.maGoi}`, formData);
                toast.success("Cập nhật gói thành công!");
            } else {
                // SỬA: Gọi đúng API POST /Admin/packages
                await api.post('/Admin/packages', formData);
                toast.success("Thêm gói mới thành công!");
            }
            setShowModal(false);
            fetchPackages();
        } catch (error) {
            toast.error("Lỗi lưu dữ liệu");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa gói khám này sẽ ảnh hưởng đến các đăng ký hiện tại. Bạn có chắc chắn muốn xóa?")) {
            try {
                // SỬA: Gọi đúng API DELETE /Admin/packages/{id}
                await api.delete(`/Admin/packages/${id}`);
                fetchPackages();
                toast.success("Đã xóa gói khám");
            } catch (error) {
                toast.error("Không thể xóa");
            }
        }
    };

    // ... (Phần render UI giữ nguyên vì đã đẹp rồi)
    // Bạn chỉ cần copy lại phần render UI từ file cũ
    const openModal = (pkg = null) => {
        setEditingPkg(pkg);
        setFormData(pkg || { tenGoi: '', giaTien: 0, thoiHanNgay: 365, moTa: '' });
        setShowModal(true);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Helper: Package Tier Styling (Giữ nguyên)
    const getPackageTier = (price) => {
        if (price >= 7000000) return { gradient: 'from-amber-400 via-yellow-500 to-orange-500', badge: 'from-amber-500 to-orange-600', icon: 'from-amber-100 to-orange-100', iconColor: 'text-amber-600', tier: 'Premium', tierBg: 'bg-amber-500' };
        if (price >= 4000000) return { gradient: 'from-purple-400 via-violet-500 to-indigo-500', badge: 'from-purple-500 to-indigo-600', icon: 'from-purple-100 to-indigo-100', iconColor: 'text-purple-600', tier: 'VIP', tierBg: 'bg-purple-500' };
        if (price >= 2000000) return { gradient: 'from-blue-400 via-cyan-500 to-teal-500', badge: 'from-blue-500 to-cyan-600', icon: 'from-blue-100 to-cyan-100', iconColor: 'text-blue-600', tier: 'Plus', tierBg: 'bg-blue-500' };
        return { gradient: 'from-emerald-400 via-green-500 to-teal-500', badge: 'from-emerald-500 to-teal-600', icon: 'from-emerald-100 to-teal-100', iconColor: 'text-emerald-600', tier: 'Basic', tierBg: 'bg-emerald-500' };
    };

    return (
        // Copy lại toàn bộ phần return JSX của file cũ, không cần thay đổi gì về giao diện
        // Chỉ lưu ý các hàm xử lý logic (handleSubmit, handleDelete) đã được cập nhật ở trên
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
            {/* ... (Dán lại phần UI cũ vào đây) ... */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative p-6 md:p-8 lg:p-10">
                <div className="mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            {/* ... Header UI ... */}
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                                    <Package className="text-white" size={32} />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                                    Quản lý Gói Khám
                                </h1>
                            </div>
                        </div>
                        <button onClick={() => openModal()} className="group relative px-6 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-bold shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300">
                            <div className="relative flex items-center gap-2">
                                <Plus size={20} />
                                <span>Tạo Gói Mới</span>
                            </div>
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Stats items... */}
                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm text-slate-500">Tổng gói</p><p className="text-3xl font-bold">{packages.length}</p></div>
                                <Package className="text-purple-600" size={28} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {packages.map((pkg) => {
                        const tier = getPackageTier(pkg.giaTien);
                        return (
                            <div key={pkg.maGoi} className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden hover:-translate-y-2 transition-all">
                                <div className={`relative h-40 bg-gradient-to-br ${tier.gradient} p-6`}>
                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => openModal(pkg)} className="p-2 bg-white text-blue-600 rounded-lg"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(pkg.maGoi)} className="p-2 bg-white text-red-600 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 ${tier.tierBg} text-white text-xs font-bold rounded-full`}>
                                        <Shield size={12} /> {tier.tier}
                                    </span>
                                    <div className="absolute bottom-6 left-6">
                                        <div className={`w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center`}>
                                            <Package className="text-white" size={24} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1">{pkg.tenGoi}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 h-10">{pkg.moTa}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            {formatCurrency(pkg.giaTien)}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                        <Clock size={14} className="text-blue-500" /> {pkg.thoiHanNgay} ngày
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl w-4/5 max-w-xl overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingPkg ? 'Cập nhật Gói' : 'Tạo Gói Mới'}</h3>
                            <button onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Tên gói</label>
                                <input required className="w-4/5 p-3 border rounded-xl" value={formData.tenGoi} onChange={e => setFormData({ ...formData, tenGoi: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Giá tiền</label>
                                    <input type="number" required className="w-4/5 p-3 border rounded-xl" value={formData.giaTien} onChange={e => setFormData({ ...formData, giaTien: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Thời hạn (ngày)</label>
                                    <input type="number" required className="w-4/5 p-3 border rounded-xl" value={formData.thoiHanNgay} onChange={e => setFormData({ ...formData, thoiHanNgay: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Mô tả</label>
                                <textarea className="w-4/5 p-3 border rounded-xl h-24" value={formData.moTa} onChange={e => setFormData({ ...formData, moTa: e.target.value })}></textarea>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePackages;