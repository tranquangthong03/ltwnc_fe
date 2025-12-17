using System;
using System.Collections.Generic;

namespace WebSucKhoe.API.Models;

public partial class ChiTietBenhNhan
{
    public int MaBenhNhan { get; set; }

    public DateOnly? NgaySinh { get; set; }

    public string? GioiTinh { get; set; }

    public string? DiaChi { get; set; }

    public string? NhomMau { get; set; }

    public string? TienSuBenh { get; set; }

    public virtual NguoiDung MaBenhNhanNavigation { get; set; } = null!;
}
