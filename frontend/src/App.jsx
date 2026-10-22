import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import AppLayout from './components/layout/AppLayout';

import TesterPage from './pages/TesterPage';
import PlaygroundPage from './pages/PlaygroundPage';
import ExamplesPage from './pages/ExamplesPage';
import LearnPage from './pages/LearnPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<TesterPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/examples" element={<ExamplesPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
