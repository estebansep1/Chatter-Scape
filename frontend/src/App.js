import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SlideInAuth } from "./Components/SignUp";
import Dashboard from "./Components/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import PageNotFound from "./Components/404";
import './App.css';
import ProfileCard from "./Components/ProfileCard";
import SettingsPage from "./Components/SettingsPage";

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/login" element={<SlideInAuth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileCard /></ProtectedRoute>} /> {/* New profile page route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </Router>
  );
}
export default App;
