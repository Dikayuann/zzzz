import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { CampaignsPage } from "@/pages/campaigns/CampaignsPage";
import { NewCampaignPage } from "@/pages/campaigns/NewCampaignPage";
import { ContactsPage } from "@/pages/contacts/ContactsPage";
import { TemplatesPage } from "@/pages/templates/TemplatesPage";
import { ChannelsPage } from "@/pages/channels/ChannelsPage";
import { UsersRolesPage } from "@/pages/users/UsersRolesPage";
import { AccountSettingsPage } from "@/pages/account/AccountSettingsPage";
import { NotificationsPage } from "@/pages/notifications/NotificationsPage";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/pages/landing/LandingPage";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes (Landing & Auth) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes (Harus Login) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/new" element={<NewCampaignPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/channels" element={<ChannelsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/users" element={<UsersRolesPage />} />
              <Route path="/account" element={<AccountSettingsPage />} />
            </Route>

            {/* Fallback jika route tidak ditemukan */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </NotificationProvider>
    </AuthProvider>
  );
}
