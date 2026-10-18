import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/Signup';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';



function App() {
  useEffect(() => {
    document.title = 'ITS ERP | ITS Engineering College';
  }, []);

  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Student Signup Route */}
        <Route path="/signup" element={<Signup />} />
        
        {/* Student Dashboard Route */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Preserve the old student URL while enforcing the dashboard route's guard. */}
        <Route path="/fee-management" element={<Navigate to="/student-dashboard" replace />} />

        {/* Teacher Dashboard */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        
        {/* Admin Dashboard */}
<Route 
  path="/admin-dashboard" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

        {/* Incorrect URL Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;