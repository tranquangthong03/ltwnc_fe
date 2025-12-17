using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public DoctorController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // =========================================================
        // 1. API LẤY DANH SÁCH BÁC SĨ (PUBLIC - Ai cũng xem được)
        // =========================================================
        [HttpGet]
        [AllowAnonymous] // Cho phép truy cập không cần token
        public async Task<IActionResult> GetAllDoctors()
        {
            var doctors = await _context.NguoiDungs
                .Where(u => u.VaiTro == "BacSi" && u.TrangThai == true) // Lấy user là Bác sĩ và đang hoạt động
                .Include(u => u.ChiTietBacSi) // Kèm thông tin chi tiết (Chuyên khoa, giá...)
                .Select(u => new
                {
                    MaBacSi = u.MaNguoiDung,
                    HoTen = u.HoTen,
                    // Nếu chưa có chi tiết thì để mặc định
                    ChuyenKhoa = u.ChiTietBacSi != null ? u.ChiTietBacSi.ChuyenKhoa : "Đa Khoa",
                    KinhNghiem = u.ChiTietBacSi != null && u.ChiTietBacSi.SoNamKinhNghiem.HasValue
                                 ? u.ChiTietBacSi.SoNamKinhNghiem + " năm"
                                 : "N/A",
                    Anh = u.AnhDaiDien,
                    DanhGia = 5.0 // Tạm thời hardcode, sau này tính trung bình từ bảng Đánh giá
                })
                .ToListAsync();

            return Ok(doctors);
        }

        // =========================================================
        // 2. API XEM BỆNH NHÂN CỦA TÔI (CHỈ BÁC SĨ)
        // =========================================================
        [HttpGet("my-patients/{doctorId}")]
        [Authorize(Roles = "BacSi")] // Chỉ bác sĩ mới được gọi
        public async Task<IActionResult> GetMyPatients(int doctorId)
        {
            var patients = await _context.LichHens
               .Where(l => l.MaBacSi == doctorId)
               .Include(l => l.MaBenhNhanNavigation)
               .ThenInclude(u => u.ChiTietBenhNhan)
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

        // =========================================================
        // TEST API - Kiểm tra xem controller có hoạt động không
        // =========================================================
        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult TestEndpoint()
        {
            Console.WriteLine("Test endpoint called successfully!");
            return Ok(new { message = "DoctorController is working!", timestamp = DateTime.Now });
        }

        // =========================================================
        // 3. API TẠO BÁC SĨ MỚI (CHỈ ADMIN)
        // =========================================================
        [HttpPost]
        [AllowAnonymous] // Tạm thời bỏ authorize để test
        public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorDto doctorDto)
        {
            Console.WriteLine($"CreateDoctor called with data: {System.Text.Json.JsonSerializer.Serialize(doctorDto)}");
            
            try
            {
                // Kiểm tra email đã tồn tại chưa
                var existingUser = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == doctorDto.Email);
                if (existingUser != null)
                {
                    return BadRequest("Email đã được sử dụng");
                }

                // Tạo người dùng mới
                var newUser = new NguoiDung
                {
                    TenDangNhap = doctorDto.TenDangNhap,
                    MatKhauHash = doctorDto.MatKhau, // Trong thực tế cần hash password
                    Email = doctorDto.Email,
                    HoTen = doctorDto.HoTen,
                    SoDienThoai = doctorDto.SoDienThoai,
                    VaiTro = "BacSi",
                    TrangThai = true,
                    NgayTao = DateTime.Now
                };

                _context.NguoiDungs.Add(newUser);
                await _context.SaveChangesAsync();

                // Tạo chi tiết bác sĩ
                var doctorDetail = new ChiTietBacSi
                {
                    MaBacSi = newUser.MaNguoiDung,
                    ChuyenKhoa = doctorDto.ChuyenKhoa,
                    SoChungChi = doctorDto.SoChungChi,
                    GiaKham = doctorDto.GiaKham,
                    MoTa = doctorDto.GioiThieu,
                    SoNamKinhNghiem = 0
                };

                _context.ChiTietBacSis.Add(doctorDetail);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Created doctor successfully with ID: {newUser.MaNguoiDung}");
                return Ok(new { message = "Tạo bác sĩ thành công", maBacSi = newUser.MaNguoiDung });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating doctor: {ex.Message}");
                return StatusCode(500, $"Lỗi tạo bác sĩ: {ex.Message}");
            }
        }

        // =========================================================
        // 4. API CẬP NHẬT THÔNG TIN BÁC SĨ (CHỈ ADMIN)
        // =========================================================
        [HttpPut("{id}")]
        [AllowAnonymous] // Tạm thời bỏ authorize để test
        public async Task<IActionResult> UpdateDoctor(int id, [FromBody] UpdateDoctorDto doctorDto)
        {
            Console.WriteLine($"UpdateDoctor called for ID: {id} with data: {System.Text.Json.JsonSerializer.Serialize(doctorDto)}");
            
            try
            {
                // Tìm người dùng
                var user = await _context.NguoiDungs.FindAsync(id);
                if (user == null || user.VaiTro != "BacSi")
                {
                    return NotFound("Không tìm thấy bác sĩ");
                }

                // Cập nhật thông tin người dùng
                user.HoTen = doctorDto.HoTen;
                user.Email = doctorDto.Email;
                user.SoDienThoai = doctorDto.SoDienThoai;

                // Tìm hoặc tạo chi tiết bác sĩ
                var doctorDetail = await _context.ChiTietBacSis.FirstOrDefaultAsync(d => d.MaBacSi == id);
                if (doctorDetail == null)
                {
                    doctorDetail = new ChiTietBacSi
                    {
                        MaBacSi = id,
                        ChuyenKhoa = doctorDto.ChuyenKhoa,
                        SoChungChi = doctorDto.SoChungChi,
                        GiaKham = doctorDto.GiaKham,
                        MoTa = doctorDto.GioiThieu,
                        SoNamKinhNghiem = 0
                    };
                    _context.ChiTietBacSis.Add(doctorDetail);
                }
                else
                {
                    doctorDetail.ChuyenKhoa = doctorDto.ChuyenKhoa;
                    doctorDetail.SoChungChi = doctorDto.SoChungChi;
                    doctorDetail.GiaKham = doctorDto.GiaKham;
                    doctorDetail.MoTa = doctorDto.GioiThieu;
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"Updated doctor successfully with ID: {id}");
                return Ok(new { message = "Cập nhật bác sĩ thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating doctor: {ex.Message}");
                return StatusCode(500, $"Lỗi cập nhật bác sĩ: {ex.Message}");
            }
        }

        // =========================================================
        // 5. API XÓA BÁC SĨ (CHỈ ADMIN)
        // =========================================================
        [HttpDelete("{id}")]
        [AllowAnonymous] // Tạm thời bỏ authorize để test
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            Console.WriteLine($"DeleteDoctor called for ID: {id}");
            
            try
            {
                var user = await _context.NguoiDungs.FindAsync(id);
                if (user == null || user.VaiTro != "BacSi")
                {
                    return NotFound("Không tìm thấy bác sĩ");
                }

                // Xóa chi tiết bác sĩ trước (nếu có)
                var doctorDetail = await _context.ChiTietBacSis.FirstOrDefaultAsync(d => d.MaBacSi == id);
                if (doctorDetail != null)
                {
                    _context.ChiTietBacSis.Remove(doctorDetail);
                }

                // Xóa người dùng
                _context.NguoiDungs.Remove(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Deleted doctor successfully with ID: {id}");
                return Ok(new { message = "Xóa bác sĩ thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting doctor: {ex.Message}");
                return StatusCode(500, $"Lỗi xóa bác sĩ: {ex.Message}");
            }
        }
    }

    // DTO Classes
    public class CreateDoctorDto
    {
        public string TenDangNhap { get; set; }
        public string MatKhau { get; set; }
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string ChuyenKhoa { get; set; }
        public string SoChungChi { get; set; }
        public decimal GiaKham { get; set; }
        public string GioiThieu { get; set; }
    }

    public class UpdateDoctorDto
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string ChuyenKhoa { get; set; }
        public string SoChungChi { get; set; }
        public decimal GiaKham { get; set; }
        public string GioiThieu { get; set; }
    }
}