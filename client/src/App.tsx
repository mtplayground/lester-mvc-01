import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuthStore } from './stores/authStore';

function DashboardPage() {
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
      <p className="text-sm text-slate-600">Welcome to the base application shell.</p>
    </section>
  );
}

function BoardsPage() {
  return (
    <section className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Boards</h2>
      <p className="text-sm text-slate-600">Board pages will be added in upcoming issues.</p>
    </section>
  );
}

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="boards" element={<BoardsPage />} />
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
