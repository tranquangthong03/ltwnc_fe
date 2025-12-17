using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "BacSi")]
    public class DoctorController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public DoctorController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // Xem thông tin chi tiết bệnh nhân (Chỉ xem những người đã đặt lịch với mình)
        [HttpGet("my-patients/{doctorId}")]
        public async Task<IActionResult> GetMyPatients(int doctorId)
        {
            // Join bảng Lịch hẹn -> Bệnh nhân -> Chi tiết bệnh nhân
            var patients = await _context.LichHens
               .Where(l => l.MaBacSi == doctorId)
               .Include(l => l.MaBenhNhanNavigation) // Link tới User
               .ThenInclude(u => u.ChiTietBenhNhan)  // Link tới ChiTietBenhNhan
               .Select(l => new
               {
                   HoTen = l.MaBenhNhanNavigation.HoTen,
                   NgaySinh = l.MaBenhNhanNavigation.ChiTietBenhNhan.NgaySinh,
                   TienSuBenh = l.MaBenhNhanNavigation.ChiTietBenhNhan.TienSuBenh,
                   LyDoKham = l.LyDoKham,
                   NgayHen = l.NgayGioHen
               })
               .Distinct()
               .ToListAsync();

            return Ok(patients);
        }
    }
}