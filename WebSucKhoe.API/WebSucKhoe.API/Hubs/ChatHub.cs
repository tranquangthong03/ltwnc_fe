using Microsoft.AspNetCore.SignalR;
using WebSucKhoe.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace WebSucKhoe.API.Hubs
{
    public class ChatHub : Hub
    {
        private readonly WebSucKhoeDbContext _context;

        public ChatHub(WebSucKhoeDbContext context)
        {
            _context = context;
        }

        // ======================================================================
        // HÀM 1: GỬI TIN NHẮN (Client gọi hàm này)
        // ======================================================================
        public async Task SendMessage(string userRole, int userId, int receiverId, string message)
        {
            try
            {
                // 1. Xác định ID của Bệnh nhân và Bác sĩ dựa trên vai trò người gửi
                int benhNhanId = (userRole == "BenhNhan") ? userId : receiverId;
                int bacSiId = (userRole == "BenhNhan") ? receiverId : userId;

                // 2. Tìm phiên chat trong Database
                // Lưu ý: Đảm bảo bạn đã chạy lệnh SQL thêm cột MaBacSi vào bảng PhienChat
                var phienChat = await _context.PhienChats
                    .FirstOrDefaultAsync(p => p.MaNguoiDung == benhNhanId && p.MaBacSi == bacSiId);

                // 3. Nếu chưa có phiên chat thì tạo mới
                if (phienChat == null)
                {
                    phienChat = new PhienChat
                    {
                        MaNguoiDung = benhNhanId,
                        MaBacSi = bacSiId,
                        TieuDe = "Tư vấn trực tuyến",
                        ThoiGianTao = DateTime.Now
                    };
                    _context.PhienChats.Add(phienChat);
                    await _context.SaveChangesAsync();
                }

                // 4. Lưu tin nhắn vào Database
                var tinNhan = new TinNhan
                {
                    MaPhienChat = phienChat.MaPhienChat,
                    VaiTro = userRole, // "BenhNhan" hoặc "BacSi"
                    NoiDung = message,
                    ThoiGianGui = DateTime.Now
                };
                _context.TinNhans.Add(tinNhan);
                await _context.SaveChangesAsync();

                // 5. Gửi tin nhắn Realtime qua SignalR
                // Gửi cho người nhận (dựa vào Group ID là receiverId)
                await Clients.Group(receiverId.ToString()).SendAsync("ReceiveMessage", userRole, message, DateTime.Now);

                // Gửi lại cho người gửi (để hiển thị ngay lập tức và xác nhận đã gửi thành công)
                await Clients.Caller.SendAsync("ReceiveMessage", userRole, message, DateTime.Now);
            }
            catch (Exception ex)
            {
                // Log lỗi ra Console của Server để dễ debug
                Console.WriteLine($"[ChatHub Error] SendMessage failed: {ex.Message}");
                // Ném lỗi về phía Client để Frontend bắt được (catch error)
                throw new HubException("Lỗi gửi tin nhắn: " + ex.Message);
            }
        }

        // ======================================================================
        // HÀM 2: THAM GIA PHÒNG CHAT (Client gọi khi vừa vào trang chat)
        // ======================================================================
        public async Task JoinChat(string userId)
        {
            if (string.IsNullOrEmpty(userId)) return;

            try
            {
                // Đăng ký Connection ID hiện tại vào một Group có tên là UserID
                // Điều này giúp ta gửi tin nhắn cho user đó thông qua Clients.Group(userId)
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);

                // (Tùy chọn) Thông báo đã kết nối thành công
                // Console.WriteLine($"User {userId} joined chat.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChatHub Error] JoinChat failed: {ex.Message}");
            }
        }

        // ======================================================================
        // HÀM 3: NGẮT KẾT NỐI (Tự động gọi khi user đóng tab/mất mạng)
        // ======================================================================
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Xử lý logic khi user thoát nếu cần (ví dụ update trạng thái Offline)
            await base.OnDisconnectedAsync(exception);
        }
    }
}