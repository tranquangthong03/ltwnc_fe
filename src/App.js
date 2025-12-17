import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './styles/admin.css'; 

// Import Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Import Pages (User)
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import ChatAI from './pages/ChatAI';
import Packages from './pages/Packages';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';


import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors'; 
import ManageUsers from './pages/admin/ManageUsers';
import ManagePackages from './pages/admin/ManagePackages';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageInvoices from './pages/admin/ManageInvoices';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- NHÓM 1: USER ROUTE (Giao diện người dùng) --- */}
          <Route element={<MainLayout />}>
             <Route path="/" element={<Home />} />
             <Route path="/doctors" element={<Doctors />} />
             <Route path="/chat-ai" element={<ChatAI />} />
             <Route path="/packages" element={<Packages />} />
             <Route path="/contact" element={<Contact />} />
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
          </Route>

          {/* --- NHÓM 2: ADMIN ROUTE (Giao diện quản trị) --- */}
          <Route path="/admin" element={<AdminLayout />}>
             {/* Dashboard: localhost:3000/admin */}
             <Route index element={<AdminDashboard />} /> 
             
             {/* Quản lý Nhân sự */}
             <Route path="users" element={<ManageUsers />} />
             <Route path="doctors" element={<ManageDoctors />} />
             
             {/* Dịch vụ & Vận hành */}
             <Route path="packages" element={<ManagePackages />} />
             <Route path="appointments" element={<ManageAppointments />} />
             <Route path="invoices" element={<ManageInvoices />} />
             
             {/* Khác */}
             <Route path="settings" element={<AdminSettings />} />
          </Route>

        </Routes>

        <ToastContainer position="bottom-right" theme="colored" />
      </Router>
    </AuthProvider>
  );
}

export default App;