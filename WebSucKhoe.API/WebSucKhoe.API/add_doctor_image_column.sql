-- ====================================================
-- Script: Thêm cột ảnh cho Bác sĩ
-- Mô tả: Thêm trường AnhBacSi vào bảng ChiTietBacSi
-- Cách chạy: Mở SQL Server Management Studio, 
--            chọn database WebSucKhoeDB và chạy script này
-- ====================================================

USE WebSucKhoeDB;
GO

-- Kiểm tra nếu cột chưa tồn tại thì mới thêm
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('ChiTietBacSi') 
    AND name = 'AnhBacSi'
)
BEGIN
    ALTER TABLE ChiTietBacSi
    ADD AnhBacSi NVARCHAR(500) NULL; -- Lưu đường dẫn tương đối đến ảnh
    
    PRINT 'Đã thêm cột AnhBacSi vào bảng ChiTietBacSi';
END
ELSE
BEGIN
    PRINT 'Cột AnhBacSi đã tồn tại';
END
GO

-- Cập nhật ảnh mẫu cho các bác sĩ hiện có (tùy chọn)
-- UPDATE ChiTietBacSi SET AnhBacSi = '/images/doctors/default-doctor.jpg' WHERE AnhBacSi IS NULL;
-- GO

PRINT 'Hoàn tất thêm cột ảnh bác sĩ!';
GO
