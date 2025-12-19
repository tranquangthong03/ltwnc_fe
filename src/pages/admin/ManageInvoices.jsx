import React, { useState, useMemo, useEffect } from 'react';
import { 
  Receipt, Download, Search, DollarSign, 
  TrendingUp, CheckCircle, Clock, Eye,
  CreditCard, Banknote, RefreshCw, FileText
} from 'lucide-react';
import api from '../../services/api';

const ManageInvoices = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy dữ liệu hóa đơn từ API
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/admin/invoices');
                
                // Transform dữ liệu từ API
                const transformedData = response.data.map((invoice) => ({
                    id: invoice.maHoaDon,
                    user: invoice.tenBenhNhan,
                    email: invoice.email || 'N/A',
                    dichVu: invoice.dichVu || 'Dịch vụ',
                    soTien: invoice.tongTien,
                    ngay: invoice.ngayTao,
                    status: invoice.trangThaiThanhToan || 'ChuaThanhToan',
                    phuongThuc: invoice.phuongThucThanhToan,
                    maGiaoDich: invoice.maGiaoDich
                }));
                
                setInvoices(transformedData);
            } catch (err) {
                console.error('Lỗi tải dữ liệu hóa đơn:', err);
                setError('Không thể tải dữ liệu hóa đơn. Vui lòng thử lại.');
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    // Làm mới dữ liệu
    const handleRefresh = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/admin/invoices');
            
            const transformedData = response.data.map((invoice) => ({
                id: invoice.maHoaDon,
                user: invoice.tenBenhNhan,
                email: invoice.email || 'N/A',
                dichVu: invoice.dichVu || 'Dịch vụ',
                soTien: invoice.tongTien,
                ngay: invoice.ngayTao,
                status: invoice.trangThaiThanhToan || 'ChuaThanhToan',
                phuongThuc: invoice.phuongThucThanhToan,
                maGiaoDich: invoice.maGiaoDich
            }));
            
            setInvoices(transformedData);
        } catch (err) {
            console.error('Lỗi làm mới dữ liệu:', err);
            setError('Không thể làm mới dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Tính toán thống kê
    const stats = useMemo(() => {
        const total = invoices.length;
        const paid = invoices.filter(inv => inv.status === 'DaThanhToan').length;
        const pending = total - paid;
        const totalRevenue = invoices.reduce((acc, curr) => 
            curr.status === 'DaThanhToan' ? acc + curr.soTien : acc, 0);
        const pendingAmount = invoices.reduce((acc, curr) => 
            curr.status === 'ChuaThanhToan' ? acc + curr.soTien : acc, 0);
        
        return { total, paid, pending, totalRevenue, pendingAmount };
    }, [invoices]);

    // Lọc hóa đơn
    const filteredInvoices = useMemo(() => {
        let result = [...invoices];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(inv => 
                inv.user.toLowerCase().includes(term) ||
                inv.dichVu.toLowerCase().includes(term) ||
                inv.email.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter(inv => inv.status === statusFilter);
        }

        return result.sort((a, b) => new Date(b.ngay) - new Date(a.ngay));
    }, [invoices, searchTerm, statusFilter]);

    const StatusBadge = ({ status }) => {
        const config = {
            'DaThanhToan': {
                bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                icon: CheckCircle,
                label: 'Đã thanh toán'
            },
            'ChuaThanhToan': {
                bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: Clock,
                label: 'Chờ thanh toán'
            }
        };

        const { bg, text, border, icon: Icon, label } = config[status];

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${bg} ${text} border ${border}`}>
                <Icon size={12} />
                {label}
            </span>
        );
    };

    const PaymentMethodBadge = ({ method }) => {
        if (!method) return <span className="text-slate-400 text-xs">—</span>;
        
        const config = {
            'ChuyenKhoan': { icon: CreditCard, label: 'Chuyển khoản', color: 'text-blue-600 bg-blue-50' },
            'TienMat': { icon: Banknote, label: 'Tiền mặt', color: 'text-green-600 bg-green-50' }
        };

        const { icon: Icon, label, color } = config[method] || {};

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
                <Icon size={12} />
                {label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className="relative p-6 md:p-8 lg:p-10">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                        <button 
                            onClick={handleRefresh}
                            className="ml-auto text-red-600 hover:text-red-700 underline text-sm font-semibold"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && invoices.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Receipt className="text-blue-600" size={32} />
                            </div>
                            <p className="text-slate-600 font-semibold">Đang tải dữ liệu hóa đơn...</p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                                    <Receipt className="text-white" size={32} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <TrendingUp size={12} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
                                    Quản lý Hóa đơn
                                </h1>
                                <p className="text-slate-500 mt-1 font-medium">Theo dõi và quản lý các giao dịch thanh toán</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleRefresh}
                                disabled={loading}
                                className="group px-5 py-3 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all hover:border-purple-300 hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                                <span>{loading ? 'Đang tải...' : 'Tải lại'}</span>
                            </button>
                            <button className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl flex items-center gap-2">
                                <FileText size={18} />
                                <span>Xuất báo cáo</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Tổng hóa đơn</p>
                                    <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                                </div>
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Receipt className="text-slate-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Đã thanh toán</p>
                                    <p className="text-3xl font-bold text-emerald-600">{stats.paid}</p>
                                </div>
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CheckCircle className="text-emerald-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Chờ thanh toán</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                                </div>
                                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="text-orange-600" size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium mb-1">Tổng doanh thu</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {(stats.totalRevenue / 1000000).toFixed(1)}M
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <DollarSign className="text-blue-600" size={28} />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg mb-6 overflow-hidden">
                    <div className="p-5">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Box */}
                            <div className="flex-1 relative group">
                                <div className="absolute inset-0 bg-blue-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur transition-opacity"></div>
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên khách hàng, dịch vụ, email..."
                                    className="relative w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 border-slate-200/60 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                                        statusFilter === "all"
                                            ? "bg-slate-700 text-white shadow-lg shadow-slate-500/30"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-200"
                                    }`}
                                >
                                    <Receipt size={18} />
                                    <span>Tất cả</span>
                                </button>
                                
                                <button
                                    onClick={() => setStatusFilter("DaThanhToan")}
                                    className={`px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                                        statusFilter === "DaThanhToan"
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200"
                                    }`}
                                >
                                    <CheckCircle size={18} />
                                    <span>Đã thanh toán</span>
                                </button>
                                
                                <button
                                    onClick={() => setStatusFilter("ChuaThanhToan")}
                                    className={`px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                                        statusFilter === "ChuaThanhToan"
                                            ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                                            : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-2 border-orange-200"
                                    }`}
                                >
                                    <Clock size={18} />
                                    <span>Chờ thanh toán</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredInvoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="relative h-20 bg-blue-600 overflow-hidden">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full"></div>
                                <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/20 rounded-full"></div>
                                
                                <div className="relative p-4 flex justify-between items-center">
                                    <div className="text-white">
                                        <p className="text-xs font-medium opacity-90">Hóa đơn</p>
                                        <p className="text-lg font-bold">#INV-{invoice.id.toString().padStart(3, '0')}</p>
                                    </div>
                                    <StatusBadge status={invoice.status} />
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 space-y-4">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                        {invoice.user}
                                    </h3>
                                    <p className="text-sm text-slate-500">{invoice.email}</p>
                                </div>

                                {/* Service & Amount */}
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 font-medium">Dịch vụ:</span>
                                        <span className="text-sm font-semibold text-slate-800">{invoice.dichVu}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 font-medium">Số tiền:</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {invoice.soTien.toLocaleString()} đ
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 font-medium">Ngày tạo:</span>
                                        <span className="text-sm font-medium text-slate-700">
                                            {new Date(invoice.ngay).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 font-medium">Thanh toán:</span>
                                        <PaymentMethodBadge method={invoice.phuongThuc} />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 font-semibold transition-all">
                                        <Eye size={16} />
                                        <span>Xem chi tiết</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 font-semibold transition-all">
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Bottom Border */}
                            <div className="h-1 bg-blue-600"></div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredInvoices.length === 0 && (
                    <div className="col-span-full">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/60">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt size={32} className="text-slate-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy hóa đơn</h3>
                            <p className="text-slate-500 mb-6">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    </div>
                )}
            </div>

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

export default ManageInvoices;