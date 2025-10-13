import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import CarMod from './pages/CarMod';
import AdminDashboard from './AdminDashboard';
import MySubmissions from './MySubmissions';
import HomePage from './HomePage';
import WinnersGallery from './WinnersGallery';
import Gallery from './Gallery';  // Add this line

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage - MAIN LANDING PAGE */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* CarMod page (full screen, no navbar) */}
        <Route path="/carmod" element={<CarMod />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />
 
        {/* User Dashboard */}
        <Route path="/my-submissions" element={<MySubmissions />} />

        {/* Winners Gallery */}
        <Route path="/winners" element={<WinnersGallery />} />

        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </Router>
  );
}

export default App;