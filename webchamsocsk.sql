USE master;
GO

-- ====================================================
-- 1. KHỞI TẠO DATABASE (XÓA CŨ TẠO MỚI)
-- ====================================================
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'WebSucKhoeDB')
BEGIN
    ALTER DATABASE WebSucKhoeDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE WebSucKhoeDB;
END
GO

CREATE DATABASE WebSucKhoeDB;
GO

USE WebSucKhoeDB;
GO

-- ====================================================
-- 2. TẠO BẢNG (TABLES) & RÀNG BUỘC (CONSTRAINTS)
-- ====================================================

-- 2.1 Bảng Người Dùng (Cốt lõi)
CREATE TABLE NguoiDung (
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE, -- Username login
    MatKhauHash VARCHAR(256) NOT NULL,       -- Password (lưu hash)
    Email VARCHAR(100) NOT NULL UNIQUE,
    HoTen NVARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20),
    AnhDaiDien NVARCHAR(500),
    VaiTro VARCHAR(20) NOT NULL CHECK (VaiTro IN ('BenhNhan', 'BacSi', 'Admin')), 
    NgayTao DATETIME DEFAULT GETDATE(),
    TrangThai BIT DEFAULT 1 -- 1: Active, 0: Blocked
);

-- 2.2 Chi tiết Bệnh nhân (1-1 với NguoiDung)
CREATE TABLE ChiTietBenhNhan (
    MaBenhNhan INT PRIMARY KEY,
    NgaySinh DATE,
    GioiTinh NVARCHAR(10) CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),
    DiaChi NVARCHAR(255),
    NhomMau VARCHAR(5),
    TienSuBenh NVARCHAR(MAX),
    -- Xóa User -> Xóa hồ sơ này
    CONSTRAINT FK_BenhNhan_User FOREIGN KEY (MaBenhNhan) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE
);

-- 2.3 Chi tiết Bác sĩ (1-1 với NguoiDung)
CREATE TABLE ChiTietBacSi (
    MaBacSi INT PRIMARY KEY,
    ChuyenKhoa NVARCHAR(100) NOT NULL,
    SoChungChi VARCHAR(50) UNIQUE,
    SoNamKinhNghiem INT DEFAULT 0,
    GiaKham DECIMAL(18, 2) DEFAULT 0,
    MoTa NVARCHAR(MAX),
    -- Xóa User -> Xóa thông tin bác sĩ
    CONSTRAINT FK_BacSi_User FOREIGN KEY (MaBacSi) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE
);

-- 2.4 Gói Khám Sức Khỏe (Sản phẩm)
CREATE TABLE GoiKham (
    MaGoi INT IDENTITY(1,1) PRIMARY KEY,
    TenGoi NVARCHAR(150) NOT NULL,
    MoTa NVARCHAR(MAX),
    GiaTien DECIMAL(18, 2) NOT NULL CHECK (GiaTien >= 0),
    ThoiHanNgay INT NOT NULL,
    DangHoatDong BIT DEFAULT 1
);

-- 2.5 Đăng Ký Gói (Transaction mua gói)
CREATE TABLE DangKyGoi (
    MaDangKy INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT NOT NULL,
    MaGoi INT NOT NULL,
    NgayBatDau DATETIME DEFAULT GETDATE(),
    NgayKetThuc DATETIME,
    TrangThai VARCHAR(20) DEFAULT 'DangDung', -- DangDung, HetHan, Huy
    
    CONSTRAINT FK_DangKy_BenhNhan FOREIGN KEY (MaBenhNhan) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    CONSTRAINT FK_DangKy_Goi FOREIGN KEY (MaGoi) REFERENCES GoiKham(MaGoi) ON DELETE CASCADE
);

-- 2.6 Lịch Hẹn (Quan trọng)
CREATE TABLE LichHen (
    MaLichHen INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT NOT NULL,
    MaBacSi INT NOT NULL,
    NgayGioHen DATETIME NOT NULL,
    LyDoKham NVARCHAR(255),
    TrangThai NVARCHAR(20) DEFAULT 'ChoDuyet', -- ChoDuyet, DaDuyet, HoanThanh, DaHuy
    NgayTao DATETIME DEFAULT GETDATE(),

    -- Lưu ý: Dùng NO ACTION cho 1 bên để tránh lỗi "Multiple Cascade Paths" trong SQL Server
    CONSTRAINT FK_LichHen_BenhNhan FOREIGN KEY (MaBenhNhan) REFERENCES NguoiDung(MaNguoiDung) ON DELETE NO ACTION,
    CONSTRAINT FK_LichHen_BacSi FOREIGN KEY (MaBacSi) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE
);

