import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Search, Lock, Unlock, Mail, Phone, MapPin, X, RefreshCw,
  Users, UserCheck, UserX, TrendingUp, Filter, Activity
} from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | locked
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Gọi đúng endpoint từ AdminController
      const res = await api.get("/Admin/patients");

      // Backend đã trả về chỉ bệnh nhân, không cần lọc thêm
      setUsers(res.data);

      if (res.data.length === 0) {
        toast.info("Chưa có bệnh nhân nào trong hệ thống");
      } else {
        console.log("Đã tải thành công", res.data.length, "bệnh nhân");
        console.log("Dữ liệu bệnh nhân:", res.data);
        // Debug từng bệnh nhân
        res.data.forEach((patient, index) => {
          console.log(`Bệnh nhân ${index + 1}:`, {
            MaBenhNhan: patient.MaBenhNhan,
            HoTen: patient.HoTen,
            Email: patient.Email,
            SoDienThoai: patient.SoDienThoai,
            TrangThai: patient.TrangThai
          });
        });
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bệnh nhân:", error);
      if (error.response?.status === 401) {
        toast.error("Bạn cần đăng nhập với quyền Admin để xem danh sách này.");
      } else if (error.response?.status === 403) {
        toast.error("Bạn không có quyền truy cập chức năng này.");
      } else {
        toast.error("Không thể tải dữ liệu bệnh nhân. Vui lòng kiểm tra kết nối API.");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? "KHÓA" : "MỞ KHÓA"} tài khoản này?`)) return;

    console.log("Toggle status - ID:", id, "Current Status:", currentStatus);

    try {
      // Gọi API cập nhật trạng thái người dùng
      const response = await api.put(`/Admin/users/${id}/status`, {
        trangThai: !currentStatus
      });

      console.log("API Response:", response.data);

      // Cập nhật state local
      setUsers((prev) => prev.map((u) => {
        const uId = u.MaBenhNhan || u.maBenhNhan;
        if (uId === id) {
          return {
            ...u,
            TrangThai: !currentStatus,
            trangThai: !currentStatus
          };
        }
        return u;
      }));

      toast.success(`Đã ${!currentStatus ? "mở khóa" : "khóa"} tài khoản thành công!`);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      if (error.response?.status === 404) {
        toast.error("Không tìm thấy người dùng này.");
      } else {
        toast.error("Lỗi cập nhật trạng thái. Vui lòng thử lại.");
      }
    }
  };

  const processedUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          (u.HoTen || u.hoTen || "")?.toLowerCase().includes(term) ||
          (u.Email || u.email || "")?.toLowerCase().includes(term) ||
          (u.SoDienThoai || u.soDienThoai || "")?.includes(term)
      );
    }

    if (statusFilter === "active") result = result.filter((u) => (u.TrangThai ?? u.trangThai ?? true) === true);
    if (statusFilter === "locked") result = result.filter((u) => (u.TrangThai ?? u.trangThai ?? true) === false);

    result.sort((a, b) => ((b.MaBenhNhan || b.maBenhNhan) || 0) - ((a.MaBenhNhan || a.maBenhNhan) || 0));

    return result;
  }, [users, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.TrangThai ?? u.trangThai ?? true) === true).length;
    const locked = total - active;
    return { total, active, locked };
  }, [users]);

  const StatusBadge = ({ user }) => {
    const active = user.TrangThai ?? user.trangThai ?? true;
    return (
      <span
        className={
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm " +
          (active
            ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200"
            : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200")
        }
      >
        <span className={"w-2 h-2 rounded-full animate-pulse " + (active ? "bg-emerald-500" : "bg-red-500")} />
        {active ? "Hoạt động" : "Đã khóa"}
      </span>
    );
  };

  const Avatar = ({ user }) => {
    const name = user.HoTen || user.hoTen || "U";
    const active = user.TrangThai ?? user.trangThai ?? true;

    const colors = [
      'from-blue-400 to-indigo-500',
      'from-purple-400 to-pink-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-red-500',
      'from-cyan-400 to-blue-500',
      'from-violet-400 to-purple-500'
    ];
    const initial = name.trim().charAt(0).toUpperCase();
    const colorIndex = initial.charCodeAt(0) % colors.length;

    return (
      <div
        className={
          "relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-lg " +
          (active
            ? `bg-gradient-to-br ${colors[colorIndex]}`
            : "bg-gradient-to-br from-slate-300 to-slate-400")
        }
        title={name}
      >
        {initial}
        {active && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <Activity size={10} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 md:p-8 lg:p-10">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <Users className="text-white" size={32} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <TrendingUp size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-cyan-800 bg-clip-text text-transparent">
                  Quản lý Bệnh nhân
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Theo dõi và quản lý tài khoản người dùng</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={fetchUsers}
                className="group px-5 py-3 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all hover:border-blue-300 hover:shadow-lg flex items-center gap-2"
                title="Tải lại"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Tải lại</span>
              </button>

              {(searchTerm || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold transition-all shadow-lg shadow-red-500/30 hover:shadow-xl flex items-center gap-2"
                  title="Xóa bộ lọc"
                >
                  <X size={18} />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Tổng bệnh nhân</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{stats.total}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="text-slate-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Đang hoạt động</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.active}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="text-emerald-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Đã khóa</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{stats.locked}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserX className="text-red-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Hiển thị</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{processedUsers.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Filter className="text-blue-600" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar - FIXED */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg mb-6 overflow-hidden">
          <div className="p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Box */}
              <div className="lg:w-2/3 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur transition-opacity"></div>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  className="relative w-4/5 pl-12 pr-10 py-3.5 bg-slate-50/50 border-2 border-slate-200/60 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition z-10"
                    title="Xóa từ khóa"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex gap-2 lg:w-1/3 justify-end flex-wrap lg:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={
                    "px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap " +
                    (statusFilter === "all"
                      ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-500/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-200")
                  }
                >
                  <Users size={18} />
                  <span className="hidden sm:inline">Tất cả</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("active")}
                  className={
                    "px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap " +
                    (statusFilter === "active"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200")
                  }
                >
                  <UserCheck size={18} />
                  <span className="hidden sm:inline">Hoạt động</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("locked")}
                  className={
                    "px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap " +
                    (statusFilter === "locked"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200")
                  }
                >
                  <UserX size={18} />
                  <span className="hidden sm:inline">Đã khóa</span>
                </button>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <Filter size={14} />
                  Bộ lọc đang áp dụng:
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Từ khóa: "{searchTerm}"
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="hover:text-blue-900 transition"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className={
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border " +
                    (statusFilter === "active"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-red-100 text-red-700 border-red-200")
                  }>
                    Trạng thái: {statusFilter === "active" ? "Hoạt động" : "Đã khóa"}
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="hover:opacity-70 transition"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : processedUsers.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/60">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy bệnh nhân</h3>
                <p className="text-slate-500 mb-6">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          ) : (
            processedUsers.map((user) => {
              // Debug log cho từng user
              console.log("Rendering user:", user);

              // Sử dụng MaBenhNhan làm userId (đây chính là MaNguoiDung trong bảng NguoiDung)
              const userId = user.MaBenhNhan || user.maBenhNhan || "N/A";
              const userName = user.HoTen || user.hoTen || "Chưa có tên";
              const userEmail = user.Email || user.email || "—";
              const userPhone = user.SoDienThoai || user.soDienThoai || "—";
              const userAddress = user.DiaChi || user.diaChi || "Chưa cập nhật";
              const userStatus = user.TrangThai ?? user.trangThai ?? true;

              return (
                <div
                  key={userId}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="relative h-24 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full"></div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full"></div>
                  </div>

                  {/* Avatar positioned to overlap header */}
                  <div className="px-6 -mt-6 relative">
                    <div className="flex items-start justify-between">
                      <Avatar user={user} />
                      <div className="pt-1">
                        <StatusBadge user={user} />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 pb-6 pt-3 space-y-4">
                    {/* User Name & ID */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-0.5 truncate group-hover:text-blue-600 transition-colors">
                        {userName}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold">ID: #{userId}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors group/item">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover/item:bg-blue-100 transition-colors shrink-0">
                          <Mail size={14} className="text-slate-500 group-hover/item:text-blue-600" />
                        </div>
                        <span className="font-medium truncate">{userEmail}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600 hover:text-emerald-600 transition-colors group/item">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover/item:bg-emerald-100 transition-colors shrink-0">
                          <Phone size={14} className="text-slate-500 group-hover/item:text-emerald-600" />
                        </div>
                        <span className="font-medium">{userPhone}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-600 hover:text-purple-600 transition-colors group/item">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover/item:bg-purple-100 transition-colors shrink-0">
                          <MapPin size={14} className="text-slate-500 group-hover/item:text-purple-600" />
                        </div>
                        <span className="font-medium truncate">{userAddress}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => toggleStatus(userId, userStatus)}
                      className={
                        "w-4/5 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all " +
                        (userStatus
                          ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-2 border-red-200 hover:border-red-600"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-2 border-emerald-200 hover:border-emerald-600")
                      }
                    >
                      {userStatus ? (
                        <>
                          <Lock size={18} />
                          <span>Khóa tài khoản</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={18} />
                          <span>Mở khóa</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Decorative Bottom Border */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>
                </div>
              );
            })
          )}
        </div>
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

export default ManageUsers;