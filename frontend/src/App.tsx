import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
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

            {/* Rute-rute yang akan kita bangun sesuai roadmap */}
            <Route
              path="/campaigns"
              element={
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-card">
                  <h3 className="text-lg font-bold">Modul Campaigns (Blast Baru)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Multi-channel campaign wizard (Telegram & SMTP Email)
                  </p>
                </div>
              }
            />
            <Route
              path="/contacts"
              element={
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-card">
                  <h3 className="text-lg font-bold">Modul Contacts (Daftar Penerima)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Import CSV/XLSX, tag, dan segmentasi dinamis
                  </p>
                </div>
              }
            />
            <Route
              path="/templates"
              element={
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-card">
                  <h3 className="text-lg font-bold">Modul Templates</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rich text HTML/Markdown dan merge tags dinamis
                  </p>
                </div>
              }
            />
            <Route
              path="/channels"
              element={
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-card">
                  <h3 className="text-lg font-bold">Modul Channel Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pengaturan SMTP Organisasi & Telegram Bot Token pribadi
                  </p>
                </div>
              }
            />
            <Route
              path="/users"
              element={
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-card">
                  <h3 className="text-lg font-bold">Modul Users & Role Management</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    RBAC (Admin, Manager, Editor, Viewer) & Audit Logs
                  </p>
                </div>
              }
            />
          </Route>

          {/* Fallback jika route tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
