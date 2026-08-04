import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-page-center">
        <div className="loading-spinner">Initializing Antigravity HRMS...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
