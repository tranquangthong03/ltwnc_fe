using System.Security.Cryptography;
using System.Text;

namespace WebSucKhoe.API.Helpers
{
    public static class PasswordHasher
    {
        // Hàm mã hóa mật khẩu (SHA256 đơn giản)
        public static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                var builder = new StringBuilder();
                foreach (var b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }
                return builder.ToString();
            }
        }

        // Hàm kiểm tra mật khẩu
        public static bool VerifyPassword(string inputPassword, string storedHash)
        {
            var hashOfInput = HashPassword(inputPassword);
            return StringComparer.OrdinalIgnoreCase.Compare(hashOfInput, storedHash) == 0;
        }
    }
}