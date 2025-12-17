// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import các Components
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

// Import các Pages
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import ChatAI from './pages/ChatAI';
import Packages from './pages/Packages';
import Login from './pages/Login';
import Register from './pages/Register'; // <--- Đã thêm trang Đăng ký
import Contact from './pages/Contact';

// Import Thư viện thông báo & CSS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // File CSS chính (chứa hiệu ứng nền)

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* --- HIỆU ỨNG NỀN (ORBS) --- */}
        {/* Các quả cầu mờ lơ lửng phía sau */}
        <div className="background-effects">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>

        {/* Thanh điều hướng */}
        <Navbar />

        {/* Nội dung chính của trang */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/chat-ai" element={<ChatAI />} />
            <Route path="/packages" element={<Packages />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* <--- Route cho trang Đăng ký */}

            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>

        {/* Component hiển thị thông báo (Toast) toàn cục */}
        <ToastContainer position="bottom-right" theme="colored" />
      </Router>
    </AuthProvider>
  );
}

export default App;