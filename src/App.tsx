import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { ToastProvider } from './components/ToastProvider';
import { Dashboard } from './pages/Dashboard';
import { Participants } from './pages/Participants';
import { Review } from './pages/Review';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider>
          <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
            <Sidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={
                  <Dashboard />
                } />
                <Route path="/participants" element={
                  <Participants />
                } />
                <Route path="/settings" element={
                  <Settings />
                } />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;