-- 2.7 Hồ Sơ Y Tế (Kết quả sau khi khám)
CREATE TABLE HoSoYTe (
    MaHoSo INT IDENTITY(1,1) PRIMARY KEY,
    MaLichHen INT NOT NULL UNIQUE,
    ChanDoan NVARCHAR(MAX) NOT NULL,
    DonThuoc NVARCHAR(MAX),
    LoiDanBacSi NVARCHAR(MAX),
    NgayTaiKham DATE,
    
    CONSTRAINT FK_HoSo_LichHen FOREIGN KEY (MaLichHen) REFERENCES LichHen(MaLichHen) ON DELETE CASCADE
);

-- 2.8 Hóa Đơn (Thanh toán)
CREATE TABLE HoaDon (
    MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaBenhNhan INT NOT NULL,
    MaLichHen INT NULL,
    MaDangKy INT NULL,
    TongTien DECIMAL(18, 2) NOT NULL,
    PhuongThucThanhToan NVARCHAR(50), 
    TrangThaiThanhToan NVARCHAR(20) DEFAULT 'ChuaThanhToan',
    MaGiaoDich VARCHAR(100), 
    NgayTao DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_HoaDon_BenhNhan FOREIGN KEY (MaBenhNhan) REFERENCES NguoiDung(MaNguoiDung) ON DELETE NO ACTION, -- Tránh cycle
    CONSTRAINT FK_HoaDon_LichHen FOREIGN KEY (MaLichHen) REFERENCES LichHen(MaLichHen) ON DELETE CASCADE,
    CONSTRAINT FK_HoaDon_DangKy FOREIGN KEY (MaDangKy) REFERENCES DangKyGoi(MaDangKy) ON DELETE NO ACTION
);

-- 2.9 Chat AI - Phiên chat
CREATE TABLE PhienChat (
    MaPhienChat INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    TieuDe NVARCHAR(200) DEFAULT N'Cuộc hội thoại mới',
    ThoiGianTao DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_PhienChat_User FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE
);

-- 2.10 Chat AI - Tin nhắn chi tiết
CREATE TABLE TinNhan (
    MaTinNhan BIGINT IDENTITY(1,1) PRIMARY KEY,
    MaPhienChat INT NOT NULL,
    VaiTro VARCHAR(10) CHECK (VaiTro IN ('user', 'model')), 
    NoiDung NVARCHAR(MAX) NOT NULL,
    ThoiGianGui DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_TinNhan_PhienChat FOREIGN KEY (MaPhienChat) REFERENCES PhienChat(MaPhienChat) ON DELETE CASCADE
);

GO

-- Cập nhật mật khẩu Hash SHA256 chuẩn của chuỗi "123456" cho admin
UPDATE NguoiDung 
SET MatKhauHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
WHERE TenDangNhap = 'admin';
GO
-- ====================================================
-- 3. STORED PROCEDURES (HỖ TRỢ API C# GỌI NHANH)
-- ====================================================

-- 3.1 Thủ tục Đăng Nhập
-- Code C# chỉ cần gọi: EXEC sp_DangNhap 'bacsi01', '123456'
CREATE PROCEDURE sp_DangNhap
    @TenDangNhap VARCHAR(50),
    @MatKhau VARCHAR(256)
AS
BEGIN
    SELECT MaNguoiDung, HoTen, VaiTro, AnhDaiDien, Email
    FROM NguoiDung
    WHERE TenDangNhap = @TenDangNhap AND MatKhauHash = @MatKhau AND TrangThai = 1
END
GO

-- 3.2 Thủ tục Đăng Ký Bệnh Nhân Mới (Insert 2 bảng cùng lúc)
CREATE PROCEDURE sp_DangKyBenhNhan
    @TenDangNhap VARCHAR(50),
    @MatKhau VARCHAR(256),
    @Email VARCHAR(100),
    @HoTen NVARCHAR(100),
    @SoDienThoai VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    -- Insert bảng cha
    INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, VaiTro, SoDienThoai)
    VALUES (@TenDangNhap, @MatKhau, @Email, @HoTen, 'BenhNhan', @SoDienThoai);
    
    -- Lấy ID vừa tạo
    DECLARE @NewID INT = SCOPE_IDENTITY();
    
    -- Insert bảng con (thông tin rỗng ban đầu)
    INSERT INTO ChiTietBenhNhan (MaBenhNhan, NgaySinh) VALUES (@NewID, NULL);
    
    SELECT @NewID AS NewUserID;
