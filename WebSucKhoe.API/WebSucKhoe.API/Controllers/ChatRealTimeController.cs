using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatRealTimeController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context;
        private readonly ILogger<ChatRealTimeController> _logger;

        public ChatRealTimeController(WebSucKhoeDbContext context, ILogger<ChatRealTimeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/ChatRealTime/conversations/{userId}
        // Lấy danh sách cuộc trò chuyện của user (bệnh nhân hoặc bác sĩ)
        [HttpGet("conversations/{userId}")]
        public async Task<IActionResult> GetConversations(int userId)
        {
            try
            {
                var conversations = await _context.CuocTroChuyen
                    .Where(c => c.MaBenhNhan == userId || c.MaBacSi == userId)
                    .Include(c => c.BenhNhan)
                    .Include(c => c.BacSi)
                    .Include(c => c.TinNhanChats)
                    .OrderByDescending(c => c.NgayCapNhatCuoi)
                    .Select(c => new
                    {
                        c.MaCuocTroChuyen,
                        c.MaBenhNhan,
                        c.MaBacSi,
                        benhNhan = new
                        {
                            c.BenhNhan!.MaNguoiDung,
                            c.BenhNhan.HoTen,
                            c.BenhNhan.Email
                        },
                        bacSi = new
                        {
                            c.BacSi!.MaNguoiDung,
                            c.BacSi.HoTen,
                            c.BacSi.Email
                        },
                        tinNhanCuoi = c.TinNhanChats
                            .OrderByDescending(t => t.ThoiGianGui)
                            .Select(t => new
                            {
                                t.NoiDung,
                                t.ThoiGianGui
                            })
                            .FirstOrDefault(),
                        soTinNhanChuaDoc = c.TinNhanChats.Count(t => t.DaXem == false && t.MaNguoiGui != userId),
                        c.NgayCapNhatCuoi
                    })
                    .ToListAsync();

                return Ok(conversations);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error loading conversations: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi tải danh sách cuộc trò chuyện" });
            }
        }

        // GET: api/ChatRealTime/messages/{conversationId}
        // Lấy tất cả tin nhắn của 1 cuộc trò chuyện
        [HttpGet("messages/{conversationId}")]
        public async Task<IActionResult> GetMessages(int conversationId)
        {
            try
            {
                var messages = await _context.TinNhanChat
                    .Where(t => t.MaCuocTroChuyen == conversationId)
                    .OrderBy(t => t.ThoiGianGui)
                    .Select(t => new
                    {
                        t.MaTinNhan,
                        t.MaNguoiGui,
                        t.NoiDung,
                        t.ThoiGianGui,
                        t.DaXem
                    })
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error loading messages: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi tải tin nhắn" });
            }
        }

        // PUT: api/ChatRealTime/mark-read/{conversationId}/{userId}
        // Đánh dấu tin nhắn đã đọc
        [HttpPut("mark-read/{conversationId}/{userId}")]
        public async Task<IActionResult> MarkAsRead(int conversationId, int userId)
        {
            try
            {
                var messages = await _context.TinNhanChat
                    .Where(t => t.MaCuocTroChuyen == conversationId && t.MaNguoiGui != userId && (t.DaXem == false || t.DaXem == null))
                    .ToListAsync();

                if (messages.Any())
                {
                    messages.ForEach(m => m.DaXem = true);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Đã đánh dấu đọc", count = messages.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error marking as read: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi cập nhật trạng thái" });
            }
        }

        // GET: api/ChatRealTime/conversation/{userId1}/{userId2}
        // Tạo hoặc lấy cuộc trò chuyện giữa 2 người
        [HttpGet("conversation/{userId1}/{userId2}")]
        public async Task<IActionResult> GetOrCreateConversation(int userId1, int userId2)
        {
            try
            {
                var conversation = await _context.CuocTroChuyen
                    .FirstOrDefaultAsync(c =>
                        (c.MaBenhNhan == userId1 && c.MaBacSi == userId2) ||
                        (c.MaBenhNhan == userId2 && c.MaBacSi == userId1)
                    );

                if (conversation == null)
                {
                    // Xác định vai trò
                    var user1 = await _context.NguoiDungs.FindAsync(userId1);
                    var user2 = await _context.NguoiDungs.FindAsync(userId2);

                    if (user1 == null || user2 == null)
                    {
                        return NotFound(new { message = "Không tìm thấy người dùng" });
                    }

                    int maBenhNhan = user1.VaiTro == "BenhNhan" ? userId1 : userId2;
                    int maBacSi = user1.VaiTro == "BacSi" ? userId1 : userId2;

                    conversation = new CuocTroChuyen
                    {
                        MaBenhNhan = maBenhNhan,
                        MaBacSi = maBacSi,
                        NgayTao = DateTime.Now,
                        NgayCapNhatCuoi = DateTime.Now
                    };

                    _context.CuocTroChuyen.Add(conversation);
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    conversation.MaCuocTroChuyen,
                    conversation.MaBenhNhan,
                    conversation.MaBacSi
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating conversation: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi tạo cuộc trò chuyện" });
            }
        }
    }
}
