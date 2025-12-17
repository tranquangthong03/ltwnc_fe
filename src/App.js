// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import ChatAI from './pages/ChatAI';
import Packages from './pages/Packages';
import Login from './pages/Login';
import Contact from './pages/Contact';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Quan trọng để nhận CSS mới

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* --- HIỆU ỨNG NỀN (ORBS) --- */}
        <div className="background-effects">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>

        <Navbar />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/chat-ai" element={<ChatAI />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>

        <ToastContainer position="bottom-right" theme="dark" />
      </Router>
    </AuthProvider>
  );
}

export default App;