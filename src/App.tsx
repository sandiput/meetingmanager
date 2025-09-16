import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

import { Sidebar } from './components/layout/Sidebar';
import { ToastRenderer } from './components/ToastProvider';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Participants } from './pages/Participants';
import { Review } from './pages/Review';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import UserManagement from './pages/UserManagement';
import TestConnection from './pages/TestConnection';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/participants" element={<Participants />} />
                        <Route path="/review" element={<Review />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/user-management" element={<UserManagement />} />
                        <Route path="/test-connection" element={<TestConnection />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <ToastRenderer />
        </ToastProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;