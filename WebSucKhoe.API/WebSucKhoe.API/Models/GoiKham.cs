using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class GoiKham
{
    public int MaGoi { get; set; }

    public string TenGoi { get; set; } = null!;

    public string? MoTa { get; set; }

    public decimal GiaTien { get; set; }

    public int ThoiHanNgay { get; set; }

    public bool? DangHoatDong { get; set; }

    public virtual ICollection<DangKyGoi> DangKyGois { get; set; } = new List<DangKyGoi>();
}
