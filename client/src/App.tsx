import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import AssessmentPage from './pages/AssessmentPage';
import ApplicationReview from './pages/ApplicationReview';

// Placeholder Dashboard
const Dashboard = () => {
  const { user, logout } = useAuth();

  if (user?.role === 'RECRUITER') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">CYGNUSA Elite-Hire</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, Recruiter {user.name}</span>
            <button onClick={logout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700">Logout</button>
          </div>
        </header>
        <RecruiterDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-400">CYGNUSA Elite-Hire</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700">Logout</button>
        </div>
      </header>
      <CandidateDashboard />
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-slate-100 p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/assessment" element={
            <ProtectedRoute>
              <AssessmentPage />
            </ProtectedRoute>
          } />
          <Route path="/applications/:id" element={
            <ProtectedRoute>
              <ApplicationReview />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
