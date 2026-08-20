import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const MainApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dark-surface min-h-screen flex items-center justify-center bg-olive-50">
        <div className="text-olive-700 font-semibold text-sm animate-pulse">Initializing HRMS...</div>
      </div>
    );
  }

  if (user?.mustChangePassword) {
    return <Login forcePasswordChange />;
  }

  return user ? <Dashboard /> : <Login />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
