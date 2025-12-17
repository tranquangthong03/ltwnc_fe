using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class TinNhan
{
    public long MaTinNhan { get; set; }

    public int MaPhienChat { get; set; }

    public string? VaiTro { get; set; }

    public string NoiDung { get; set; } = null!;

    public DateTime? ThoiGianGui { get; set; }

    public virtual PhienChat MaPhienChatNavigation { get; set; } = null!;
}
