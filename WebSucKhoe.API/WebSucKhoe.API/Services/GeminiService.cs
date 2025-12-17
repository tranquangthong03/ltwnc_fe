using Newtonsoft.Json;
using System.Text;

namespace WebSucKhoe.API.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        public GeminiService(IConfiguration configuration, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"]; // Lấy key từ appsettings.json
        }

        public async Task<string> GetAnswerAsync(string userMessage, List<dynamic> history)
        {
            // 1. Chuẩn bị dữ liệu gửi đi (theo format của Gemini API)
            var contents = new List<object>();

            // Thêm lịch sử chat cũ (để AI nhớ ngữ cảnh)
            foreach (var msg in history)
            {
                contents.Add(new
                {
                    role = msg.VaiTro == "user" ? "user" : "model",
                    parts = new[] { new { text = msg.NoiDung } }
                });
            }

            // Thêm tin nhắn mới nhất của user
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = userMessage } }
            });

            var payload = new
            {
                contents = contents,
                generationConfig = new
                {
                    temperature = 0.7, // Độ sáng tạo
                    maxOutputTokens = 800
                }
            };

            // 2. Gửi Request
            var jsonPayload = JsonConvert.SerializeObject(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_apiUrl}?key={_apiKey}", content);
            response.EnsureSuccessStatusCode();

            // 3. Xử lý kết quả trả về
            var responseString = await response.Content.ReadAsStringAsync();
            dynamic jsonResponse = JsonConvert.DeserializeObject(responseString);

            string aiText = jsonResponse?.candidates[0]?.content?.parts[0]?.text;
            return aiText ?? "Xin lỗi, tôi đang gặp sự cố kết nối.";
        }
    }
}