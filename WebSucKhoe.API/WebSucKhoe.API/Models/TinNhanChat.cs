using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebSucKhoe.API.Models
{
    [Table("TinNhanChat")]
    public class TinNhanChat
    {
        [Key]
        public int MaTinNhan { get; set; }

        public int MaCuocTroChuyen { get; set; }

        public int MaNguoiGui { get; set; } // ID người gửi (có thể là BS hoặc BN)

        public string NoiDung { get; set; }

        public DateTime? ThoiGianGui { get; set; } = DateTime.Now;

        public bool? DaXem { get; set; } = false;

        // Relationship
        [ForeignKey("MaCuocTroChuyen")]
        public virtual CuocTroChuyen CuocTroChuyen { get; set; }

        [ForeignKey("MaNguoiGui")]
        public virtual NguoiDung NguoiGui { get; set; }
    }
}