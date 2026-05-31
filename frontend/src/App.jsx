import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout/AdminLayout';
import BusManagement from './pages/BusManagement/BusManagement';
import RouteManagement from './pages/RouteManagement/RouteManagement';
import StationManagement from './pages/StationManagement/StationManagement';
import PermissionManagement from './pages/PermissionManagement/PermissionManagement';
import RoleManagement from './pages/RoleManagement/RoleManagement';
import UserManagement from './pages/UserManagement/UserManagement';
import Login from './pages/Login/Login';
import Authorization from './pages/Authorization/Authorization';
import CategoryPermissionManagement from './pages/CategoryPermissionManagement/CategoryPermissionManagement';

function App() {
  return (
    <Routes>
      {/* Redirect root to admin buses for now */}
      <Route path="/" element={<Navigate to="/admin/buses" replace />} />
      <Route path="/admin/login" element={<Login />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="buses" element={<BusManagement />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="stations" element={<StationManagement />} />
        <Route path="permissions" element={<PermissionManagement />} />
        <Route path="category-permissions" element={<CategoryPermissionManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="authorization" element={<Authorization />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}

export default App;