END
GO

-- ====================================================
-- 4. DỮ LIỆU MẪU (SEED DATA)
-- ====================================================

-- 4.1 Tạo Admin
INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, VaiTro) 
VALUES ('admin', '123456', 'admin@healthcare.com', N'Admin Hệ Thống', 'Admin');

-- 4.2 Tạo 2 Bác sĩ
INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, VaiTro, SoDienThoai) VALUES 
('bacsi01', '123456', 'bs.tuan@gmail.com', N'BS. Nguyễn Tuấn', 'BacSi', '0901234567'),
('bacsi02', '123456', 'bs.lan@gmail.com', N'BS. Trần Lan', 'BacSi', '0901234568');

-- Insert chi tiết bác sĩ
INSERT INTO ChiTietBacSi (MaBacSi, ChuyenKhoa, SoChungChi, GiaKham) VALUES
(2, N'Tim Mạch', 'CCHN-001', 500000),
(3, N'Nhi Khoa', 'CCHN-002', 300000);

-- 4.3 Tạo 2 Bệnh nhân
INSERT INTO NguoiDung (TenDangNhap, MatKhauHash, Email, HoTen, VaiTro, SoDienThoai) VALUES 
('user01', '123456', 'khach.hang1@gmail.com', N'Nguyễn Văn An', 'BenhNhan', '0988777666'),
('user02', '123456', 'khach.hang2@gmail.com', N'Lê Thị Bình', 'BenhNhan', '0988777555');

-- Insert chi tiết bệnh nhân
INSERT INTO ChiTietBenhNhan (MaBenhNhan, NgaySinh, GioiTinh, DiaChi) VALUES
(4, '1990-01-01', N'Nam', N'Hà Nội'),
(5, '1995-05-20', N'Nữ', N'Đà Nẵng');

-- 4.4 Tạo Gói Khám
INSERT INTO GoiKham (TenGoi, GiaTien, ThoiHanNgay, MoTa) VALUES
(N'Gói Tổng Quát VIP', 5000000, 365, N'Khám toàn diện, ưu tiên đặt lịch'),
(N'Gói Nhi Khoa', 2000000, 365, N'Chăm sóc sức khỏe cho bé');

-- 4.5 Tạo Lịch Hẹn & Chat mẫu
INSERT INTO LichHen (MaBenhNhan, MaBacSi, NgayGioHen, LyDoKham, TrangThai) VALUES
(4, 2, DATEADD(day, 1, GETDATE()), N'Đau ngực trái', 'ChoDuyet');

INSERT INTO PhienChat (MaNguoiDung, TieuDe) VALUES (4, N'Tư vấn đau ngực');
INSERT INTO TinNhan (MaPhienChat, VaiTro, NoiDung) VALUES 
(1, 'user', N'Bác sĩ ơi tôi hay bị đau ngực?'),
(1, 'model', N'Chào bạn, đau ngực có nhiều nguyên nhân. Bạn có thấy khó thở không?');



-- Kiểm tra nếu cột chưa tồn tại thì thêm vào
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PhienChat' AND COLUMN_NAME = 'MaBacSi')
BEGIN
    ALTER TABLE PhienChat ADD MaBacSi INT NULL;
    ALTER TABLE PhienChat ADD CONSTRAINT FK_PhienChat_NguoiDung_BacSi FOREIGN KEY (MaBacSi) REFERENCES NguoiDung(MaNguoiDung);
END
USE WebSucKhoeDB;
GO

-- 1. Thêm cột MaBacSi nếu chưa có
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PhienChat' AND COLUMN_NAME = 'MaBacSi')
BEGIN
    ALTER TABLE PhienChat ADD MaBacSi INT NULL;
    PRINT 'Da them cot MaBacSi';
END

-- 2. Thêm khóa ngoại liên kết với bảng NguoiDung (hoặc ChiTietBacSi)
-- Kiểm tra xem constraint đã tồn tại chưa để tránh lỗi trùng tên
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PhienChat_NguoiDung_BacSi')
BEGIN
    ALTER TABLE PhienChat 
    ADD CONSTRAINT FK_PhienChat_NguoiDung_BacSi 
    FOREIGN KEY (MaBacSi) REFERENCES NguoiDung(MaNguoiDung);
    PRINT 'Da them khoa ngoai FK_PhienChat_NguoiDung_BacSi';
END
GO