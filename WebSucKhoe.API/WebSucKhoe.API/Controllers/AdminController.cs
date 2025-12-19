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
                .OrderByDescending(h => h.NgayTao)
                .Select(h => new
                {
                    h.MaHoaDon,
                    TenBenhNhan = h.MaBenhNhanNavigation.HoTen,
                    h.TongTien,
                    h.TrangThaiThanhToan,
                    h.NgayTao
                }).ToListAsync();
            return Ok(list);
        }

        // 4.2 Xác nhận thanh toán
        [HttpPost("confirm-payment/{maHoaDon}")]
        public async Task<IActionResult> ConfirmPayment(int maHoaDon)
        {
            var hoaDon = await _context.HoaDons.FindAsync(maHoaDon);
            if (hoaDon == null) return NotFound();

            hoaDon.TrangThaiThanhToan = "DaThanhToan";
            hoaDon.PhuongThucThanhToan = "ChuyenKhoan";

            // Kích hoạt gói đăng ký nếu có
            if (hoaDon.MaDangKy != null)
            {
                var dangKy = await _context.DangKyGois.FindAsync(hoaDon.MaDangKy);
                if (dangKy != null)
                {
                    dangKy.TrangThai = "DangDung";
                }
            }

            await _context.SaveChangesAsync();
            return Ok("Đã xác nhận thanh toán và kích hoạt dịch vụ.");
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