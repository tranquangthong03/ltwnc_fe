using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class PhienChat
{
    public int MaPhienChat { get; set; }

    public int MaNguoiDung { get; set; }

    public string? TieuDe { get; set; }

    public DateTime? ThoiGianTao { get; set; }

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;

    public virtual ICollection<TinNhan> TinNhans { get; set; } = new List<TinNhan>();
}
