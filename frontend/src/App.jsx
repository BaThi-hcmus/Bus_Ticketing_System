import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout/AdminLayout';
import BusManagement from './pages/BusManagement/BusManagement';
import RouteManagement from './pages/RouteManagement/RouteManagement';
import StationManagement from './pages/StationManagement/StationManagement';
import PermissionManagement from './pages/PermissionManagement/PermissionManagement';

function App() {
  return (
    <Routes>
      {/* Redirect root to admin buses for now */}
      <Route path="/" element={<Navigate to="/admin/buses" replace />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="buses" element={<BusManagement />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="stations" element={<StationManagement />} />
        <Route path="permissions" element={<PermissionManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
