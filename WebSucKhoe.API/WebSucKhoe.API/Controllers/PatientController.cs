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
                TrangThai = "Pending", // Mặc định chờ duyệt
                NgayTao = DateTime.Now
            };

            _context.LichHens.Add(lichHen);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đặt lịch thành công!", MaLichHen = lichHen.MaLichHen });
        }
    }

    public class BookingDto
    {
        public int MaBacSi { get; set; }
        public DateTime NgayHen { get; set; }
        public string LyDoKham { get; set; }
    }
}