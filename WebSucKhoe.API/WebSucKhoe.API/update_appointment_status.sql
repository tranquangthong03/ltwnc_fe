-- ====================================================
-- Script: Cập nhật trạng thái lịch hẹn
-- Mô tả: Đổi trạng thái từ "Pending" sang "ChoDuyet" để thống nhất
-- Cách chạy: Mở SQL Server Management Studio, 
--            chọn database WebSucKhoeDB và chạy script này
-- ====================================================

USE WebSucKhoeDB;
GO

-- Cập nhật tất cả lịch hẹn có trạng thái "Pending" thành "ChoDuyet"
UPDATE LichHen
SET TrangThai = 'ChoDuyet'
WHERE TrangThai = 'Pending';
GO

-- Kiểm tra kết quả
SELECT MaLichHen, MaBenhNhan, MaBacSi, NgayGioHen, TrangThai, LyDoKham
FROM LichHen
ORDER BY NgayTao DESC;
GO

PRINT 'Đã cập nhật trạng thái lịch hẹn thành công!';
GO
