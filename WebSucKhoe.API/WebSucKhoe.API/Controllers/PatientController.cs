using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public PatientController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // Helper: Lấy ID User từ Token
        private int GetCurrentUserId()
        {
            var identity = User.Identity as ClaimsIdentity;
            if (identity != null)
            {
                var userClaim = identity.FindFirst("Id")
                             ?? identity.FindFirst("UserID")
                             ?? identity.FindFirst(ClaimTypes.NameIdentifier);
                if (userClaim != null && int.TryParse(userClaim.Value, out int userId)) return userId;
            }
            return 0;
        }

        // 1. LẤY DANH SÁCH BÁC SĨ (Public)
        [HttpGet("doctors")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllDoctors()
        {
            var list = await _context.ChiTietBacSis
                .Include(d => d.MaBacSiNavigation)
                .Where(d => d.MaBacSiNavigation.TrangThai == true)
                .Select(d => new
                {
                    d.MaBacSi,
                    HoTen = d.MaBacSiNavigation.HoTen,
                    AnhDaiDien = d.MaBacSiNavigation.AnhDaiDien,
                    AnhBacSi = d.AnhBacSi, // Thêm ảnh bác sĩ
                    ChuyenKhoa = d.ChuyenKhoa,
                    SoNamKinhNghiem = d.SoNamKinhNghiem,
                    GiaKham = d.GiaKham,
                    DanhGia = 5.0
                })
                .ToListAsync();
            return Ok(list);
        }

        // 2. LẤY LỊCH HẸN CỦA TÔI (Yêu cầu đăng nhập)
        [HttpGet("appointments")]
        [Authorize(Roles = "BenhNhan")]
        public async Task<IActionResult> GetMyAppointments()
        {
            int userId = GetCurrentUserId();
            var list = await _context.LichHens
                .Include(l => l.MaBacSiNavigation)
                .Where(l => l.MaBenhNhan == userId)
                .OrderByDescending(l => l.NgayGioHen)
                .Select(l => new
                {
                    l.MaLichHen,
                    TenBacSi = l.MaBacSiNavigation.HoTen,
                    ChuyenKhoa = l.MaBacSiNavigation.ChiTietBacSi.ChuyenKhoa,
                    l.NgayGioHen,
                    l.TrangThai, // Confirmed, Pending, Cancelled, Completed
                    l.LyDoKham
                })
                .ToListAsync();
            return Ok(list);
        }

        // 3. ĐẶT LỊCH HẸN (Yêu cầu đăng nhập)
        [HttpPost("book-appointment")]
        [Authorize(Roles = "BenhNhan")]
        public async Task<IActionResult> BookAppointment([FromBody] BookingDto req)
        {
            int userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized("Vui lòng đăng nhập lại.");

            var lichHen = new LichHen
            {
                MaBenhNhan = userId,
                MaBacSi = req.MaBacSi,
                NgayGioHen = req.NgayHen,
                LyDoKham = req.LyDoKham,
                TrangThai = "ChoDuyet", // Mặc định chờ duyệt
                NgayTao = DateTime.Now
            };

            _context.LichHens.Add(lichHen);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đặt lịch thành công!", MaLichHen = lichHen.MaLichHen });
        }
        // =========================================================
        // 4. QUẢN LÝ GÓI KHÁM (Bổ sung mới)
        // =========================================================

        // 4.1 Lấy danh sách gói khám (Công khai)
        [HttpGet("packages")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPackages()
        {
            // Chỉ lấy các gói đang hoạt động
            var list = await _context.GoiKhams
                .Where(g => g.DangHoatDong == true)
                .Select(g => new
                {
                    g.MaGoi,
                    g.TenGoi,
                    g.GiaTien,
                    g.MoTa,
                    g.ThoiHanNgay
                })
                .ToListAsync();
            return Ok(list);
        }

        // 4.2 Đăng ký gói khám (Cần đăng nhập)
        [HttpPost("register-package")]
        [Authorize(Roles = "BenhNhan")]
        public async Task<IActionResult> RegisterPackage([FromBody] RegisterPackageDto req)
        {
            int userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized("Vui lòng đăng nhập.");

            // Kiểm tra xem đã có gói nào đang chờ duyệt hoặc đang sử dụng chưa (tùy nghiệp vụ)
            var existing = await _context.DangKyGois
                .FirstOrDefaultAsync(d => d.MaBenhNhan == userId &&
                                          (d.TrangThai == "ChoDuyet" || d.TrangThai == "DangDung"));

            if (existing != null)
            {
                return BadRequest(existing.TrangThai == "ChoDuyet"
                    ? "Bạn đang có một yêu cầu chờ duyệt."
                    : "Bạn đang sử dụng một gói khám.");
            }

            var dangKy = new DangKyGoi
            {
                MaBenhNhan = userId,
                MaGoi = req.MaGoi,
                NgayBatDau = DateTime.Now,
                // Ngày kết thúc sẽ được tính khi Admin duyệt và kích hoạt
                TrangThai = "ChoDuyet" // Trạng thái chờ Admin duyệt
            };

            _context.DangKyGois.Add(dangKy);
            await _context.SaveChangesAsync();

            // Tạo hóa đơn tương ứng (Trạng thái chờ thanh toán)
            var goi = await _context.GoiKhams.FindAsync(req.MaGoi);
            var hoaDon = new HoaDon
            {
                MaBenhNhan = userId,
                MaDangKy = dangKy.MaDangKy,
                TongTien = goi.GiaTien,
                TrangThaiThanhToan = "ChuaThanhToan",
                NgayTao = DateTime.Now
            };
            _context.HoaDons.Add(hoaDon);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng ký thành công! Vui lòng chờ duyệt.", MaDangKy = dangKy.MaDangKy });
        }
        // 4.3 Lấy thông tin gói đang đăng ký/sử dụng của bệnh nhân
        [HttpGet("current-subscription")]
        [Authorize(Roles = "BenhNhan")]
        public async Task<IActionResult> GetCurrentSubscription()
        {
            int userId = GetCurrentUserId(); // Hàm lấy ID từ token (như các phần trước)

            var sub = await _context.DangKyGois
                .Include(d => d.MaGoiNavigation)
                .OrderByDescending(d => d.NgayBatDau)
                .FirstOrDefaultAsync(d => d.MaBenhNhan == userId &&
                                          (d.TrangThai == "ChoDuyet" || d.TrangThai == "DangDung"));

            if (sub == null) return Ok(null);

            return Ok(new
            {
                MaDangKy = sub.MaDangKy,
                MaGoi = sub.MaGoi,
                TenGoi = sub.MaGoiNavigation.TenGoi,
                TrangThai = sub.TrangThai, // 'ChoDuyet' hoặc 'DangDung'
                NgayBatDau = sub.NgayBatDau
            });
        }
    }

    // DTO cho đăng ký gói
    public class RegisterPackageDto
    {
        public int MaGoi { get; set; }
    }


    public class BookingDto
    {
        public int MaBacSi { get; set; }
        public DateTime NgayHen { get; set; }
        public string LyDoKham { get; set; }
    }
}