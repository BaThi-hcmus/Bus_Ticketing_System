import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout/AdminLayout';
import BusManagement from './pages/BusManagement/BusManagement';

function App() {
  return (
    <Routes>
      {/* Redirect root to admin buses for now */}
      <Route path="/" element={<Navigate to="/admin/buses" replace />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="buses" element={<BusManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
