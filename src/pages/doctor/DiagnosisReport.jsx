import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Printer, Plus, Trash, Pill, StickyNote } from 'lucide-react'; // Đã bỏ 'Save'
import { toast } from 'react-toastify';

// Dynamic import for html2pdf to avoid build errors if not installed
let html2pdf = null;
try {
    html2pdf = require('html2pdf.js');
} catch (e) {
    console.warn('html2pdf.js not installed, PDF export may not work');
}

const DiagnosisReport = () => {
    const reportRef = useRef();
    const [patients, setPatients] = useState([]);

    const [report, setReport] = useState({
        patientId: '',
        patientName: '',
        age: '',
        gender: '',
        address: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        medicines: []
    });

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/Doctor/my-patients');
                if (res.data) setPatients(res.data);
            } catch (error) {
                console.error("Lỗi tải bệnh nhân:", error);
            }
        };
        fetchPatients();
    }, []);

    const handleSelectPatient = (e) => {
        const pid = parseInt(e.target.value);
        const p = patients.find(x => x.maNguoiDung === pid);
        if (p) {
            const age = p.ngaySinh ? new Date().getFullYear() - new Date(p.ngaySinh).getFullYear() : '';
            setReport({
                ...report,
                patientId: pid,
                patientName: p.hoTen,
                age: age,
                gender: p.gioiTinh,
                address: p.diaChi || ''
            });
        }
    };

    // --- XỬ LÝ XUẤT PDF ---
    const handleExportPDF = () => {
        const element = reportRef.current;
        if (!element) return;

        const opt = {
            margin: 10,
            filename: `Phieu_Kham_${report.patientName || 'BN'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: element.scrollWidth },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
        toast.info("Đang tạo file PDF...");
    };

    // --- HELPER ĐƠN THUỐC ---
    const addMedicine = () => setReport({
        ...report,
        medicines: [...report.medicines, { name: '', quantity: '', unit: 'Viên', usage: '' }]
    });

    const removeMedicine = (idx) => {
        const m = [...report.medicines];
        m.splice(idx, 1);
        setReport({ ...report, medicines: m });
    };

    const handleMedChange = (idx, field, val) => {
        const m = [...report.medicines];
        m[idx][field] = val;
        setReport({ ...report, medicines: m });
    };

    return (
        <div className="flex gap-6 h-full">
            {/* CỘT TRÁI: FORM NHẬP LIỆU */}
            <div className="w-1/3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-y-auto h-[88vh]">
                <h2 className="text-lg font-bold mb-4 text-emerald-700 flex items-center gap-2 border-b pb-2">
                    <StickyNote size={20} /> Thông Tin Khám
                </h2>

                {/* Chọn bệnh nhân */}
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bệnh Nhân</label>
                    <select
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50"
                        onChange={handleSelectPatient}
                        value={report.patientId}
                    >
                        <option value="">-- Chọn bệnh nhân --</option>
                        {patients.map(p => (
                            <option key={p.maNguoiDung} value={p.maNguoiDung}>{p.hoTen} - {p.soDienThoai}</option>
                        ))}
                    </select>
                </div>

                {/* Triệu chứng & Chẩn đoán */}
                <div className="space-y-3 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Triệu chứng</label>
                        <textarea
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm h-16 resize-none focus:border-emerald-500 outline-none"
                            placeholder="VD: Ho khan, sốt nhẹ..."
                            value={report.symptoms}
                            onChange={e => setReport({ ...report, symptoms: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chẩn đoán</label>
                        <input
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none"
                            placeholder="VD: Viêm họng cấp"
                            value={report.diagnosis}
                            onChange={e => setReport({ ...report, diagnosis: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hướng điều trị / Lời dặn</label>
                        <textarea
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm h-20 resize-none focus:border-emerald-500 outline-none"
                            placeholder="VD: Uống nhiều nước, tái khám sau 3 ngày..."
                            value={report.treatment}
                            onChange={e => setReport({ ...report, treatment: e.target.value })}
                        />
                    </div>
                </div>

                {/* PHẦN ĐƠN THUỐC */}
                <div className="pt-4 border-t border-dashed border-slate-300">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-700 flex items-center gap-2">
                            <Pill size={18} className="text-emerald-600" /> Đơn thuốc
                        </span>
                        <button
                            onClick={addMedicine}
                            className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1"
                        >
                            <Plus size={14} /> Thêm thuốc
                        </button>
                    </div>

                    <div className="space-y-3">
                        {report.medicines.length === 0 && (
                            <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                                Chưa có thuốc nào. Nhấn "Thêm thuốc" để kê đơn.
                            </div>
                        )}

                        {report.medicines.map((m, i) => (
                            <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 relative group hover:border-emerald-300 transition-all shadow-sm">
                                {/* Nút xóa thuốc */}
                                <button
                                    onClick={() => removeMedicine(i)}
                                    className="absolute -top-2 -right-2 bg-white text-red-400 hover:text-red-600 border border-slate-200 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Xóa thuốc này"
                                >
                                    <Trash size={14} />
                                </button>

                                <div className="space-y-2">
                                    {/* Tên thuốc */}
                                    <input
                                        placeholder="Tên thuốc / Hàm lượng"
                                        value={m.name}
                                        onChange={e => handleMedChange(i, 'name', e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 placeholder:font-normal focus:border-emerald-500 outline-none"
                                    />

                                    {/* SL + Đơn vị + Cách dùng */}
                                    <div className="flex gap-2">
                                        <div className="w-1/4 min-w-[70px]">
                                            <input
                                                placeholder="SL"
                                                type="number"
                                                value={m.quantity}
                                                onChange={e => handleMedChange(i, 'quantity', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm text-center focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div className="w-1/4 min-w-[80px]">
                                            <select
                                                value={m.unit}
                                                onChange={e => handleMedChange(i, 'unit', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-emerald-500 outline-none"
                                            >
                                                <option>Viên</option>
                                                <option>Vỉ</option>
                                                <option>Hộp</option>
                                                <option>Gói</option>
                                                <option>Chai</option>
                                                <option>Tuýp</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                placeholder="Cách dùng"
                                                value={m.usage}
                                                onChange={e => handleMedChange(i, 'usage', e.target.value)}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Đã xóa nút "Lưu Hồ Sơ" ở đây */}
            </div>

            {/* CỘT PHẢI: PREVIEW & IN */}
            <div className="w-2/3 flex flex-col h-[88vh]">
                <div className="mb-3 flex justify-end">
                    <button
                        onClick={handleExportPDF}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex gap-2 items-center hover:bg-emerald-700 transition-colors shadow-md font-bold"
                    >
                        <Printer size={20} /> Xuất File PDF
                    </button>
                </div>

                {/* VÙNG HIỂN THỊ PHIẾU (Được in ra PDF) */}
                <div className="bg-gray-100 p-6 flex-1 overflow-y-auto rounded-xl border border-gray-300 flex justify-center">
                    <div
                        ref={reportRef}
                        className="bg-white shadow-xl"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '20mm',
                            boxSizing: 'border-box',
                            fontFamily: '"Times New Roman", serif',
                            backgroundColor: 'white'
                        }}
                    >
                        {/* Header */}
                        <div className="flex justify-between border-b-2 border-emerald-600 pb-4 mb-6">
                            <div>
                                <h1 className="text-xl font-bold text-emerald-800 uppercase tracking-wide">Phòng Khám Đa Khoa Healthes</h1>
                                <p className="text-sm text-gray-600 mt-1">📍 123 Nguyễn Văn Linh, Đà Nẵng</p>
                                <p className="text-sm text-gray-600">📞 Hotline: 1900 1234</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-gray-800">PHIẾU KHÁM BỆNH</h2>
                                <p className="italic text-sm mt-1 text-gray-500">Mã BN: <strong>#{report.patientId || '____'}</strong></p>
                                <p className="text-sm text-gray-500">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>

                        {/* Nội dung */}
                        <div className="space-y-6 text-base text-gray-800">
                            {/* I. Hành Chính */}
                            <div>
                                <h3 className="font-bold text-lg text-emerald-800 border-b border-gray-200 mb-3 pb-1">I. HÀNH CHÍNH</h3>
                                <div className="grid grid-cols-2 gap-y-2 pl-2">
                                    <p><strong className="min-w-[80px] inline-block">Họ tên:</strong> {report.patientName || '................................................'}</p>
                                    <p><strong className="min-w-[80px] inline-block">Tuổi:</strong> {report.age || '....'}</p>
                                    <p><strong className="min-w-[80px] inline-block">Giới tính:</strong> {report.gender || '....'}</p>
                                    <p><strong className="min-w-[80px] inline-block">Địa chỉ:</strong> {report.address || '................................................'}</p>
                                </div>
                            </div>

                            {/* II. Chuyên Môn */}
                            <div>
                                <h3 className="font-bold text-lg text-emerald-800 border-b border-gray-200 mb-3 pb-1">II. CHUYÊN MÔN</h3>
                                <div className="space-y-3 pl-2">
                                    <div>
                                        <strong>1. Lý do khám / Triệu chứng:</strong>
                                        <p className="mt-1 pl-4 italic text-gray-700">{report.symptoms || '(Chưa nhập)'}</p>
                                    </div>
                                    <div>
                                        <strong>2. Chẩn đoán:</strong>
                                        <p className="mt-1 pl-4 font-semibold text-gray-900">{report.diagnosis || '(Chưa nhập)'}</p>
                                    </div>
                                    <div>
                                        <strong>3. Lời dặn của bác sĩ:</strong>
                                        <p className="mt-1 pl-4 text-gray-700 whitespace-pre-wrap">{report.treatment || '(Chưa nhập)'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* III. Đơn thuốc */}
                            <div>
                                <h3 className="font-bold text-lg text-emerald-800 border-b border-gray-200 mb-3 pb-1">III. ĐƠN THUỐC</h3>
                                {report.medicines.length > 0 ? (
                                    <table className="w-full border-collapse border border-gray-300 text-sm mt-2">
                                        <thead>
                                            <tr className="bg-emerald-50">
                                                <th className="border border-gray-300 p-2 w-12 text-center">STT</th>
                                                <th className="border border-gray-300 p-2 text-left">Tên thuốc / Hàm lượng</th>
                                                <th className="border border-gray-300 p-2 w-24 text-center">Số lượng</th>
                                                <th className="border border-gray-300 p-2 text-left">Cách dùng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.medicines.map((m, i) => (
                                                <tr key={i}>
                                                    <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                                                    <td className="border border-gray-300 p-2 font-bold text-gray-800">{m.name}</td>
                                                    <td className="border border-gray-300 p-2 text-center font-semibold">{m.quantity} {m.unit}</td>
                                                    <td className="border border-gray-300 p-2 italic">{m.usage}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center italic text-gray-400 py-4">Không có đơn thuốc</p>
                                )}
                            </div>
                        </div>

                        {/* Footer / Chữ ký */}
                        <div className="flex justify-end mt-16">
                            <div className="text-center w-48">
                                <p className="italic text-sm">Đà Nẵng, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                                <p className="font-bold mt-2 text-lg text-emerald-800">BÁC SĨ ĐIỀU TRỊ</p>
                                <div className="h-24"></div>
                                <p className="font-bold text-gray-800">Ký tên</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisReport;