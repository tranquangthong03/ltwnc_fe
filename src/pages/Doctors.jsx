import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Giữ lại useNavigate
import api from '../services/api';
import RevealOnScroll from '../components/RevealOnScroll';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
// Thêm CalendarCheck vào đây
import {
    Stethoscope, Clock, Star, CalendarCheck, Search, Filter, X,
    Calendar, Loader // Thêm Calendar cho nút Lịch sử
} from 'lucide-react';
import { toast } from 'react-toastify';

const Doctors = () => {
    const { user } = useContext(AuthContext);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingForm, setBookingForm] = useState({ date: '', time: '', reason: '' });

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const response = await api.get('/Patient/doctors');
                setDoctors(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const openBookingModal = (doc) => {
        if (!user) {
            toast.warning("Vui lòng đăng nhập để đặt lịch!");
            return;
        }
        setSelectedDoctor(doc);
        setBookingForm({ date: '', time: '', reason: '' });
        setShowModal(true);
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        try {
            const dateTimeString = `${bookingForm.date}T${bookingForm.time}:00`;

            await api.post('/Patient/book-appointment', {
                MaBacSi: selectedDoctor.maBacSi, // Đảm bảo trường này khớp với Backend (có thể là MaBacSi hoặc maBacSi)
                NgayHen: dateTimeString,
                LyDoKham: bookingForm.reason
            });

            toast.success(`Đã đặt lịch thành công với BS. ${selectedDoctor.hoTen}!`);
            setShowModal(false);
        } catch (err) {
            console.error("Chi tiết lỗi:", err.response); // Xem log trong Console (F12)

            // Hiển thị thông báo lỗi cụ thể từ Server gửi về (nếu có)
            const serverMessage = err.response?.data?.message || err.response?.data || "Đặt lịch thất bại.";

            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn hoặc không hợp lệ.");
            } else if (err.response?.status === 403) {
                toast.error("Bạn không có quyền đặt lịch (Cần tài khoản Bệnh nhân).");
            } else {
                toast.error(`Lỗi: ${serverMessage}`);
            }
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const name = doc.hoTen || "";
        const dept = doc.chuyenKhoa || "";
        const search = searchTerm.toLowerCase();
        return name.toLowerCase().includes(search) || dept.toLowerCase().includes(search);
    });

    if (loading) return <div className="p-20 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={40} /></div>;

    return (
        <div>
            <div style={{ backgroundColor: 'var(--bg-light)', padding: '60px 20px', textAlign: 'center' }}>
                <RevealOnScroll>
                    <h1 className="section-title">Đội Ngũ <span className="text-gradient">Chuyên Gia</span></h1>

                    {/* --- THÊM NÚT XEM LỊCH SỬ HẸN TẠI ĐÂY --- */}
                    {user && (
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/my-appointments')}
                                className="bg-white border border-blue-200 text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2 shadow-sm"
                            >
                                <Calendar size={18} /> Xem Lịch Hẹn Của Tôi
                            </button>
                        </div>
                    )}

                    <div className="search-container" style={{ margin: '20px auto' }}>
                        <Search size={20} className="text-gray-400 ml-3" />
                        <input className="search-input" placeholder="Tìm kiếm bác sĩ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </RevealOnScroll>
            </div>

            <div className="page-container">
                <RevealOnScroll>
                    <div className="mb-6 flex items-center gap-2">
                        <Filter size={18} className="text-blue-600" />
                        <span className="font-bold text-slate-700">Kết quả ({filteredDoctors.length})</span>
                    </div>

                    {filteredDoctors.length > 0 ? (
                        <div className="grid-container">
                            {filteredDoctors.map((doc) => (
                                <div key={doc.maBacSi} className="doctor-card-wrapper">
                                    <div className="doc-img-container">
                                        <span className="doc-badge"><Stethoscope size={14} /> {doc.chuyenKhoa}</span>
                                        <img src={doc.anhDaiDien || "/doctor.png"} alt={doc.hoTen} className="doc-img" onError={(e) => { e.target.src = "https://via.placeholder.com/400x500?text=Bac+Si" }} />
                                    </div>
                                    <div className="doc-info">
                                        <h3 className="doc-name">{doc.hoTen}</h3>
                                        <span className="doc-dept">{doc.chuyenKhoa}</span>
                                        <div className="doc-stats">
                                            <div className="doc-stat-item"><Clock size={16} /> <span>{doc.soNamKinhNghiem || 5}+ Năm</span></div>
                                            <div className="doc-stat-item"><Star size={16} color="#fbbf24" fill="#fbbf24" /> <span>5.0</span></div>
                                        </div>
                                        <button className="btn btn-outline w-full rounded-full" onClick={() => openBookingModal(doc)}>
                                            <CalendarCheck size={18} /> Đặt Lịch Ngay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">Không tìm thấy bác sĩ.</p>
                    )}
                </RevealOnScroll>
            </div>

            {/* Modal Popup */}
            {showModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Đặt Lịch Khám</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                            <div className="flex items-center gap-4 mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <img src={selectedDoctor.anhDaiDien || "/doctor.png"} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                                <div>
                                    <p className="text-sm text-blue-600 font-semibold">Bác sĩ phụ trách</p>
                                    <p className="font-bold text-slate-800">{selectedDoctor.hoTen}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">NGÀY KHÁM</label>
                                    <input required type="date" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">GIỜ KHÁM</label>
                                    <input required type="time" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={bookingForm.time} onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">TRIỆU CHỨNG / LÝ DO</label>
                                <textarea required className="w-full p-2.5 border rounded-lg h-24 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: Đau đầu, sốt nhẹ..."
                                    value={bookingForm.reason} onChange={e => setBookingForm({ ...bookingForm, reason: e.target.value })} />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                                    Xác Nhận Đặt Lịch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Doctors;