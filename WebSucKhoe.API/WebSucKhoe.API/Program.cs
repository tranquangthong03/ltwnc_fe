using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WebSucKhoe.API.Models;
using WebSucKhoe.API.Services;
using WebSucKhoe.API.Hubs; // Namespace chứa ChatHub

var builder = WebApplication.CreateBuilder(args);

// ====================================================
// 1. ĐĂNG KÝ DỊCH VỤ (SERVICES REGISTRATION)
// ====================================================

// Thêm Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 1.1 Đăng ký SignalR Service (Bật chi tiết lỗi để dễ debug)
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

// Cấu hình Swagger (để test API)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "WebSucKhoe API", Version = "v1" });

    // Cấu hình JWT cho Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập JWT token theo dạng: Bearer {token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Đăng ký HttpClient (cho GeminiService)
builder.Services.AddHttpClient();

// Đăng ký DB Context
builder.Services.AddDbContext<WebSucKhoeDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("WebSucKhoeDB")));

// Đăng ký Gemini Service
builder.Services.AddScoped<GeminiService>();

// 1.2 Đăng ký CORS (QUAN TRỌNG CHO REACT & SIGNALR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b
        .WithOrigins("http://localhost:3000") // Chỉ cho phép React Frontend gọi
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()); // Bắt buộc phải có để SignalR hoạt động
});

// Đăng ký JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };

        // Cấu hình để lấy Token từ Query String (cho SignalR)
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// ====================================================
// 2. XÂY DỰNG ỨNG DỤNG
// ====================================================
var app = builder.Build();

// ====================================================
// 3. CẤU HÌNH PIPELINE (MIDDLEWARE)
// ====================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- QUAN TRỌNG: Tắt chuyển hướng HTTPS để tránh lỗi SSL ở Localhost ---
// app.UseHttpsRedirection(); 
// ----------------------------------------------------------------------

// Kích hoạt CORS (Phải đặt trước Auth và Hub)
app.UseCors("AllowAll");

// Kích hoạt Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Định tuyến Controllers
app.MapControllers();

// 1.3 Định tuyến SignalR Hub
app.MapHub<ChatHub>("/chatHub");

// Chạy ứng dụng
app.Run();