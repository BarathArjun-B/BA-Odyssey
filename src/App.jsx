import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/Auth/AuthPage';

function AppContent() {
  const { user, isDevBypass } = useAuth();
  
  if (!user && !isDevBypass) {
    return <AuthPage />;
  }
  
  return (
    <DataProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
