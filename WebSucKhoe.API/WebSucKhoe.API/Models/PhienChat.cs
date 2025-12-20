using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebSucKhoe.API.Models;

public partial class PhienChat
{
    public int MaPhienChat { get; set; }

    public int MaNguoiDung { get; set; }

    // Bắt buộc phải có dòng này
    public int? MaBacSi { get; set; }

    public string? TieuDe { get; set; }

    public DateTime? ThoiGianTao { get; set; }

    public virtual NguoiDung MaNguoiDungNavigation { get; set; } = null!;

    // Bắt buộc phải có dòng này
    public virtual NguoiDung? MaBacSiNavigation { get; set; }

    public virtual ICollection<TinNhan> TinNhans { get; set; } = new List<TinNhan>();
}