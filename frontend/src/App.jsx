import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import AppLayout from './components/layout/AppLayout';

import TesterPage from './pages/TesterPage';
import PlaygroundPage from './pages/PlaygroundPage';
import ExamplesPage from './pages/ExamplesPage';
import LearnPage from './pages/LearnPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<TesterPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/examples" element={<ExamplesPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </ThemeProvider>
    </BrowserRouter>
  );
}
