using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ Admin
    public class AdminController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;

        public AdminController(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // 1. Quản lý Bác sĩ: Thêm mới
        [HttpPost("add-doctor")]
        public async Task<IActionResult> AddDoctor([FromBody] DoctorCreateDto req)
        {
            // Logic thêm User + ChiTietBacSi (Có thể tách ra transaction tương tự phần đăng ký)
            var user = new NguoiDung
            {
                TenDangNhap = req.TenDangNhap,
                MatKhauHash = req.MatKhau, // Nên hash password trước khi lưu
                Email = req.Email,
                HoTen = req.HoTen,
                VaiTro = "BacSi",
                TrangThai = true
            };
            _context.NguoiDungs.Add(user);
            await _context.SaveChangesAsync();

            var detail = new ChiTietBacSi
            {
                MaBacSi = user.MaNguoiDung,
                ChuyenKhoa = req.ChuyenKhoa,
                GiaKham = req.GiaKham
            };
            _context.ChiTietBacSis.Add(detail);
            await _context.SaveChangesAsync();

            return Ok("Đã tạo bác sĩ thành công");
        }

        // 2. Xác nhận thanh toán (Khi nhận được tiền chuyển khoản)
        [HttpPost("confirm-payment/{maHoaDon}")]
        public async Task<IActionResult> ConfirmPayment(int maHoaDon)
        {
            var hoaDon = await _context.HoaDons.FindAsync(maHoaDon);
            if (hoaDon == null) return NotFound();

            // Cập nhật hóa đơn
            hoaDon.TrangThaiThanhToan = "DaThanhToan";
            hoaDon.PhuongThucThanhToan = "ChuyenKhoan"; // Ví dụ

            // Kích hoạt gói đăng ký (nếu hóa đơn này là của việc mua gói)
            if (hoaDon.MaDangKy != null)
            {
                var dangKy = await _context.DangKyGois.FindAsync(hoaDon.MaDangKy);
                if (dangKy != null)
                {
                    dangKy.TrangThai = "DangDung"; // Kích hoạt gói
                }
            }

            await _context.SaveChangesAsync();
            return Ok("Đã xác nhận thanh toán và kích hoạt dịch vụ.");
        }
        // Thêm API endpoint này vào trong class AdminController
        [HttpGet("chat-monitor")]
        public async Task<IActionResult> GetAllChatSessions([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // Lấy danh sách các phiên chat, kèm tên người dùng
            var sessions = await _context.PhienChats
                .Include(p => p.MaNguoiDungNavigation) // Join bảng User
                .OrderByDescending(p => p.ThoiGianTao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.MaPhienChat,
                    TenBenhNhan = p.MaNguoiDungNavigation.HoTen,
                    p.TieuDe,
                    p.ThoiGianTao,
                    SoTinNhan = _context.TinNhans.Count(t => t.MaPhienChat == p.MaPhienChat) // Đếm số tin
                })
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpGet("chat-detail/{maPhienChat}")]
        public async Task<IActionResult> GetChatDetail(int maPhienChat)
        {
            // Lấy chi tiết nội dung hội thoại
            var details = await _context.TinNhans
                .Where(t => t.MaPhienChat == maPhienChat)
                .OrderBy(t => t.ThoiGianGui)
                .Select(t => new
                {
                    t.MaTinNhan,
                    Sender = t.VaiTro == "user" ? "Bệnh nhân" : "AI Chatbot", // Format lại cho dễ đọc
                    NoiDung = t.NoiDung,
                    ThoiGian = t.ThoiGianGui
                })
                .ToListAsync();

            if (!details.Any()) return NotFound("Phiên chat không tồn tại hoặc trống.");

            return Ok(details);
        }
        [HttpGet("doctors")]
        public async Task<IActionResult> GetDoctors()
        {
            Console.WriteLine("GetDoctors called");
            
            var list = await _context.ChiTietBacSis
                .Include(d => d.MaBacSiNavigation) // Join bảng NguoiDung
                .Select(d => new
                {
                    d.MaBacSi,
                    HoTen = d.MaBacSiNavigation.HoTen,
                    Email = d.MaBacSiNavigation.Email,
                    SoDienThoai = d.MaBacSiNavigation.SoDienThoai, // Thêm số điện thoại
                    TrangThai = d.MaBacSiNavigation.TrangThai, // Thêm trạng thái
                    d.ChuyenKhoa,
                    d.GiaKham,
                    d.SoChungChi,
                    d.SoNamKinhNghiem // Thêm số năm kinh nghiệm
                }).ToListAsync();
                
            Console.WriteLine($"Found {list.Count} doctors");
            foreach (var doctor in list)
            {
                Console.WriteLine($"Doctor: {doctor.HoTen}, Email: {doctor.Email}, Phone: {doctor.SoDienThoai}");
            }
            
            return Ok(list);
        }

        // 2. Xóa người dùng (Bác sĩ hoặc Bệnh nhân)
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.NguoiDungs.FindAsync(id);
            if (user == null) return NotFound();
            _context.NguoiDungs.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa thành công" });
        }

        // 2.1 Cập nhật trạng thái người dùng (Khóa/Mở khóa)
        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            Console.WriteLine($"UpdateUserStatus - Received ID: {id}, New Status: {request.trangThai}");

            var user = await _context.NguoiDungs.FindAsync(id);
            if (user == null)
            {
                Console.WriteLine($"User with ID {id} not found in NguoiDungs table");
                return NotFound($"Không tìm thấy người dùng với ID: {id}");
            }

            Console.WriteLine($"Found user: {user.HoTen}, Current Status: {user.TrangThai}");

            user.TrangThai = request.trangThai;
            await _context.SaveChangesAsync();

            Console.WriteLine($"Updated user status to: {user.TrangThai}");

            return Ok(new
            {
                message = $"Đã {(request.trangThai ? "mở khóa" : "khóa")} tài khoản thành công",
                trangThai = user.TrangThai,
                userId = user.MaNguoiDung,
                userName = user.HoTen
            });
        }

        // 3. Lấy danh sách Bệnh nhân
        [HttpGet("patients")]
        public async Task<IActionResult> GetPatients()
        {
            Console.WriteLine("GetPatients called");
            
            var list = await _context.ChiTietBenhNhans
                .Include(p => p.MaBenhNhanNavigation)
                .Select(p => new
                {
                    // ID để cập nhật trạng thái (MaNguoiDung)
                    MaBenhNhan = p.MaBenhNhanNavigation.MaNguoiDung,
                    // Thông tin từ bảng NguoiDung
                    HoTen = p.MaBenhNhanNavigation.HoTen,
                    Email = p.MaBenhNhanNavigation.Email,
                    SoDienThoai = p.MaBenhNhanNavigation.SoDienThoai,
                    TrangThai = p.MaBenhNhanNavigation.TrangThai,
                    VaiTro = p.MaBenhNhanNavigation.VaiTro,
                    // Thông tin từ bảng ChiTietBenhNhan
                    NgaySinh = p.NgaySinh,
                    GioiTinh = p.GioiTinh,
                    DiaChi = p.DiaChi,
                    TienSuBenh = p.TienSuBenh
                }).ToListAsync();
                
            Console.WriteLine($"Found {list.Count} patients");
            foreach (var patient in list)
            {
                Console.WriteLine($"Patient: {patient.HoTen}, Email: {patient.Email}, Status: {patient.TrangThai}");
            }
            
            return Ok(list);
        }

        // 4. Lấy danh sách Hóa đơn
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
    }

    // DTO
    public class DoctorCreateDto
    {
        public string TenDangNhap { get; set; }
        public string MatKhau { get; set; }
        public string Email { get; set; }
        public string HoTen { get; set; }
        public string ChuyenKhoa { get; set; }
        public decimal GiaKham { get; set; }
    }

    public class UpdateStatusRequest
    {
        public bool trangThai { get; set; }
    }

}