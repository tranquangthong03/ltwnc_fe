using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class HoaDon
{
    public int MaHoaDon { get; set; }

    public int MaBenhNhan { get; set; }

    public int? MaLichHen { get; set; }

    public int? MaDangKy { get; set; }

    public decimal TongTien { get; set; }

    public string? PhuongThucThanhToan { get; set; }

    public string? TrangThaiThanhToan { get; set; }

    public string? MaGiaoDich { get; set; }

    public DateTime? NgayTao { get; set; }

    public virtual NguoiDung MaBenhNhanNavigation { get; set; } = null!;

    public virtual DangKyGoi? MaDangKyNavigation { get; set; }

    public virtual LichHen? MaLichHenNavigation { get; set; }
}
