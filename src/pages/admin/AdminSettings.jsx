import React from 'react';
import { Settings, Shield, Bell } from 'lucide-react';

const AdminSettings = () => {
    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Cài đặt hệ thống</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="text-blue-600" size={24}/>
                        <h3 className="text-lg font-bold">Bảo mật</h3>
                    </div>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
                            <input type="password" class="w-full p-2 border rounded-lg bg-slate-50" placeholder="••••••••"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
                            <input type="password" class="w-full p-2 border rounded-lg bg-slate-50" placeholder="••••••••"/>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Đổi mật khẩu</button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="text-orange-500" size={24}/>
                        <h3 className="text-lg font-bold">Thông báo</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Email khi có lịch hẹn mới</span>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600">Thông báo doanh thu hàng ngày</span>
                            <input type="checkbox" className="toggle" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminSettings;