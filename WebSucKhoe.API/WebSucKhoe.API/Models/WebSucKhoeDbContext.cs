using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace WebSucKhoe.API.Models;

public partial class WebSucKhoeDbContext : DbContext
{
    private readonly IConfiguration _configuration;

    public WebSucKhoeDbContext()
    {
    }

    public WebSucKhoeDbContext(DbContextOptions<WebSucKhoeDbContext> options, IConfiguration configuration)
        : base(options)
    {
        _configuration = configuration;
    }

    public virtual DbSet<ChiTietBacSi> ChiTietBacSis { get; set; }
    public virtual DbSet<ChiTietBenhNhan> ChiTietBenhNhans { get; set; }
    public virtual DbSet<DangKyGoi> DangKyGois { get; set; }
    public virtual DbSet<GoiKham> GoiKhams { get; set; }
    public virtual DbSet<HoSoYte> HoSoYtes { get; set; }
    public virtual DbSet<HoaDon> HoaDons { get; set; }
    public virtual DbSet<LichHen> LichHens { get; set; }
    public virtual DbSet<NguoiDung> NguoiDungs { get; set; }
    public virtual DbSet<PhienChat> PhienChats { get; set; }
    public virtual DbSet<TinNhan> TinNhans { get; set; }
    public virtual DbSet<CuocTroChuyen> CuocTroChuyen { get; set; }
    public virtual DbSet<TinNhanChat> TinNhanChat { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var connectionString = _configuration?.GetConnectionString("DefaultConnection")
                                   ?? "Server=.\\SQLEXPRESS;Database=WebSucKhoeDB;Trusted_Connection=True;TrustServerCertificate=True;";
            optionsBuilder.UseSqlServer(connectionString);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChiTietBacSi>(entity =>
        {
            entity.HasKey(e => e.MaBacSi).HasName("PK__ChiTietB__E022715E60E31AA1");
            entity.ToTable("ChiTietBacSi");
            entity.HasIndex(e => e.SoChungChi, "UQ__ChiTietB__AC4DA2B58F8F9589").IsUnique();
            entity.Property(e => e.MaBacSi).ValueGeneratedNever();
            entity.Property(e => e.ChuyenKhoa).HasMaxLength(100);
            entity.Property(e => e.GiaKham).HasDefaultValue(0m).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SoChungChi).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.SoNamKinhNghiem).HasDefaultValue(0);
            entity.HasOne(d => d.MaBacSiNavigation).WithOne(p => p.ChiTietBacSi)
                .HasForeignKey<ChiTietBacSi>(d => d.MaBacSi)
                .HasConstraintName("FK_BacSi_User");
        });

        modelBuilder.Entity<ChiTietBenhNhan>(entity =>
        {
            entity.HasKey(e => e.MaBenhNhan).HasName("PK__ChiTietB__22A8B3303B9759A5");
            entity.ToTable("ChiTietBenhNhan");
            entity.Property(e => e.MaBenhNhan).ValueGeneratedNever();
            entity.Property(e => e.DiaChi).HasMaxLength(255);
            entity.Property(e => e.GioiTinh).HasMaxLength(10);
            entity.Property(e => e.NhomMau).HasMaxLength(5).IsUnicode(false);
            entity.HasOne(d => d.MaBenhNhanNavigation).WithOne(p => p.ChiTietBenhNhan)
                .HasForeignKey<ChiTietBenhNhan>(d => d.MaBenhNhan)
                .HasConstraintName("FK_BenhNhan_User");
        });

        modelBuilder.Entity<DangKyGoi>(entity =>
        {
            entity.HasKey(e => e.MaDangKy).HasName("PK__DangKyGo__BA90F02DEFB87A03");
            entity.ToTable("DangKyGoi");
            entity.Property(e => e.NgayBatDau).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.NgayKetThuc).HasColumnType("datetime");
            entity.Property(e => e.TrangThai).HasMaxLength(20).IsUnicode(false).HasDefaultValue("DangDung");
            entity.HasOne(d => d.MaBenhNhanNavigation).WithMany(p => p.DangKyGois)
                .HasForeignKey(d => d.MaBenhNhan).HasConstraintName("FK_DangKy_BenhNhan");
            entity.HasOne(d => d.MaGoiNavigation).WithMany(p => p.DangKyGois)
                .HasForeignKey(d => d.MaGoi).HasConstraintName("FK_DangKy_Goi");
        });

        modelBuilder.Entity<GoiKham>(entity =>
        {
            entity.HasKey(e => e.MaGoi).HasName("PK__GoiKham__3CD30F6949CEE707");
            entity.ToTable("GoiKham");
            entity.Property(e => e.DangHoatDong).HasDefaultValue(true);
            entity.Property(e => e.GiaTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TenGoi).HasMaxLength(150);
        });

        modelBuilder.Entity<HoSoYte>(entity =>
        {
            entity.HasKey(e => e.MaHoSo).HasName("PK__HoSoYTe__1666423C927FDB8B");
            entity.ToTable("HoSoYTe");

            // Mapping quan hệ với Bác sĩ
            entity.HasOne(d => d.MaBacSiNavigation).WithMany()
                  .HasForeignKey(d => d.MaBacSi)
                  .HasConstraintName("FK_HoSo_BacSi");

            entity.HasOne(d => d.MaBenhNhanNavigation).WithMany()
                  .HasForeignKey(d => d.MaBenhNhan)
                  .HasConstraintName("FK_HoSo_BenhNhan");
        });

        modelBuilder.Entity<HoaDon>(entity =>
        {
            entity.HasKey(e => e.MaHoaDon).HasName("PK__HoaDon__835ED13B63D35B0A");
            entity.ToTable("HoaDon");
            entity.Property(e => e.MaGiaoDich).HasMaxLength(100).IsUnicode(false);
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.PhuongThucThanhToan).HasMaxLength(50);
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThaiThanhToan).HasMaxLength(20).HasDefaultValue("ChuaThanhToan");
            entity.HasOne(d => d.MaBenhNhanNavigation).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.MaBenhNhan).OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK_HoaDon_BenhNhan");
            entity.HasOne(d => d.MaDangKyNavigation).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.MaDangKy).HasConstraintName("FK_HoaDon_DangKy");
            entity.HasOne(d => d.MaLichHenNavigation).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.MaLichHen).OnDelete(DeleteBehavior.Cascade).HasConstraintName("FK_HoaDon_LichHen");
        });

        modelBuilder.Entity<LichHen>(entity =>
        {
            entity.HasKey(e => e.MaLichHen).HasName("PK__LichHen__150F264FDE199CC8");
            entity.ToTable("LichHen");
            entity.Property(e => e.LyDoKham).HasMaxLength(255);
            entity.Property(e => e.NgayGioHen).HasColumnType("datetime");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("ChoDuyet");

            entity.HasOne(d => d.MaBacSiNavigation).WithMany(p => p.LichHenMaBacSiNavigations)
                .HasForeignKey(d => d.MaBacSi).HasConstraintName("FK_LichHen_BacSi");

            entity.HasOne(d => d.MaBenhNhanNavigation).WithMany(p => p.LichHenMaBenhNhanNavigations)
                .HasForeignKey(d => d.MaBenhNhan).OnDelete(DeleteBehavior.ClientSetNull).HasConstraintName("FK_LichHen_BenhNhan");
        });

        modelBuilder.Entity<NguoiDung>(entity =>
        {
            entity.HasKey(e => e.MaNguoiDung).HasName("PK__NguoiDun__C539D76225CF2A9B");
            entity.ToTable("NguoiDung");
            entity.HasIndex(e => e.TenDangNhap, "UQ__NguoiDun__55F68FC039C23DC5").IsUnique();
            entity.HasIndex(e => e.Email, "UQ__NguoiDun__A9D105341F70DE5A").IsUnique();
            entity.Property(e => e.AnhDaiDien).HasMaxLength(500);
            entity.Property(e => e.Email).HasMaxLength(100).IsUnicode(false);
            entity.Property(e => e.HoTen).HasMaxLength(100);
            entity.Property(e => e.MatKhauHash).HasMaxLength(256).IsUnicode(false);
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.SoDienThoai).HasMaxLength(20).IsUnicode(false);
            entity.Property(e => e.TenDangNhap).HasMaxLength(50).IsUnicode(false);
            entity.Property(e => e.TrangThai).HasDefaultValue(true);
            entity.Property(e => e.VaiTro).HasMaxLength(20).IsUnicode(false);
        });

        // --------------------------------------------------------
        // PHẦN SỬA CHỮA QUAN TRỌNG: GỘP CẤU HÌNH PHIENCHAT VÀO 1 CHỖ
        // --------------------------------------------------------
        modelBuilder.Entity<PhienChat>(entity =>
        {
            entity.HasKey(e => e.MaPhienChat).HasName("PK__PhienCha__A91ECE76DC34CCFC");
            entity.ToTable("PhienChat");

            entity.Property(e => e.ThoiGianTao)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.Property(e => e.TieuDe)
                .HasMaxLength(200)
                .HasDefaultValue("Cuộc hội thoại mới");

            // Khóa ngoại với Bệnh nhân
            entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.PhienChats)
                .HasForeignKey(d => d.MaNguoiDung)
                .HasConstraintName("FK_PhienChat_User");

            // Khóa ngoại với Bác sĩ (Bắt buộc phải có để tránh lỗi lưu DB)
            entity.HasOne(d => d.MaBacSiNavigation).WithMany()
                .HasForeignKey(d => d.MaBacSi)
                .HasConstraintName("FK_PhienChat_NguoiDung_BacSi");
        });

        modelBuilder.Entity<TinNhan>(entity =>
        {
            entity.HasKey(e => e.MaTinNhan).HasName("PK__TinNhan__E5B3062A84685DC6");
            entity.ToTable("TinNhan");
            entity.Property(e => e.ThoiGianGui).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.VaiTro).HasMaxLength(10).IsUnicode(false);
            entity.HasOne(d => d.MaPhienChatNavigation).WithMany(p => p.TinNhans)
                .HasForeignKey(d => d.MaPhienChat).HasConstraintName("FK_TinNhan_PhienChat");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}