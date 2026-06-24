import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import BoardPage from './pages/BoardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initTheme } from './store/themeStore';

initTheme();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  useEffect(() => { initTheme(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"     element={<AuthPage />} />
          <Route path="/board"     element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/board" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          },
          success: { iconTheme: { primary: 'var(--col-offer)',     secondary: 'transparent' } },
          error:   { iconTheme: { primary: 'var(--col-rejected)',  secondary: 'transparent' } },
        }}
      />
    </QueryClientProvider>
  );
}