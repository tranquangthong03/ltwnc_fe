using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebSucKhoe.API.Helpers; // Namespace chứa PasswordHasher
using WebSucKhoe.API.Models;  // Namespace chứa Entity (NguoiDung, ChiTietBenhNhan...)

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(WebSucKhoeDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ====================================================
        // 1. ĐĂNG KÝ BỆNH NHÂN MỚI (Public)
        // ====================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto req)
        {
            try
            {
                // 1. Kiểm tra trùng lặp
                if (await _context.NguoiDungs.AnyAsync(u => u.TenDangNhap == req.TenDangNhap))
                    return BadRequest("Tên đăng nhập đã tồn tại.");

                if (await _context.NguoiDungs.AnyAsync(u => u.Email == req.Email))
                    return BadRequest("Email đã được sử dụng.");

                // 2. Bắt đầu Transaction (Quan trọng để đảm bảo dữ liệu nhất quán)
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Bước A: Tạo User
                    var user = new NguoiDung
                    {
                        TenDangNhap = req.TenDangNhap,
                        MatKhauHash = PasswordHasher.HashPassword(req.MatKhau), // Mã hóa mật khẩu
                        Email = req.Email,
                        HoTen = req.HoTen,
                        SoDienThoai = req.SoDienThoai ?? "",
                        VaiTro = "BenhNhan", // Mặc định là bệnh nhân
                        TrangThai = true,    // Mặc định kích hoạt
                        NgayTao = DateTime.Now
                    };
                    _context.NguoiDungs.Add(user);
                    await _context.SaveChangesAsync(); // Lưu để lấy MaNguoiDung (ID)

                    // Bước B: Tạo Chi tiết bệnh nhân
                    // LƯU Ý: Chuyển DateTime? (C#) sang DateOnly? (SQL Server .NET 8)
                    DateOnly? ngaySinhDateOnly = null;
                    if (req.NgaySinh.HasValue)
                    {
                        ngaySinhDateOnly = DateOnly.FromDateTime(req.NgaySinh.Value);
                    }

                    var detail = new ChiTietBenhNhan
                    {
                        MaBenhNhan = user.MaNguoiDung, // Link với ID vừa tạo ở trên
                        NgaySinh = ngaySinhDateOnly,
                        GioiTinh = req.GioiTinh ?? "Nam",
                        DiaChi = req.DiaChi ?? "",
                        TienSuBenh = "" // Mặc định rỗng
                    };
                    _context.ChiTietBenhNhans.Add(detail);
                    await _context.SaveChangesAsync();

                    // Bước C: Commit Transaction (Xác nhận thành công)
                    await transaction.CommitAsync();

                    return Ok(new { Message = "Đăng ký thành công!", UserId = user.MaNguoiDung });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync(); // Hoàn tác nếu có lỗi
                    return StatusCode(500, $"Lỗi khi lưu dữ liệu: {ex.Message}. Inner: {ex.InnerException?.Message}");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // ====================================================
        // 2. ĐĂNG NHẬP (Tạo JWT Token)
        // ====================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // 1. Tìm user trong DB
            var user = await _context.NguoiDungs
                .FirstOrDefaultAsync(u => u.TenDangNhap == model.Username);

            // 2. Kiểm tra password
            if (user == null || !PasswordHasher.VerifyPassword(model.Password, user.MatKhauHash))
            {
                return Unauthorized("Sai tài khoản hoặc mật khẩu.");
            }

            // 3. Kiểm tra trạng thái tài khoản
            if (user.TrangThai == false) return BadRequest("Tài khoản đã bị khóa.");

            // 4. Tạo JWT Token
            var tokenString = GenerateJwtToken(user);

            return Ok(new { Token = tokenString, Role = user.VaiTro });
        }

        // Hàm phụ trợ tạo Token
        private string GenerateJwtToken(NguoiDung user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Các thông tin (Claims) lưu trong Token
            var claims = new[]
            {
                new Claim("UserID", user.MaNguoiDung.ToString()),
                new Claim(ClaimTypes.Role, user.VaiTro), // Admin, BacSi, BenhNhan
                new Claim("HoTen", user.HoTen),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2), // Token hết hạn sau 2 tiếng
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // ====================================================
    // 3. CÁC CLASS DTO (Data Transfer Object)
    // ====================================================

    // DTO cho đăng ký
    public class RegisterDto
    {
        public string TenDangNhap { get; set; }
        public string MatKhau { get; set; }
        public string Email { get; set; }
        public string HoTen { get; set; }
        public string SoDienThoai { get; set; }
        public DateTime? NgaySinh { get; set; } // Giữ DateTime để Client dễ gửi JSON
        public string GioiTinh { get; set; }
        public string DiaChi { get; set; }
    }

    // DTO cho đăng nhập
    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}