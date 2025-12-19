using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class LichHen
{
    public int MaLichHen { get; set; }

    public int MaBenhNhan { get; set; }

    public int MaBacSi { get; set; }

    public DateTime NgayGioHen { get; set; }

    public string? LyDoKham { get; set; }

    public string? TrangThai { get; set; }

    public DateTime? NgayTao { get; set; }

    // --- QUAN TRỌNG: Đã XÓA dòng liên kết HoSoYte ở đây ---

    public virtual ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();

    public virtual NguoiDung MaBacSiNavigation { get; set; } = null!;

    public virtual NguoiDung MaBenhNhanNavigation { get; set; } = null!;
}