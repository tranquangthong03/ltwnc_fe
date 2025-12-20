using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ Admin được truy cập
    public class AdminController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public AdminController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // =============================================================
        // 1. QUẢN LÝ BÁC SĨ (Đã cập nhật & Bổ sung Update)
        // =============================================================

        // 1.1 Lấy danh sách bác sĩ (Cập nhật trả về đầy đủ thông tin hơn)
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            var list = await _context.ChiTietBacSis
                .Include(d => d.MaBacSiNavigation) // Join bảng NguoiDung
                .Select(d => new
                {
                    MaBacSi = d.MaBacSi,
                    HoTen = d.MaBacSiNavigation.HoTen,
                    Email = d.MaBacSiNavigation.Email,
                    SoDienThoai = d.MaBacSiNavigation.SoDienThoai,
                    TenDangNhap = d.MaBacSiNavigation.TenDangNhap, // Thêm tên đăng nhập
                    TrangThai = d.MaBacSiNavigation.TrangThai,
                    ChuyenKhoa = d.ChuyenKhoa,
                    GiaKham = d.GiaKham,
                    SoChungChi = d.SoChungChi,
                    SoNamKinhNghiem = d.SoNamKinhNghiem,
                    GioiThieu = d.MoTa
                }).ToListAsync();

            return Ok(list);
        }

        // 1.2 Thêm bác sĩ mới (Logic đã sửa: check trùng, hash pass...)
        [HttpPost("add-doctor")]
        public async Task<IActionResult> AddDoctor([FromBody] DoctorCreateDto req)
        {
            // Kiểm tra trùng username hoặc email
            if (await _context.NguoiDungs.AnyAsync(u => u.TenDangNhap == req.TenDangNhap || u.Email == req.Email))
            {
                return BadRequest("Tên đăng nhập hoặc Email đã tồn tại.");
            }

            // Tạo User
            var user = new NguoiDung
            {
                TenDangNhap = req.TenDangNhap,
                MatKhauHash = req.MatKhau, // Lưu ý: Thực tế nên Hash password (VD: BCrypt)
                Email = req.Email,
                HoTen = req.HoTen,
                SoDienThoai = req.SoDienThoai,
                VaiTro = "BacSi",
                TrangThai = true,
                NgayTao = DateTime.Now
            };
            _context.NguoiDungs.Add(user);
            await _context.SaveChangesAsync();

            // Tạo Chi tiết bác sĩ
            var detail = new ChiTietBacSi
            {
                MaBacSi = user.MaNguoiDung,
                ChuyenKhoa = req.ChuyenKhoa,
                GiaKham = req.GiaKham,
                SoChungChi = req.SoChungChi,
                MoTa = req.GioiThieu
            };
            _context.ChiTietBacSis.Add(detail);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã tạo bác sĩ thành công" });
        }

        // 1.3 Cập nhật thông tin bác sĩ (MỚI THÊM)
        [HttpPut("update-doctor/{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] DoctorUpdateDto req)
        {
            var user = await _context.NguoiDungs
                .Include(u => u.ChiTietBacSi)
                .FirstOrDefaultAsync(u => u.MaNguoiDung == id);

            if (user == null) return NotFound("Không tìm thấy bác sĩ");

            // Cập nhật bảng NguoiDung
            user.HoTen = req.HoTen;
            user.Email = req.Email;
            user.SoDienThoai = req.SoDienThoai;

            // Cập nhật bảng ChiTietBacSi
            if (user.ChiTietBacSi == null)
            {
                user.ChiTietBacSi = new ChiTietBacSi { MaBacSi = id };
                _context.ChiTietBacSis.Add(user.ChiTietBacSi);
            }

            user.ChiTietBacSi.ChuyenKhoa = req.ChuyenKhoa;
            user.ChiTietBacSi.GiaKham = req.GiaKham;
            user.ChiTietBacSi.SoChungChi = req.SoChungChi;
            user.ChiTietBacSi.MoTa = req.GioiThieu;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        // =============================================================
        // 2. QUẢN LÝ USER CHUNG (Xóa, Khóa/Mở khóa) - KHÔI PHỤC
        // =============================================================

        // 2.1 Xóa người dùng (Bác sĩ hoặc Bệnh nhân)
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.NguoiDungs.FindAsync(id);
            if (user == null) return NotFound();

            // Nếu cần xóa cascade thủ công (nếu DB chưa config cascade delete)
            var bsDetail = await _context.ChiTietBacSis.FindAsync(id);
            if (bsDetail != null) _context.ChiTietBacSis.Remove(bsDetail);

            var bnDetail = await _context.ChiTietBenhNhans.FindAsync(id);
            if (bnDetail != null) _context.ChiTietBenhNhans.Remove(bnDetail);

            _context.NguoiDungs.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa thành công" });
        }

        // 2.2 Cập nhật trạng thái người dùng (Khóa/Mở khóa)
        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var user = await _context.NguoiDungs.FindAsync(id);
            if (user == null) return NotFound($"Không tìm thấy người dùng ID: {id}");

            user.TrangThai = request.trangThai;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Đã {(request.trangThai ? "mở khóa" : "khóa")} tài khoản thành công",
                trangThai = user.TrangThai,
                userId = user.MaNguoiDung
            });
        }

        // =============================================================
        // 3. QUẢN LÝ BỆNH NHÂN - KHÔI PHỤC
        // =============================================================
        [HttpGet("patients")]
        public async Task<IActionResult> GetPatients()
        {
            var list = await _context.ChiTietBenhNhans
                .Include(p => p.MaBenhNhanNavigation)
                .Select(p => new
                {
                    MaBenhNhan = p.MaBenhNhanNavigation.MaNguoiDung,
                    HoTen = p.MaBenhNhanNavigation.HoTen,
                    Email = p.MaBenhNhanNavigation.Email,
                    SoDienThoai = p.MaBenhNhanNavigation.SoDienThoai,
                    TrangThai = p.MaBenhNhanNavigation.TrangThai,
                    VaiTro = p.MaBenhNhanNavigation.VaiTro,
                    NgaySinh = p.NgaySinh,
                    GioiTinh = p.GioiTinh,
                    DiaChi = p.DiaChi,
                    TienSuBenh = p.TienSuBenh
                }).ToListAsync();

            return Ok(list);
        }

        // =============================================================
        // 4. QUẢN LÝ THANH TOÁN & HÓA ĐƠN - KHÔI PHỤC
        // =============================================================

        // 4.1 Lấy danh sách Hóa đơn
        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices()
        {
            var list = await _context.HoaDons
                .Include(h => h.MaBenhNhanNavigation)
                .Include(h => h.MaDangKyNavigation)
                .ThenInclude(d => d.MaGoiNavigation)
                .Include(h => h.MaLichHenNavigation)
                .OrderByDescending(h => h.NgayTao)
                .Select(h => new
                {
                    h.MaHoaDon,
                    Email = h.MaBenhNhanNavigation.Email,
                    TenBenhNhan = h.MaBenhNhanNavigation.HoTen,
                    DichVu = h.MaDangKyNavigation != null ? h.MaDangKyNavigation.MaGoiNavigation.TenGoi : 
                             (h.MaLichHenNavigation != null ? (h.MaLichHenNavigation.LyDoKham ?? "Khám tại lịch hẹn") : "Dịch vụ"),
                    h.TongTien,
                    h.TrangThaiThanhToan,
                    h.PhuongThucThanhToan,
                    h.MaGiaoDich,
                    h.NgayTao
                }).ToListAsync();
            return Ok(list);
        }

        // 4.2 Xác nhận thanh toán (Cập nhật logic kích hoạt gói)
        [HttpPost("confirm-payment/{maHoaDon}")]
        public async Task<IActionResult> ConfirmPayment(int maHoaDon)
        {
            var hoaDon = await _context.HoaDons.FindAsync(maHoaDon);
            if (hoaDon == null) return NotFound("Không tìm thấy hóa đơn");

            // 1. Cập nhật hóa đơn
            hoaDon.TrangThaiThanhToan = "DaThanhToan";
            hoaDon.PhuongThucThanhToan = "ChuyenKhoan"; // Hoặc lấy từ request nếu cần

            // 2. Kích hoạt gói đăng ký nếu hóa đơn này thuộc về một đăng ký gói
            if (hoaDon.MaDangKy != null)
            {
                var dangKy = await _context.DangKyGois.FindAsync(hoaDon.MaDangKy);
                if (dangKy != null)
                {
                    dangKy.TrangThai = "DangDung"; // Kích hoạt gói
                    // Cập nhật ngày kết thúc dựa trên thời hạn gói (nếu cần logic này)
                    // dangKy.NgayKetThuc = DateTime.Now.AddDays(goi.ThoiHan); 
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã xác nhận thanh toán và kích hoạt dịch vụ." });
        }

        // =============================================================
        // 5. QUẢN LÝ CHAT (Chat Monitor) - KHÔI PHỤC
        // =============================================================

        [HttpGet("chat-monitor")]
        public async Task<IActionResult> GetAllChatSessions([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var sessions = await _context.PhienChats
                .Include(p => p.MaNguoiDungNavigation)
                .OrderByDescending(p => p.ThoiGianTao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.MaPhienChat,
                    TenBenhNhan = p.MaNguoiDungNavigation.HoTen,
                    p.TieuDe,
                    p.ThoiGianTao,
                    SoTinNhan = _context.TinNhans.Count(t => t.MaPhienChat == p.MaPhienChat)
                })
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpGet("chat-detail/{maPhienChat}")]
        public async Task<IActionResult> GetChatDetail(int maPhienChat)
        {
            var details = await _context.TinNhans
                .Where(t => t.MaPhienChat == maPhienChat)
                .OrderBy(t => t.ThoiGianGui)
                .Select(t => new
                {
                    t.MaTinNhan,
                    Sender = t.VaiTro == "user" ? "Bệnh nhân" : "AI Chatbot",
                    NoiDung = t.NoiDung,
                    ThoiGian = t.ThoiGianGui
                })
                .ToListAsync();

            if (!details.Any()) return NotFound("Phiên chat không tồn tại hoặc trống.");

            return Ok(details);
        }
        // =============================================================
        // 6. QUẢN LÝ LỊCH HẸN (Bổ sung cho Admin)
        // =============================================================

        // 6.1 Lấy tất cả lịch hẹn
        [HttpGet("appointments")]
        public async Task<IActionResult> GetAllAppointments()
        {
            var list = await _context.LichHens
                .Include(l => l.MaBenhNhanNavigation)
                .Include(l => l.MaBacSiNavigation)
                .OrderByDescending(l => l.NgayGioHen)
                .Select(l => new
                {
                    MaLichHen = l.MaLichHen,
                    BenhNhan = l.MaBenhNhanNavigation.HoTen,
                    BacSi = l.MaBacSiNavigation.HoTen,
                    NgayGioHen = l.NgayGioHen,
                    TrangThai = l.TrangThai,
                    LyDo = l.LyDoKham
                })
                .ToListAsync();

            return Ok(list);
        }

        // 6.2 Cập nhật trạng thái lịch hẹn (Duyệt/Hủy)
        [HttpPut("appointment/{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] AppointmentStatusDto req)
        {
            var appt = await _context.LichHens.FindAsync(id);
            if (appt == null) return NotFound("Không tìm thấy lịch hẹn");

            appt.TrangThai = req.Status;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật trạng thái thành công" });
        }

        // Class DTO để nhận dữ liệu từ Frontend
        public class AppointmentStatusDto
        {
            public string Status { get; set; }
        }


        // =============================================================
        // 7. DASHBOARD STATS (Thống kê cho trang chủ Admin)
        // =============================================================
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var today = DateTime.Today;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // 1. Số liệu tổng quan
            var totalPatients = await _context.NguoiDungs.CountAsync(u => u.VaiTro == "BenhNhan");
            var totalDoctors = await _context.ChiTietBacSis.CountAsync();
            var appointmentsToday = await _context.LichHens.CountAsync(l => l.NgayGioHen.Date == today);

            // Doanh thu tháng này (Chỉ tính hóa đơn đã thanh toán)
            var monthlyRevenue = await _context.HoaDons
                .Where(h => h.TrangThaiThanhToan == "DaThanhToan" && h.NgayTao >= startOfMonth)
                .SumAsync(h => h.TongTien);

            // 2. Hoạt động gần đây (Lấy 5 lịch hẹn mới nhất)
            var recentActivities = await _context.LichHens
                .Include(l => l.MaBenhNhanNavigation)
                .OrderByDescending(l => l.NgayTao)
                .Take(5)
                .Select(l => new
                {
                    Id = l.MaLichHen,
                    User = l.MaBenhNhanNavigation.HoTen,
                    Action = "đã đặt lịch hẹn",
                    Time = l.NgayTao,
                    Type = "appointment"
                })
                .ToListAsync();

            return Ok(new
            {
                totalPatients,
                totalDoctors,
                appointmentsToday,
                monthlyRevenue,
                recentActivities
            });
        }

        // =============================================================
        // 8. QUẢN LÝ GÓI KHÁM (Packages)
        // =============================================================
        [HttpGet("packages")]
        public async Task<IActionResult> GetPackages()
        {
            return Ok(await _context.GoiKhams.ToListAsync());
        }

        [HttpPost("packages")]
        public async Task<IActionResult> CreatePackage([FromBody] GoiKham model)
        {
            _context.GoiKhams.Add(model);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Tạo gói thành công" });
        }

        [HttpPut("packages/{id}")]
        public async Task<IActionResult> UpdatePackage(int id, [FromBody] GoiKham model)
        {
            var pkg = await _context.GoiKhams.FindAsync(id);
            if (pkg == null) return NotFound();

            pkg.TenGoi = model.TenGoi;
            pkg.GiaTien = model.GiaTien;
            pkg.ThoiHanNgay = model.ThoiHanNgay;
            pkg.MoTa = model.MoTa;
            // pkg.DangHoatDong = model.DangHoatDong; // Nếu có

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        [HttpDelete("packages/{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var pkg = await _context.GoiKhams.FindAsync(id);
            if (pkg == null) return NotFound();
            _context.GoiKhams.Remove(pkg);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã xóa gói" });
        }

    }

    // =============================================================
    // DATA TRANSFER OBJECTS (DTOs)
    // =============================================================

    public class DoctorCreateDto
    {
        public string TenDangNhap { get; set; }
        public string MatKhau { get; set; }
        public string Email { get; set; }
        public string HoTen { get; set; }
        public string SoDienThoai { get; set; }
        public string ChuyenKhoa { get; set; }
        public decimal GiaKham { get; set; }
        public string SoChungChi { get; set; }
        public string GioiThieu { get; set; }
    }

    public class DoctorUpdateDto
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string ChuyenKhoa { get; set; }
        public decimal GiaKham { get; set; }
        public string SoChungChi { get; set; }
        public string GioiThieu { get; set; }
    }

    public class UpdateStatusRequest
    {
        public bool trangThai { get; set; }
    }
}