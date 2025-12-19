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
        private readonly WebSucKhoeDbContext _context;
        private readonly GeminiService _geminiService;

        public ChatController(WebSucKhoeDbContext context, GeminiService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            try
            {
                // 1. Kiểm tra/Tạo phiên chat
                var phienChat = await _context.PhienChats.FindAsync(request.MaPhienChat);
                if (phienChat == null)
                {
                    phienChat = new PhienChat
                    {
                        MaNguoiDung = request.MaNguoiDung,
                        TieuDe = "Tư vấn " + DateTime.Now.ToString("dd/MM HH:mm"),
                        ThoiGianTao = DateTime.Now
                    };
                    _context.PhienChats.Add(phienChat);
                    await _context.SaveChangesAsync();
                }

                // 2. Lưu tin nhắn mới của User vào DB
                var userMsg = new TinNhan
                {
                    MaPhienChat = phienChat.MaPhienChat,
                    VaiTro = "user",
                    NoiDung = request.NoiDung,
                    ThoiGianGui = DateTime.Now
                };
                _context.TinNhans.Add(userMsg);
                await _context.SaveChangesAsync();

                // =================================================================================
                // YÊU CẦU 1: NHỚ NGỮ CẢNH (Lấy 10 tin nhắn gần nhất làm lịch sử)
                // =================================================================================
                var historyContext = await _context.TinNhans
                    .Where(x => x.MaPhienChat == phienChat.MaPhienChat && x.MaTinNhan != userMsg.MaTinNhan)
                    .OrderByDescending(x => x.ThoiGianGui) // Lấy những tin mới nhất trước
                    .Take(10) // Chỉ lấy 10 tin gần nhất để tiết kiệm Token và trí nhớ AI
                    .OrderBy(x => x.ThoiGianGui) // Đảo ngược lại theo thứ tự thời gian (Cũ -> Mới) để AI hiểu mạch truyện
                    .Select(x => new { x.VaiTro, x.NoiDung })
                    .ToListAsync<dynamic>();

                // 3. Gọi Gemini Service (Kèm theo lịch sử vừa lấy)
                string aiResponseText = await _geminiService.GetAnswerAsync(request.NoiDung, historyContext);

                // 4. Lưu câu trả lời của AI vào DB
                var aiMsg = new TinNhan
                {
                    MaPhienChat = phienChat.MaPhienChat,
                    VaiTro = "model",
                    NoiDung = aiResponseText,
                    ThoiGianGui = DateTime.Now
                };
                _context.TinNhans.Add(aiMsg);
                await _context.SaveChangesAsync();

                // =================================================================================
                // YÊU CẦU 2: DỌN DẸP DB (Xóa tin nhắn cũ để tránh tràn dữ liệu)
                // =================================================================================
                // Kiểm tra nếu số lượng tin nhắn trong phiên > 20 thì xóa bớt các tin cũ nhất
                // (Chỉ giữ lại 20 tin gần nhất để hiển thị và làm ngữ cảnh)
                int messageLimit = 20;
                int currentCount = await _context.TinNhans.CountAsync(x => x.MaPhienChat == phienChat.MaPhienChat);

                if (currentCount > messageLimit)
                {
                    var messagesToDelete = await _context.TinNhans
                        .Where(x => x.MaPhienChat == phienChat.MaPhienChat)
                        .OrderBy(x => x.ThoiGianGui) // Lấy các tin cũ nhất
                        .Take(currentCount - messageLimit) // Số lượng cần xóa
                        .ToListAsync();

                    if (messagesToDelete.Any())
                    {
                        _context.TinNhans.RemoveRange(messagesToDelete);
                        await _context.SaveChangesAsync();
                    }
                }

                // 5. Trả kết quả về cho Frontend
                return Ok(new
                {
                    MaPhienChat = phienChat.MaPhienChat,
                    UserMessage = request.NoiDung,
                    BotReply = aiResponseText
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Chat Controller Error: {ex.Message}");
                return StatusCode(500, "Lỗi máy chủ: " + ex.Message);
            }
        }

        public class ChatRequest
        {
            public int MaNguoiDung { get; set; }
            public int? MaPhienChat { get; set; }
            public string NoiDung { get; set; }
        }
    }
}