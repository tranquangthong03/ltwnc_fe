import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    Receipt, CheckCircle, Clock, Search,
    TrendingUp, Calendar, DollarSign, Filter, Eye
} from 'lucide-react';

const ManageInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Fetch dữ liệu
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/invoices');
            setInvoices(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    // Xử lý duyệt thanh toán
    const handleApprove = async (id) => {
        if (!window.confirm("Xác nhận đã nhận tiền và duyệt hóa đơn này?")) return;

        try {
            await api.post(`/Admin/confirm-payment/${id}`);
            toast.success("Đã duyệt thanh toán thành công!");

            // Cập nhật state local
            setInvoices(prev => prev.map(inv =>
                inv.maHoaDon === id
                    ? { ...inv, trangThaiThanhToan: 'DaThanhToan' }
                    : inv
            ));
        } catch (error) {
            toast.error("Lỗi khi duyệt hóa đơn");
        }
    };

    // Format tiền tệ
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Tính toán thống kê
    const stats = useMemo(() => {
        const totalRev = invoices.filter(i => i.trangThaiThanhToan === 'DaThanhToan').reduce((sum, i) => sum + i.tongTien, 0);
        const pendingCount = invoices.filter(i => i.trangThaiThanhToan !== 'DaThanhToan').length;
        return { totalRev, pendingCount, totalCount: invoices.length };
    }, [invoices]);

    // Filter list
    const filteredList = invoices.filter(inv => {
        const matchStatus = filterStatus === 'All' || inv.trangThaiThanhToan === filterStatus;
        const matchSearch = inv.tenBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            {/* 1. Header & Stats */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Receipt className="text-blue-600" /> Quản lý Doanh thu & Hóa đơn
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Tổng doanh thu thực tế</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalRev)}</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><DollarSign size={24} /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Hóa đơn chờ duyệt</p>
                            <p className="text-2xl font-bold text-orange-500 mt-1">{stats.pendingCount}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600"><Clock size={24} /></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Tổng giao dịch</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalCount}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><TrendingUp size={24} /></div>
                    </div>
                </div>
            </div>

            {/* 2. Tools Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="flex gap-2">
                    {['All', 'DaThanhToan', 'ChuaThanhToan'].map(st => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${filterStatus === st ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                        >
                            {st === 'All' ? 'Tất cả' : st === 'DaThanhToan' ? 'Đã thanh toán' : 'Chờ duyệt'}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm tên, email..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-4/5 md:w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-4/5 text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Mã HĐ</th>
                                <th className="p-4 font-semibold">Khách hàng</th>
                                <th className="p-4 font-semibold">Dịch vụ</th>
                                <th className="p-4 font-semibold">Số tiền</th>
                                <th className="p-4 font-semibold">Ngày tạo</th>
                                <th className="p-4 font-semibold">Trạng thái</th>
                                <th className="p-4 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">Không tìm thấy hóa đơn nào.</td></tr>
                            ) : (
                                filteredList.map(inv => (
                                    <tr key={inv.maHoaDon} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono text-slate-500">#{inv.maHoaDon}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-800">{inv.tenBenhNhan}</div>
                                            <div className="text-xs text-slate-500">{inv.email}</div>
                                        </td>
                                        <td className="p-4 text-slate-700">{inv.dichVu}</td>
                                        <td className="p-4 font-bold text-slate-800">{formatCurrency(inv.tongTien)}</td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(inv.ngayTao).toLocaleDateString('vi-VN')}
                                            <br />
                                            <span className="text-xs">{new Date(inv.ngayTao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="p-4">
                                            {inv.trangThaiThanhToan === 'DaThanhToan' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle size={12} /> Đã thanh toán
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                                    <Clock size={12} /> Chờ duyệt
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {inv.trangThaiThanhToan !== 'DaThanhToan' ? (
                                                <button
                                                    onClick={() => handleApprove(inv.maHoaDon)}
                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold shadow-sm transition-all"
                                                >
                                                    Duyệt ngay
                                                </button>
                                            ) : (
                                                <button disabled className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed">
                                                    Đã duyệt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageInvoices;