import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SlideInAuth } from "./Components/SignUp";
import Dashboard from "./Components/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<SlideInAuth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
