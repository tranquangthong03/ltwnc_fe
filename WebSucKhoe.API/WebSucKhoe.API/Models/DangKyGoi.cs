using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class DangKyGoi
{
    public int MaDangKy { get; set; }

    public int MaBenhNhan { get; set; }

    public int MaGoi { get; set; }

    public DateTime? NgayBatDau { get; set; }

    public DateTime? NgayKetThuc { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();

    public virtual NguoiDung MaBenhNhanNavigation { get; set; } = null!;

    public virtual GoiKham MaGoiNavigation { get; set; } = null!;
}
