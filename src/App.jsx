import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/slices/authSlice';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import FIRManagement from './pages/FIRManagement';
import MapPage from './pages/MapPage';
import Settings from './pages/Settings';

// i18n
import './i18n/i18n';

function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-6 overflow-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/fir-management" element={<FIRManagement />} />
                      <Route path="/map" element={<MapPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;