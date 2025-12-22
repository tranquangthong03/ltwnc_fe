import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Edit, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchPatients = async () => {
        try {
            const res = await api.get('/Doctor/my-patients');
            setPatients(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchPatients(); }, []);

    const startEdit = (p) => {
        setEditingId(p.maNguoiDung);
        setEditForm({ ...p });
    };

    const saveEdit = async () => {
        try {
            // Sửa: gửi payload khớp với DTO Backend
            await api.put(`/Doctor/patient/${editingId}`, {
                NgaySinh: editForm.ngaySinh,
                GioiTinh: editForm.gioiTinh,
                DiaChi: editForm.diaChi,
                TienSuBenh: editForm.tienSuBenh || ''
            });
            toast.success("Cập nhật thành công!");
            setEditingId(null);
            fetchPatients();
        } catch { toast.error("Lỗi cập nhật"); }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Danh Sách Bệnh Nhân</h1>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input placeholder="Tìm kiếm..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Họ Tên</th>
                            <th className="p-4">Ngày Sinh</th>
                            <th className="p-4">Giới Tính</th>
                            <th className="p-4">SĐT</th>
                            <th className="p-4">Địa Chỉ</th>
                            <th className="p-4 text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(p => (
                            <tr key={p.maNguoiDung} className="border-b hover:bg-gray-50">
                                {/* Sửa: dùng camelCase */}
                                <td className="p-4">#{p.maNguoiDung}</td>
                                <td className="p-4 font-medium">{p.hoTen}</td>

                                <td className="p-4">
                                    {editingId === p.maNguoiDung ?
                                        <input type="date" value={editForm.ngaySinh ? editForm.ngaySinh.split('T')[0] : ''} onChange={e => setEditForm({ ...editForm, ngaySinh: e.target.value })} className="border p-1 rounded w-32" />
                                        : (p.ngaySinh ? new Date(p.ngaySinh).toLocaleDateString('vi-VN') : '—')}
                                </td>

                                <td className="p-4">
                                    {editingId === p.maNguoiDung ?
                                        <select value={editForm.gioiTinh} onChange={e => setEditForm({ ...editForm, gioiTinh: e.target.value })} className="border p-1 rounded">
                                            <option>Nam</option><option>Nữ</option><option>Khác</option>
                                        </select>
                                        : p.gioiTinh || '—'}
                                </td>

                                <td className="p-4">{p.soDienThoai}</td>

                                <td className="p-4">
                                    {editingId === p.maNguoiDung ?
                                        <input value={editForm.diaChi || ''} onChange={e => setEditForm({ ...editForm, diaChi: e.target.value })} className="border p-1 rounded" />
                                        : p.diaChi || '—'}
                                </td>

                                <td className="p-4 flex justify-center gap-2">
                                    {editingId === p.maNguoiDung ? (
                                        <>
                                            <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={18} /></button>
                                            <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={18} /></button>
                                        </>
                                    ) : (
                                        <button onClick={() => startEdit(p)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={18} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default DoctorPatients;