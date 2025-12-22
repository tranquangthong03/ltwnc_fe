import React, { useState } from 'react';
import { Settings, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdminSettings = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }

        try {
            // Giả định API đổi pass. Nếu chưa có, bạn cần thêm vào AuthController
            await api.post('/Auth/change-password', {
                oldPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success("Đổi mật khẩu thành công!");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data || "Lỗi đổi mật khẩu");
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="text-slate-600" /> Cài đặt hệ thống
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Change Password Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Bảo mật</h3>
                            <p className="text-xs text-slate-500">Quản lý mật khẩu và bảo mật tài khoản</p>
                        </div>
                    </div>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                required
                                className="w-4/5 p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                placeholder="••••••••"
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                className="w-4/5 p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                placeholder="••••••••"
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                className="w-4/5 p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                placeholder="••••••••"
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            />
                        </div>
                        <button className="w-4/5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold transition-all flex items-center justify-center gap-2">
                            <Save size={18} /> Lưu thay đổi
                        </button>
                    </form>
                </div>

                {/* Notifications Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Bell className="text-orange-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Thông báo</h3>
                            <p className="text-xs text-slate-500">Cấu hình nhận thông báo hệ thống</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-700 font-medium text-sm">Email khi có lịch hẹn mới</span>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400" />
                                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-700 font-medium text-sm">Thông báo doanh thu hàng ngày</span>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminSettings;