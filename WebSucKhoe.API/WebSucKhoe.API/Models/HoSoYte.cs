using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebSucKhoe.API.Models
{
    [Table("HoSoYte")]
    public partial class HoSoYte
    {
        [Key]
        public int MaHoSo { get; set; }

        public int? MaBenhNhan { get; set; }

        // Thêm cột này để khớp với logic Controller
        public int? MaBacSi { get; set; }

        public string? ChuanDoan { get; set; }

        public string? TrieuChung { get; set; }

        public string? HuongDieuTri { get; set; }

        public string? DonThuoc { get; set; }

        public DateTime? NgayTao { get; set; }

        [ForeignKey("MaBenhNhan")]
        public virtual NguoiDung? MaBenhNhanNavigation { get; set; }

        [ForeignKey("MaBacSi")]
        public virtual NguoiDung? MaBacSiNavigation { get; set; }
    }
}