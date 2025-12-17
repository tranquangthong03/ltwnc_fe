using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WebSucKhoe.API.Models;
using WebSucKhoe.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ====================================================
// 1. ĐĂNG KÝ DỊCH VỤ (SERVICES REGISTRATION)
// ====================================================

// Thêm Controllers và Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "WebSucKhoe API", Version = "v1" });

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


// Đăng ký HttpClient (Cần thiết cho GeminiService gọi API Google)
builder.Services.AddHttpClient();

// Đăng ký DB Context (Kết nối SQL Server)
builder.Services.AddDbContext<WebSucKhoeDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("WebSucKhoeDB")));

// Đăng ký Gemini Service (Dependency Injection)
builder.Services.AddScoped<GeminiService>();

// Đăng ký CORS (Để Frontend React/Mobile gọi được API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Đăng ký JWT Authentication (BẮT BUỘC PHẢI Ở ĐÂY - TRƯỚC builder.Build)
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
    });

// ====================================================
// 2. XÂY DỰNG ỨNG DỤNG (BUILD APP)
// ====================================================
// Chỉ được gọi lệnh này MỘT LẦN DUY NHẤT sau khi đã Add hết Services
var app = builder.Build();

// ====================================================
// 3. CẤU HÌNH PIPELINE (MIDDLEWARE)
// ====================================================

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Kích hoạt CORS
app.UseCors("AllowAll");

// Kích hoạt Authentication & Authorization
// Thứ tự cực kỳ quan trọng: UseAuthentication phải TRƯỚC UseAuthorization
app.UseAuthentication();
app.UseAuthorization();

// Định tuyến đến các Controllers
app.MapControllers();

// Chạy ứng dụng
app.Run();