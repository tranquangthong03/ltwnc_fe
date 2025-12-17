using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NguoiDungController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public NguoiDungController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách tất cả bệnh nhân
        /// GET: api/NguoiDung/benhnhan
        /// </summary>
        [HttpGet("benhnhan")]
        public async Task<IActionResult> GetBenhNhan()
        {
            try
            {
                var benhNhan = await _context.NguoiDungs
                    .Where(u => u.VaiTro == "BenhNhan")
                    .Include(u => u.ChiTietBenhNhan)
                    .Select(u => new
                    {
                        maNguoiDung = u.MaNguoiDung,
                        hoTen = u.HoTen,
                        email = u.Email,
                        soDienThoai = u.SoDienThoai,
                        anhDaiDien = u.AnhDaiDien,
                        trangThai = u.TrangThai ?? true,
                        ngayTao = u.NgayTao,
                        // Thông tin từ ChiTietBenhNhan
                        diaChi = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.DiaChi : null,
                        ngaySinh = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.NgaySinh : null,
                        gioiTinh = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.GioiTinh : null,
                        nhomMau = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.NhomMau : null
                    })
                    .OrderByDescending(u => u.maNguoiDung)
                    .ToListAsync();

                return Ok(benhNhan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi lấy danh sách bệnh nhân",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy danh sách tất cả người dùng
        /// GET: api/NguoiDung
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _context.NguoiDungs
                    .Include(u => u.ChiTietBenhNhan)
                    .Include(u => u.ChiTietBacSi)
                    .Select(u => new
                    {
                        maNguoiDung = u.MaNguoiDung,
                        tenDangNhap = u.TenDangNhap,
                        hoTen = u.HoTen,
                        email = u.Email,
                        soDienThoai = u.SoDienThoai,
                        anhDaiDien = u.AnhDaiDien,
                        vaiTro = u.VaiTro,
                        trangThai = u.TrangThai ?? true,
                        ngayTao = u.NgayTao,
                        // Thông tin bổ sung tùy vai trò
                        diaChi = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.DiaChi : null,
                        chuyenKhoa = u.ChiTietBacSi != null ? u.ChiTietBacSi.ChuyenKhoa : null
                    })
                    .OrderByDescending(u => u.maNguoiDung)
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi lấy danh sách người dùng",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết một người dùng
        /// GET: api/NguoiDung/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var user = await _context.NguoiDungs
                    .Include(u => u.ChiTietBenhNhan)
                    .Include(u => u.ChiTietBacSi)
                    .Where(u => u.MaNguoiDung == id)
                    .Select(u => new
                    {
                        maNguoiDung = u.MaNguoiDung,
                        tenDangNhap = u.TenDangNhap,
                        hoTen = u.HoTen,
                        email = u.Email,
                        soDienThoai = u.SoDienThoai,
                        anhDaiDien = u.AnhDaiDien,
                        vaiTro = u.VaiTro,
                        trangThai = u.TrangThai ?? true,
                        ngayTao = u.NgayTao,
                        // Chi tiết bệnh nhân
                        chiTietBenhNhan = u.ChiTietBenhNhan != null ? new
                        {
                            ngaySinh = u.ChiTietBenhNhan.NgaySinh,
                            gioiTinh = u.ChiTietBenhNhan.GioiTinh,
                            diaChi = u.ChiTietBenhNhan.DiaChi,
                            nhomMau = u.ChiTietBenhNhan.NhomMau,
                            tienSuBenh = u.ChiTietBenhNhan.TienSuBenh
                        } : null,
                        // Chi tiết bác sĩ
                        chiTietBacSi = u.ChiTietBacSi != null ? new
                        {
                            chuyenKhoa = u.ChiTietBacSi.ChuyenKhoa,
                            soChungChi = u.ChiTietBacSi.SoChungChi,
                            soNamKinhNghiem = u.ChiTietBacSi.SoNamKinhNghiem,
                            giaKham = u.ChiTietBacSi.GiaKham,
                            moTa = u.ChiTietBacSi.MoTa
                        } : null
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi lấy thông tin người dùng",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Cập nhật trạng thái người dùng (Khóa/Mở khóa)
        /// PUT: api/NguoiDung/{id}/status
        /// </summary>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto update)
        {
            try
            {
                var user = await _context.NguoiDungs.FindAsync(id);

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng" });

                // Không cho phép khóa tài khoản Admin
                if (user.VaiTro == "Admin")
                    return BadRequest(new { message = "Không thể khóa tài khoản Admin" });

                user.TrangThai = update.TrangThai;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = update.TrangThai
                        ? "Đã mở khóa tài khoản thành công"
                        : "Đã khóa tài khoản thành công",
                    maNguoiDung = user.MaNguoiDung,
                    trangThai = user.TrangThai
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi cập nhật trạng thái",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Cập nhật thông tin người dùng (Alternative endpoint)
        /// PUT: api/NguoiDung/{id}
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NguoiDungUpdateDto updateDto)
        {
            try
            {
                var user = await _context.NguoiDungs.FindAsync(id);

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng" });

                // Cập nhật các trường
                if (updateDto.HoTen != null)
                    user.HoTen = updateDto.HoTen;

                if (updateDto.Email != null)
                    user.Email = updateDto.Email;

                if (updateDto.SoDienThoai != null)
                    user.SoDienThoai = updateDto.SoDienThoai;

                if (updateDto.AnhDaiDien != null)
                    user.AnhDaiDien = updateDto.AnhDaiDien;

                if (updateDto.TrangThai.HasValue)
                {
                    // Không cho phép khóa tài khoản Admin
                    if (user.VaiTro == "Admin" && !updateDto.TrangThai.Value)
                        return BadRequest(new { message = "Không thể khóa tài khoản Admin" });

                    user.TrangThai = updateDto.TrangThai.Value;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Cập nhật thông tin thành công",
                    maNguoiDung = user.MaNguoiDung
                });
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new
                {
                    message = "Lỗi cập nhật dữ liệu",
                    error = ex.InnerException?.Message ?? ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi cập nhật",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Tìm kiếm người dùng
        /// GET: api/NguoiDung/search?keyword=...&vaiTro=...&trangThai=...
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? keyword,
            [FromQuery] string? vaiTro,
            [FromQuery] bool? trangThai)
        {
            try
            {
                var query = _context.NguoiDungs
                    .Include(u => u.ChiTietBenhNhan)
                    .Include(u => u.ChiTietBacSi)
                    .AsQueryable();

                // Lọc theo từ khóa
                if (!string.IsNullOrWhiteSpace(keyword))
                {
                    keyword = keyword.ToLower();
                    query = query.Where(u =>
                        u.HoTen.ToLower().Contains(keyword) ||
                        u.Email.ToLower().Contains(keyword) ||
                        (u.SoDienThoai != null && u.SoDienThoai.Contains(keyword)) ||
                        u.TenDangNhap.ToLower().Contains(keyword)
                    );
                }

                // Lọc theo vai trò
                if (!string.IsNullOrWhiteSpace(vaiTro))
                {
                    query = query.Where(u => u.VaiTro == vaiTro);
                }

                // Lọc theo trạng thái
                if (trangThai.HasValue)
                {
                    query = query.Where(u => u.TrangThai == trangThai.Value);
                }

                var users = await query
                    .Select(u => new
                    {
                        maNguoiDung = u.MaNguoiDung,
                        tenDangNhap = u.TenDangNhap,
                        hoTen = u.HoTen,
                        email = u.Email,
                        soDienThoai = u.SoDienThoai,
                        vaiTro = u.VaiTro,
                        trangThai = u.TrangThai ?? true,
                        ngayTao = u.NgayTao,
                        diaChi = u.ChiTietBenhNhan != null ? u.ChiTietBenhNhan.DiaChi : null,
                        chuyenKhoa = u.ChiTietBacSi != null ? u.ChiTietBacSi.ChuyenKhoa : null
                    })
                    .OrderByDescending(u => u.maNguoiDung)
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi tìm kiếm",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Thống kê số lượng người dùng theo vai trò
        /// GET: api/NguoiDung/statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var total = await _context.NguoiDungs.CountAsync();
                var benhNhan = await _context.NguoiDungs.CountAsync(u => u.VaiTro == "BenhNhan");
                var bacSi = await _context.NguoiDungs.CountAsync(u => u.VaiTro == "BacSi");
                var admin = await _context.NguoiDungs.CountAsync(u => u.VaiTro == "Admin");
                var active = await _context.NguoiDungs.CountAsync(u => u.TrangThai == true);
                var locked = await _context.NguoiDungs.CountAsync(u => u.TrangThai == false);

                return Ok(new
                {
                    tongSo = total,
                    benhNhan = benhNhan,
                    bacSi = bacSi,
                    admin = admin,
                    dangHoatDong = active,
                    daKhoa = locked
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi lấy thống kê",
                    error = ex.Message
                });
            }
        }
    }

    // DTOs
    public class StatusUpdateDto
    {
        public bool TrangThai { get; set; }
    }

    public class NguoiDungUpdateDto
    {
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? SoDienThoai { get; set; }
        public string? AnhDaiDien { get; set; }
        public bool? TrangThai { get; set; }
    }
}