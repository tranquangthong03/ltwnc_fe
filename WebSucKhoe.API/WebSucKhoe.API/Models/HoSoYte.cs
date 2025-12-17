using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class HoSoYte
{
    public int MaHoSo { get; set; }

    public int MaLichHen { get; set; }

    public string ChanDoan { get; set; } = null!;

    public string? DonThuoc { get; set; }

    public string? LoiDanBacSi { get; set; }

    public DateOnly? NgayTaiKham { get; set; }

    public virtual LichHen MaLichHenNavigation { get; set; } = null!;
}
