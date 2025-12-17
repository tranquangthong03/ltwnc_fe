using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class NguoiDung
{
    public int MaNguoiDung { get; set; }

    public string TenDangNhap { get; set; } = null!;

    public string MatKhauHash { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string HoTen { get; set; } = null!;

    public string? SoDienThoai { get; set; }

    public string? AnhDaiDien { get; set; }

    public string VaiTro { get; set; } = null!;

    public DateTime? NgayTao { get; set; }

    public bool? TrangThai { get; set; }

    public virtual ChiTietBacSi? ChiTietBacSi { get; set; }

    public virtual ChiTietBenhNhan? ChiTietBenhNhan { get; set; }

    public virtual ICollection<DangKyGoi> DangKyGois { get; set; } = new List<DangKyGoi>();

    public virtual ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();

    public virtual ICollection<LichHen> LichHenMaBacSiNavigations { get; set; } = new List<LichHen>();

    public virtual ICollection<LichHen> LichHenMaBenhNhanNavigations { get; set; } = new List<LichHen>();

    public virtual ICollection<PhienChat> PhienChats { get; set; } = new List<PhienChat>();
}
