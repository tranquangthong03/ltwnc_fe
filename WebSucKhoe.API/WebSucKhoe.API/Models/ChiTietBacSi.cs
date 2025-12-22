using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class ChiTietBacSi
{
    public int MaBacSi { get; set; }

    public string ChuyenKhoa { get; set; } = null!;

    public string? SoChungChi { get; set; }

    public int? SoNamKinhNghiem { get; set; }

    public decimal? GiaKham { get; set; }

    public string? MoTa { get; set; }

    public string? AnhBacSi { get; set; } // Đường dẫn ảnh bác sĩ

    public virtual NguoiDung MaBacSiNavigation { get; set; } = null!;
}
