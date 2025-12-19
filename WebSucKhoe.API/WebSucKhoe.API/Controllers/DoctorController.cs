using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "BacSi,Admin")]

    public class DoctorController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public DoctorController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // --- HELPER: Lấy ID người dùng an toàn từ Token ---
        private int GetCurrentUserId()
        {
            var identity = User.Identity as ClaimsIdentity;
            if (identity != null)
            {
                // Tìm claim ID theo nhiều chuẩn khác nhau (Id, UserID, hoặc nameidentifier)
                var userClaim = identity.FindFirst("Id")
                             ?? identity.FindFirst("UserID")
                             ?? identity.FindFirst(ClaimTypes.NameIdentifier);

                if (userClaim != null && int.TryParse(userClaim.Value, out int userId))
                {
                    return userId;
                }
            }
            return 0;
        }

        // =========================================================
        // 1. QUẢN LÝ LỊCH HẸN
        // =========================================================
        [HttpGet("schedule")]
        public async Task<IActionResult> GetSchedule()
        {
            int bacSiId = GetCurrentUserId();
            var schedules = await _context.LichHens
                .Where(x => x.MaBacSi == bacSiId)
                .Include(x => x.MaBenhNhanNavigation)
                .OrderByDescending(x => x.NgayGioHen)
                .Select(x => new
                {
                    x.MaLichHen,
                    x.MaBenhNhan,
                    TenBenhNhan = x.MaBenhNhanNavigation.HoTen,
                    NgayHen = x.NgayGioHen,

                    // --- SỬA DÒNG NÀY ---
                    // Cũ (Lỗi): GioHen = x.NgayGioHen.HasValue ? x.NgayGioHen.Value.ToString("HH:mm") : "00:00",
                    // Mới (Đúng): Trực tiếp format vì NgayGioHen không bao giờ null
                    GioHen = x.NgayGioHen.ToString("HH:mm"),

                    x.LyDoKham,
                    x.TrangThai
                })
                .ToListAsync();

            return Ok(schedules);
        }

        [HttpPut("appointment/{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] dynamic data)
        {
            // Lưu ý: data là dynamic JSON { "status": "..." }
            string newStatus;
            try { newStatus = data.GetProperty("status").ToString(); } catch { return BadRequest("Thiếu trạng thái"); }

            var appt = await _context.LichHens.FindAsync(id);
            if (appt == null) return NotFound("Không tìm thấy lịch hẹn");

            if (appt.MaBacSi != GetCurrentUserId()) return Forbid();

            appt.TrangThai = newStatus;
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        // =========================================================
        // 2. QUẢN LÝ BỆNH NHÂN
        // =========================================================
        [HttpGet("my-patients")]
        public async Task<IActionResult> GetMyPatients()
        {
            int bacSiId = GetCurrentUserId();
            var patients = await _context.LichHens
                .Where(l => l.MaBacSi == bacSiId)
                .Select(l => l.MaBenhNhanNavigation)
                .Distinct()
                .Include(u => u.ChiTietBenhNhan)
                .Select(u => new
                {
                    u.MaNguoiDung,
                    u.HoTen,
                    u.SoDienThoai,
                    u.Email,
                    NgaySinh = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.NgaySinh : null,
                    GioiTinh = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.GioiTinh : "Khác",
                    DiaChi = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.DiaChi : ""
                })
                .ToListAsync();

            return Ok(patients);
        }

        [HttpPut("patient/{id}")]
        public async Task<IActionResult> UpdatePatientInfo(int id, [FromBody] ChiTietBenhNhan model)
        {
            var details = await _context.ChiTietBenhNhans.FirstOrDefaultAsync(x => x.MaBenhNhan == id);
            if (details == null)
            {
                details = new ChiTietBenhNhan { MaBenhNhan = id };
                _context.ChiTietBenhNhans.Add(details);
            }

            details.NgaySinh = model.NgaySinh;
            details.GioiTinh = model.GioiTinh;
            details.DiaChi = model.DiaChi;
            details.TienSuBenh = model.TienSuBenh;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        // =========================================================
        // 3. QUẢN LÝ HỒ SƠ CÁ NHÂN (PROFILE) - ĐÃ SỬA
        // =========================================================

        // GET: api/Doctor/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            int userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized("Không xác định được người dùng.");

            var user = await _context.NguoiDungs
                .Include(u => u.ChiTietBacSi)
                .FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

            if (user == null) return NotFound();

            // Trả về object phẳng để Frontend dễ binding
            return Ok(new
            {
                user.HoTen,
                user.Email,
                user.SoDienThoai,
                // Mapping dữ liệu từ bảng chi tiết (xử lý null nếu chưa có)
                ChuyenKhoa = user.ChiTietBacSi?.ChuyenKhoa ?? "",
                KinhNghiem = user.ChiTietBacSi?.SoNamKinhNghiem ?? 0, // DB: SoNamKinhNghiem
                GiaKham = user.ChiTietBacSi?.GiaKham ?? 0,
                SoChungChi = user.ChiTietBacSi?.SoChungChi ?? "",
                MoTa = user.ChiTietBacSi?.MoTa ?? "" // DB: MoTa -> FE: GioiThieu/Bio
            });
        }

        // PUT: api/Doctor/profile
        // Sử dụng DTO cụ thể thay vì dynamic để an toàn hơn
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] DoctorProfileUpdateDto req)
        {
            int userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var user = await _context.NguoiDungs
                .Include(u => u.ChiTietBacSi)
                .FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

            if (user == null) return NotFound();

            // 1. Cập nhật thông tin cơ bản
            user.HoTen = req.HoTen;
            user.SoDienThoai = req.SoDienThoai;

            // 2. Cập nhật thông tin chi tiết (Tạo mới nếu chưa có)
            if (user.ChiTietBacSi == null)
            {
                user.ChiTietBacSi = new ChiTietBacSi { MaBacSi = userId };
                _context.ChiTietBacSis.Add(user.ChiTietBacSi);
            }

            user.ChiTietBacSi.ChuyenKhoa = req.ChuyenKhoa;
            user.ChiTietBacSi.SoNamKinhNghiem = req.KinhNghiem; // Map từ DTO
            user.ChiTietBacSi.GiaKham = req.GiaKham;
            user.ChiTietBacSi.MoTa = req.GioiThieu; // Map từ DTO

            // Lưu thay đổi
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        // =========================================================
        // 4. TẠO HỒ SƠ BỆNH ÁN
        // =========================================================
        [HttpPost("medical-record")]
        public async Task<IActionResult> CreateMedicalRecord([FromBody] HoSoYte model)
        {
            model.MaBacSi = GetCurrentUserId();
            model.NgayTao = DateTime.Now;

            _context.HoSoYtes.Add(model);

            // Cập nhật trạng thái lịch hẹn thành Completed
            var appointment = await _context.LichHens
                .Where(x => x.MaBenhNhan == model.MaBenhNhan
                         && x.MaBacSi == model.MaBacSi
                         && x.TrangThai == "Confirmed")
                .OrderByDescending(x => x.NgayGioHen)
                .FirstOrDefaultAsync();

            if (appointment != null)
            {
                appointment.TrangThai = "Completed";
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã lưu hồ sơ bệnh án", MaHoSo = model.MaHoSo });
        }

    }
   
    // --- DTO CLASS ---
    public class DoctorProfileUpdateDto
    {
        public string HoTen { get; set; }
        public string SoDienThoai { get; set; }
        public string ChuyenKhoa { get; set; }
        public int KinhNghiem { get; set; }
        public decimal GiaKham { get; set; }
        public string GioiThieu { get; set; }
    }
}