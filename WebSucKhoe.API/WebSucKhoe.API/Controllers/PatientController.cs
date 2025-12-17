using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "BenhNhan")] // Chỉ Bệnh nhân mới gọi được
    public class PatientController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public PatientController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // 1. Đăng ký gói khám sức khỏe
        [HttpPost("register-package")]
        public async Task<IActionResult> RegisterPackage([FromBody] DangKyGoiRequest req)
        {
            // Transaction để đảm bảo: Đăng ký + Tạo hóa đơn phải cùng thành công hoặc cùng thất bại
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var goiKham = await _context.GoiKhams.FindAsync(req.MaGoi);
                if (goiKham == null) return NotFound("Gói khám không tồn tại");

                // A. Tạo bản ghi Đăng Ký
                var dangKy = new DangKyGoi
                {
                    MaBenhNhan = req.MaBenhNhan,
                    MaGoi = req.MaGoi,
                    NgayBatDau = DateTime.Now,
                    NgayKetThuc = DateTime.Now.AddDays(goiKham.ThoiHanNgay),
                    TrangThai = "ChoThanhToan" // Mặc định chờ thanh toán
                };
                _context.DangKyGois.Add(dangKy);
                await _context.SaveChangesAsync(); // Để lấy MaDangKy vừa tạo

                // B. Tạo Hóa Đơn Tương Ứng
                var hoaDon = new HoaDon
                {
                    MaBenhNhan = req.MaBenhNhan,
                    MaDangKy = dangKy.MaDangKy,
                    TongTien = goiKham.GiaTien,
                    TrangThaiThanhToan = "ChuaThanhToan",
                    NgayTao = DateTime.Now
                };
                _context.HoaDons.Add(hoaDon);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { Message = "Đăng ký thành công, vui lòng thanh toán", MaHoaDon = hoaDon.MaHoaDon });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest("Lỗi xử lý: " + ex.Message);
            }
        }

        // 2. Xem lịch sử hóa đơn của mình
        [HttpGet("my-invoices/{userId}")]
        public async Task<IActionResult> GetMyInvoices(int userId)
        {
            // Kiểm tra user hiện tại có đúng là userId đang request không (Bảo mật)
            var currentUserId = int.Parse(User.FindFirst("UserID")?.Value);
            if (currentUserId != userId) return Forbid();

            var list = await _context.HoaDons
                .Include(h => h.MaDangKyNavigation)
                .ThenInclude(d => d.MaGoiNavigation) // Include lấy tên gói
                .Where(x => x.MaBenhNhan == userId)
                .Select(x => new
                {
                    x.MaHoaDon,
                    TenGoi = x.MaDangKyNavigation.MaGoiNavigation.TenGoi,
                    x.TongTien,
                    x.TrangThaiThanhToan,
                    x.NgayTao
                })
                .ToListAsync();
            return Ok(list);
        }
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] PatientUpdateDto req)
        {
            // Lấy ID từ Token (Bảo mật: User A không sửa được hồ sơ User B)
            var userId = int.Parse(User.FindFirst("UserID").Value);

            var detail = await _context.ChiTietBenhNhans.FindAsync(userId);
            var user = await _context.NguoiDungs.FindAsync(userId);

            if (detail == null || user == null) return NotFound();

            // Cập nhật thông tin
            user.HoTen = req.HoTen ?? user.HoTen;
            user.SoDienThoai = req.SoDienThoai ?? user.SoDienThoai;
            user.AnhDaiDien = req.AnhDaiDien ?? user.AnhDaiDien;

            detail.DiaChi = req.DiaChi ?? detail.DiaChi;
            detail.TienSuBenh = req.TienSuBenh ?? detail.TienSuBenh; // Quan trọng để AI đọc
            detail.NhomMau = req.NhomMau ?? detail.NhomMau;

            await _context.SaveChangesAsync();
            return Ok("Cập nhật hồ sơ thành công.");
        }

        // DTO Update
        public class PatientUpdateDto
        {
            public string? HoTen { get; set; }
            public string? SoDienThoai { get; set; }
            public string? DiaChi { get; set; }
            public string? TienSuBenh { get; set; }
            public string? NhomMau { get; set; }
            public string? AnhDaiDien { get; set; }
        }
    }

    public class DangKyGoiRequest
    {
        public int MaBenhNhan { get; set; }
        public int MaGoi { get; set; }
    }
}