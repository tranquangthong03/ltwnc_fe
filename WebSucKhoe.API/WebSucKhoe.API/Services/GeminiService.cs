using Newtonsoft.Json;
using System.Text;

namespace WebSucKhoe.API.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        public GeminiService(IConfiguration configuration, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"]; // Đảm bảo key này có trong appsettings.json
        }

        public async Task<string> GetAnswerAsync(string userMessage, List<dynamic> history)
        {
            // 1. Kiểm tra API Key
            if (string.IsNullOrEmpty(_apiKey))
            {
                return "Lỗi hệ thống: Chưa cấu hình Gemini API Key.";
            }

            try
            {
                // 2. Chuẩn bị dữ liệu
                var contents = new List<object>();

                // Map lịch sử chat
                foreach (var msg in history)
                {
                    contents.Add(new
                    {
                        role = msg.VaiTro == "user" ? "user" : "model",
                        parts = new[] { new { text = msg.NoiDung } }
                    });
                }

                // Thêm tin nhắn hiện tại
                contents.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = userMessage } }
                });

                // ĐỊNH NGHĨA VAI TRÒ (SYSTEM PROMPT) Ở ĐÂY
                var systemPrompt = @"
    Bạn là một chuyên gia tư vấn sức khỏe ảo của hệ thống bệnh viện Healthes System. 
    Nhiệm vụ của bạn là:
    1. Tư vấn sơ bộ về các triệu chứng bệnh lý thông thường.
    2. Đưa ra lời khuyên về dinh dưỡng, lối sống lành mạnh.
    3. Hướng dẫn người dùng đặt lịch khám nếu thấy triệu chứng nghiêm trọng.
    4. Luôn trả lời với giọng điệu ân cần, chuyên nghiệp và ngắn gọn.
    5. Lưu ý quan trọng: Luôn kèm theo câu khuyến cáo 'Thông tin chỉ mang tính tham khảo, vui lòng đến gặp bác sĩ để được chẩn đoán chính xác' ở cuối câu trả lời nếu liên quan đến bệnh lý.
";

                var payload = new
                {
                    // Thêm phần này để định hình tính cách cho AI
                    systemInstruction = new
                    {
                        parts = new[]
                        {
            new { text = systemPrompt }
        }
                    },
                    contents = contents,
                    generationConfig = new
                    {
                        temperature = 0.7,
                        maxOutputTokens = 800
                    }
                };

                var jsonPayload = JsonConvert.SerializeObject(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // 3. Gọi API
                var response = await _httpClient.PostAsync($"{_apiUrl}?key={_apiKey}", content);

                // Nếu lỗi từ phía Google (400, 401, 429...), trả về thông báo thay vì ném Exception
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Gemini API Error: {errorBody}"); // Log ra console server để debug
                    return "Xin lỗi, hệ thống AI đang quá tải hoặc gặp sự cố. Vui lòng thử lại sau.";
                }

                // 4. Đọc kết quả
                var responseString = await response.Content.ReadAsStringAsync();
                dynamic jsonResponse = JsonConvert.DeserializeObject(responseString);

                string aiText = jsonResponse?.candidates?[0]?.content?.parts?[0]?.text;
                return aiText ?? "AI không trả về kết quả nào.";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini Service Exception: {ex.Message}");
                return "Đã xảy ra lỗi khi kết nối với trí tuệ nhân tạo.";
            }
        }
    }
}