// src/pages/Doctors.jsx
import React from 'react';

const Doctors = () => {
    const doctors = [
        { id: 1, name: "BS. Nguyễn Văn A", dept: "Tim Mạch", exp: "10 năm" },
        { id: 2, name: "BS. Trần Thị B", dept: "Nhi Khoa", exp: "8 năm" },
        { id: 3, name: "BS. Lê Hoàng C", dept: "Da Liễu", exp: "15 năm" },
    ];

    return (
        <div className="page-container">
            <h2>Đội Ngũ Bác Sĩ</h2>
            <div className="doctor-grid">
                {doctors.map(doc => (
                    <div key={doc.id} className="doctor-card">
                        <div className="avatar-placeholder">IMG</div>
                        <h3>{doc.name}</h3>
                        <p className="dept">Chuyên khoa: {doc.dept}</p>
                        <p>Kinh nghiệm: {doc.exp}</p>
                        <button className="btn-book">Đặt Lịch Tư Vấn</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Doctors;