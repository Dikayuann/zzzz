import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { CampaignsPage } from "@/pages/campaigns/CampaignsPage";
import { NewCampaignPage } from "@/pages/campaigns/NewCampaignPage";
import { ContactsPage } from "@/pages/contacts/ContactsPage";
import { TemplatesPage } from "@/pages/templates/TemplatesPage";
import { ChannelsPage } from "@/pages/channels/ChannelsPage";
import { UsersRolesPage } from "@/pages/users/UsersRolesPage";
import { AccountSettingsPage } from "@/pages/account/AccountSettingsPage";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/pages/landing/LandingPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes (Landing & Auth) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

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
            <Route path="/users" element={<UsersRolesPage />} />
            <Route path="/account" element={<AccountSettingsPage />} />
          </Route>

          {/* Fallback jika route tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
