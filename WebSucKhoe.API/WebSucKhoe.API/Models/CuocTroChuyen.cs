using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebSucKhoe.API.Models
{
    [Table("CuocTroChuyen")]
    public class CuocTroChuyen
    {
        [Key]
        public int MaCuocTroChuyen { get; set; }

        public int MaBenhNhan { get; set; }

        public int MaBacSi { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;

        public DateTime? NgayCapNhatCuoi { get; set; } = DateTime.Now;

        // Relationship (Khóa ngoại)
        [ForeignKey("MaBenhNhan")]
        public virtual NguoiDung BenhNhan { get; set; }

        [ForeignKey("MaBacSi")]
        public virtual NguoiDung BacSi { get; set; }

        // Danh sách tin nhắn trong cuộc trò chuyện này
        public virtual ICollection<TinNhanChat> TinNhanChats { get; set; }
    }
}