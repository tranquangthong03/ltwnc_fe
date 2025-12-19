import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './styles/admin.css';
import PatientAppointments from './pages/PatientAppointments';
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

//import pages (Doctor)
import DoctorLayout from './pages/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorSchedule from './pages/doctor/DoctorSchedule'; // Bạn tự tạo file này tương tự DoctorPatients
import DiagnosisReport from './pages/doctor/DiagnosisReport';
import DoctorProfile from './pages/doctor/DoctorProfile';


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
            <Route path="/my-appointments" element={<PatientAppointments />} />
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

          {/* Route dành riêng cho Bác sĩ */}
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboard />} /> {/* Mặc định vào Dashboard */}
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="diagnosis" element={<DiagnosisReport />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>
        </Routes>

        <ToastContainer position="bottom-right" theme="colored" />
      </Router>
    </AuthProvider>
  );
}

export default App;