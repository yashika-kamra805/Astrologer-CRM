import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import PageLayout from '../components/layout/PageLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ClientsPage from '../features/clients/pages/ClientsPage';
import ClientDetailPage from '../features/clients/pages/ClientDetailPage';
import ClientEditPage from '../features/clients/pages/ClientEditPage';
import ConsultationsPage from '../features/consultations/pages/ConsultationsPage';
import ConsultationFormPage from '../features/consultations/pages/ConsultationFormPage';
import FollowUpsPage from '../features/follow-ups/pages/FollowUpsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<PageLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="clients/:id/edit" element={<ClientEditPage />} />
            <Route path="consultations" element={<ConsultationsPage />} />
            <Route path="consultations/new" element={<ConsultationFormPage />} />
            <Route path="consultations/:id/edit" element={<ConsultationFormPage />} />
            <Route path="follow-ups" element={<FollowUpsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
