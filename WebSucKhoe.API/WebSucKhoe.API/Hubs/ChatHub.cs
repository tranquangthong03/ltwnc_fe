using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WebSucKhoe.API.Models;

namespace WebSucKhoe.API.Hubs
{
    public class ChatHub : Hub
    {
        private readonly WebSucKhoeDbContext _context;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(WebSucKhoeDbContext context, ILogger<ChatHub> logger)
        {
            _context = context;
            _logger = logger;
        }

        // User join với UserId (để nhận tin nhắn cá nhân)
        public async Task JoinChat(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            _logger.LogInformation($"User {userId} joined chat. ConnectionId: {Context.ConnectionId}");
        }

        // Gửi tin nhắn giữa 2 người (1-1 chat)
        public async Task SendMessage(int maNguoiGui, int maNguoiNhan, string noiDung)
        {
            try
            {
                // 1. Tìm hoặc tạo cuộc trò chuyện
                var cuocTroChuyen = await _context.CuocTroChuyen
                    .FirstOrDefaultAsync(c =>
                        (c.MaBenhNhan == maNguoiGui && c.MaBacSi == maNguoiNhan) ||
                        (c.MaBenhNhan == maNguoiNhan && c.MaBacSi == maNguoiGui)
                    );

                if (cuocTroChuyen == null)
                {
                    // Xác định ai là bác sĩ, ai là bệnh nhân
                    var nguoiGui = await _context.NguoiDungs.FindAsync(maNguoiGui);
                    var nguoiNhan = await _context.NguoiDungs.FindAsync(maNguoiNhan);

                    int maBenhNhan = nguoiGui?.VaiTro == "BenhNhan" ? maNguoiGui : maNguoiNhan;
                    int maBacSi = nguoiGui?.VaiTro == "BacSi" ? maNguoiGui : maNguoiNhan;

                    cuocTroChuyen = new CuocTroChuyen
                    {
                        MaBenhNhan = maBenhNhan,
                        MaBacSi = maBacSi,
                        NgayTao = DateTime.Now,
                        NgayCapNhatCuoi = DateTime.Now
                    };
                    _context.CuocTroChuyen.Add(cuocTroChuyen);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    cuocTroChuyen.NgayCapNhatCuoi = DateTime.Now;
                    _context.Update(cuocTroChuyen);
                }

                // 2. Lưu tin nhắn
                var tinNhan = new TinNhanChat
                {
                    MaCuocTroChuyen = cuocTroChuyen.MaCuocTroChuyen,
                    MaNguoiGui = maNguoiGui,
                    NoiDung = noiDung,
                    ThoiGianGui = DateTime.Now,
                    DaXem = false
                };
                _context.TinNhanChat.Add(tinNhan);
                await _context.SaveChangesAsync();

                // 3. Gửi tin nhắn real-time cho cả 2 người
                var messageData = new
                {
                    maTinNhan = tinNhan.MaTinNhan,
                    maNguoiGui = maNguoiGui,
                    maNguoiNhan = maNguoiNhan,
                    noiDung = noiDung,
                    thoiGianGui = tinNhan.ThoiGianGui,
                    maCuocTroChuyen = cuocTroChuyen.MaCuocTroChuyen
                };

                // Gửi cho người gửi (để đồng bộ nếu gửi từ nhiều tab)
                await Clients.Group($"User_{maNguoiGui}").SendAsync("ReceiveMessage", messageData);
                // Gửi cho người nhận
                await Clients.Group($"User_{maNguoiNhan}").SendAsync("ReceiveMessage", messageData);

                _logger.LogInformation($"Message sent: {maNguoiGui} -> {maNguoiNhan}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending message: {ex.Message}");
                throw;
            }
        }

        // Load lịch sử chat giữa 2 người
        public async Task<List<object>> LoadChatHistory(int userId1, int userId2)
        {
            var cuocTroChuyen = await _context.CuocTroChuyen
                .FirstOrDefaultAsync(c =>
                    (c.MaBenhNhan == userId1 && c.MaBacSi == userId2) ||
                    (c.MaBenhNhan == userId2 && c.MaBacSi == userId1)
                );

            if (cuocTroChuyen == null)
                return new List<object>();

            var messages = await _context.TinNhanChat
                .Where(t => t.MaCuocTroChuyen == cuocTroChuyen.MaCuocTroChuyen)
                .OrderBy(t => t.ThoiGianGui)
                .Select(t => new
                {
                    t.MaTinNhan,
                    t.MaNguoiGui,
                    t.NoiDung,
                    t.ThoiGianGui,
                    t.DaXem
                })
                .ToListAsync<object>();

            return messages;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"User disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}