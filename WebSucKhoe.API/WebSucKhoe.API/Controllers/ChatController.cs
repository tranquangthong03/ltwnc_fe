using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;
using WebSucKhoe.API.Services;

namespace WebSucKhoe.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly WebSucKhoeDbContext _context; // Context tự sinh ra ở Bước 2
        private readonly GeminiService _geminiService;

        public ChatController(WebSucKhoeDbContext context, GeminiService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        // API: Gửi tin nhắn và nhận phản hồi
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            // 1. Kiểm tra phiên chat (nếu chưa có thì tạo mới)
            var phienChat = await _context.PhienChats.FindAsync(request.MaPhienChat);
            if (phienChat == null)
            {
                phienChat = new PhienChat
                {
                    MaNguoiDung = request.MaNguoiDung,
                    TieuDe = "Tư vấn sức khỏe " + DateTime.Now.ToString("dd/MM"),
                    ThoiGianTao = DateTime.Now
                };
                _context.PhienChats.Add(phienChat);
                await _context.SaveChangesAsync();
            }

            // 2. Lưu tin nhắn của User vào DB
            var userMsg = new TinNhan
            {
                MaPhienChat = phienChat.MaPhienChat,
                VaiTro = "user",
                NoiDung = request.NoiDung,
                ThoiGianGui = DateTime.Now
            };
            _context.TinNhans.Add(userMsg);
            await _context.SaveChangesAsync();

            // 3. Lấy lịch sử chat cũ để gửi kèm cho Gemini (lấy 10 tin gần nhất để tiết kiệm token)
            var history = await _context.TinNhans
                .Where(x => x.MaPhienChat == phienChat.MaPhienChat && x.MaTinNhan != userMsg.MaTinNhan)
                .OrderBy(x => x.ThoiGianGui)
                .Select(x => new { x.VaiTro, x.NoiDung })
                .ToListAsync<dynamic>();

            // 4. Gọi Gemini AI
            string aiResponseText = await _geminiService.GetAnswerAsync(request.NoiDung, history);

            // 5. Lưu câu trả lời của AI vào DB
            var aiMsg = new TinNhan
            {
                MaPhienChat = phienChat.MaPhienChat,
                VaiTro = "model", // Khớp với bảng SQL và Gemini format
                NoiDung = aiResponseText,
                ThoiGianGui = DateTime.Now
            };
            _context.TinNhans.Add(aiMsg);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                MaPhienChat = phienChat.MaPhienChat,
                UserMessage = request.NoiDung,
                BotReply = aiResponseText
            });
        }

        // DTO để nhận dữ liệu từ Client
        public class ChatRequest
        {
            public int MaNguoiDung { get; set; }
            public int? MaPhienChat { get; set; } // Null nếu là cuộc trò chuyện mới
            public string NoiDung { get; set; }
        }
    }
}