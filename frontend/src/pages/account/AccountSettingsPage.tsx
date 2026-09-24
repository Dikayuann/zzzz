import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  X,
  Check,
  Mail,
  ArrowLeft,
  RefreshCw,
  Lock,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";

type AccountTab = "profile" | "security" | "audit";

interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  ip: string;
  timestamp: string;
  status: "Success" | "Warning";
}

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    action: "Updated WhatsApp Meta Business API Configuration",
    actor: "Sarah Admin",
    ip: "182.1.24.89",
    timestamp: "Just now",
    status: "Success",
  },
  {
    id: "log-2",
    action: "Invited new team member (hani@acmecorp.co)",
    actor: "Sarah Admin",
    ip: "182.1.24.89",
    timestamp: "25 minutes ago",
    status: "Success",
  },
  {
    id: "log-3",
    action: "Updated SMTP Email Provider to Gmail Workspace",
    actor: "Sarah Admin",
    ip: "182.1.24.89",
    timestamp: "2 hours ago",
    status: "Success",
  },
  {
    id: "log-4",
    action: "Triggered Broadcast Campaign: 'Promo Gajian September'",
    actor: "Rizky Pratama",
    ip: "114.122.40.12",
    timestamp: "Yesterday, 14:32",
    status: "Success",
  },
  {
    id: "log-5",
    action: "Failed Login Attempt (Password incorrect)",
    actor: "Unknown",
    ip: "103.20.14.5",
    timestamp: "Sep 21, 2026, 09:12",
    status: "Warning",
  },
  {
    id: "log-6",
    action: "Exported 8 contacts to CSV",
    actor: "Sarah Admin",
    ip: "182.1.24.89",
    timestamp: "Sep 20, 2026, 11:05",
    status: "Success",
  },
];

export const AccountSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  // Profile Form States (Matching user screenshot)
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Admin");
  const [emailAddress, setEmailAddress] = useState("sarah@acmecorp.co");
  const [orgName, setOrgName] = useState("Acme Corp");
  const [timezone, setTimezone] = useState("Asia/Jakarta (WIB, UTC+7)");

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Security States (Shopee-Grade Multi-factor Security Flow)
  type PasswordStep =
    | "select_method"
    | "verify_otp"
    | "verify_password"
    | "new_password"
    | "success";
  type VerificationChannel = "email" | "password" | "authenticator";

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] =
    useState<PasswordStep>("select_method");
  const [verificationChannel, setVerificationChannel] =
    useState<VerificationChannel>("email");
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [lastPasswordChange, setLastPasswordChange] = useState(
    "Terakhir diubah 3 minggu yang lalu"
  );
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Masked user email for secure SaaS display
  const userEmailMasked = "sa••••@acmecorp.co";

  // Password strength calculation (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const passwordStrength = getPasswordStrength(newPassword);

  // Start OTP Timer
  const startOtpTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Select verification method (Email OTP vs Current Password vs 2FA Authenticator)
  const handleSelectMethod = (channel: VerificationChannel) => {
    setVerificationChannel(channel);
    if (channel === "email") {
      setIsUpdatingPassword(true);
      setTimeout(() => {
        setIsUpdatingPassword(false);
        setPasswordStep("verify_otp");
        startOtpTimer();
        toast.success("Kode OTP 6-digit dikirim via Email!", {
          description: `Cek inbox email terdaftar: ${emailAddress} (Gunakan kode: 729410 untuk simulasi)`,
        });
      }, 400);
    } else if (channel === "authenticator") {
      setPasswordStep("verify_otp");
      toast.info("Buka aplikasi Authenticator Anda dan masukkan 6-digit kode keamanan.");
    } else {
      setPasswordStep("verify_password");
    }
  };

  // Shopee Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      toast.error("Masukkan 6-digit kode OTP lengkap!");
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordStep("new_password");
      toast.success("Verifikasi berhasil! Silakan buat kata sandi baru.");
    }, 600);
  };

  // Shopee Step 2 Alt: Verify Current Password
  const handleVerifyCurrentPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Masukkan kata sandi saat ini!");
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordStep("new_password");
      toast.success("Kata sandi valid! Silakan buat kata sandi baru.");
    }, 500);
  };

  // Resend Email OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    startOtpTimer();
    toast.info(`Kode OTP baru telah dikirimkan ke email ${emailAddress}. (Kode: 729410)`);
  };

  // Shopee Step 3: Save New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordStep("success");
      setLastPasswordChange("Baru saja diubah");
    }, 700);
  };

  // Shopee Step 4: Finish & close modal
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordStep("select_method");
    setOtpCode("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Handle Photo Change
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
        toast.success("Foto profil berhasil diperbarui!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perubahan profil berhasil disimpan!", {
      description: `Nama: ${firstName} ${lastName} • Organisasi: ${orgName}`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-4xl">
      {/* 1. TOP HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your profile, security, and activity.
        </p>
      </div>

      {/* 2. TABS: Profile, Security, Audit Log */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-sm font-semibold transition cursor-pointer relative ${
              activeTab === "profile"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`pb-3 text-sm font-semibold transition cursor-pointer relative ${
              activeTab === "security"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`pb-3 text-sm font-semibold transition cursor-pointer relative ${
              activeTab === "audit"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Audit Log
          </button>
        </nav>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: PROFILE (EXACT REPLICA OF USER SCREENSHOT) */}
      {activeTab === "profile" && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs space-y-6">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="h-16 w-16 rounded-full object-cover shadow-xs border-2 border-indigo-100"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[#4F46E5] text-white font-bold text-lg flex items-center justify-center shadow-xs flex-shrink-0">
                SA
              </div>
            )}

            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {firstName} {lastName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Org Admin · {orgName}
              </p>

              <label className="text-xs font-semibold text-[#2563eb] hover:underline mt-1.5 inline-block cursor-pointer">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="border-b border-slate-100" />

          {/* Form Fields */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Row 1: First name & Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs transition"
                />
              </div>
            </div>

            {/* Row 2: Email address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Email address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs transition"
              />
            </div>

            {/* Row 3: Organization name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Organization name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs transition"
              />
            </div>

            {/* Row 4: Timezone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Timezone
              </label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-11 appearance-none px-3.5 pr-10 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs transition cursor-pointer"
                >
                  <option value="Asia/Jakarta (WIB, UTC+7)">
                    Asia/Jakarta (WIB, UTC+7)
                  </option>
                  <option value="Asia/Makassar (WITA, UTC+8)">
                    Asia/Makassar (WITA, UTC+8)
                  </option>
                  <option value="Asia/Jayapura (WIT, UTC+9)">
                    Asia/Jayapura (WIT, UTC+9)
                  </option>
                  <option value="Asia/Singapore (SGT, UTC+8)">
                    Asia/Singapore (SGT, UTC+8)
                  </option>
                  <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Password Card (Clean, modern SaaS style) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 mt-0.5 sm:mt-0">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-slate-900">
                      Password & Authentication
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                      <Check className="h-3 w-3 text-emerald-600" /> Secure
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {lastPasswordChange} · Disarankan ganti berkala untuk menjaga keamanan akun.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-xs tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg select-none">
                      ••••••••••••••••
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition cursor-pointer active:scale-95 shrink-0"
              >
                <Key className="h-3.5 w-3.5 text-slate-500" />
                Change password
              </button>
            </div>
          </div>

          {/* 2FA Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Amankan akun Anda dengan kode verifikasi 6-digit dari Google Authenticator.
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  twoFactorEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    twoFactorEnabled ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(!twoFactorEnabled);
                  toast.success(
                    twoFactorEnabled
                      ? "2FA telah dinonaktifkan."
                      : "2FA berhasil diaktifkan dengan aplikasi autentikator!"
                  );
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {twoFactorEnabled ? "Disable 2FA" : "Setup 2FA Authenticator"}
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Logged In Sessions
                </h3>
                <p className="text-xs text-slate-500">
                  Perangkat yang sedang login ke akun Anda saat ini.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Windows PC · Chrome Browser (Current session)
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Jakarta, Indonesia · IP: 182.1.24.89
                  </span>
                </div>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active now
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">
                    iPhone 15 Pro · Safari Mobile
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Jakarta, Indonesia · IP: 114.122.40.12
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  Aktif 2 jam yang lalu
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.info("Semua sesi perangkat lain telah dicabut.")}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
            >
              Sign out all other sessions
            </button>
          </div>

          {/* Danger Zone: Log Out */}
          <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-8 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                  <LogOut className="h-4 w-4 text-rose-600" />
                  Keluar dari Akun CampaignBlast
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Akhiri sesi login aktif Anda pada peramban ini secara aman.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLogoutDialogOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-4 pl-6 pr-4 min-w-[280px]">ACTION / EVENT</th>
                  <th className="py-4 px-4 min-w-[140px]">ACTOR</th>
                  <th className="py-4 px-4 min-w-[120px]">IP ADDRESS</th>
                  <th className="py-4 px-4 min-w-[140px]">TIMESTAMP</th>
                  <th className="py-4 pr-6 pl-4 text-right min-w-[100px]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_AUDIT_LOGS.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-6 pr-4 font-semibold text-slate-800">
                      {item.action}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.actor}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.ip}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.timestamp}
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right">
                      {item.status === "Success" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Warning
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setIsPasswordModalOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  {passwordStep === "select_method" && <ShieldCheck className="h-5 w-5 text-indigo-600" />}
                  {passwordStep === "select_method" && <ShieldCheck className="h-5 w-5 text-indigo-600" />}
                  {passwordStep === "verify_otp" && (verificationChannel === "authenticator" ? <ShieldCheck className="h-5 w-5 text-indigo-600" /> : <Mail className="h-5 w-5 text-indigo-600" />)}
                  {passwordStep === "verify_password" && <Key className="h-5 w-5 text-indigo-600" />}
                  {passwordStep === "new_password" && <Lock className="h-5 w-5 text-indigo-600" />}
                  {passwordStep === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {passwordStep === "select_method" && "Pilih Metode Verifikasi"}
                    {passwordStep === "verify_otp" && (verificationChannel === "authenticator" ? "Verifikasi Authenticator (2FA)" : "Verifikasi Kode OTP Email")}
                    {passwordStep === "verify_password" && "Konfirmasi Kata Sandi Lama"}
                    {passwordStep === "new_password" && "Buat Kata Sandi Baru"}
                    {passwordStep === "success" && "Kata Sandi Berhasil Diubah"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {passwordStep === "select_method" && "Verifikasi identitas demi melindungi keamanan akun Anda."}
                    {passwordStep === "verify_otp" && (verificationChannel === "authenticator" ? "Masukkan token keamanan dari aplikasi authenticator" : `Kode 6-digit dikirim ke ${userEmailMasked}`)}
                    {passwordStep === "verify_password" && "Masukkan kata sandi saat ini untuk melanjutkan"}
                    {passwordStep === "new_password" && "Atur kata sandi baru yang kuat dan unik"}
                    {passwordStep === "success" && "Perubahan keamanan telah aktif di seluruh sistem"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* STEP 1: SELECT VERIFICATION METHOD (SHOPEE STYLE - EMAIL & PASSWORD) */}
            {passwordStep === "select_method" && (
              <div className="p-6 space-y-4 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800">
                  <Shield className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Pilih metode verifikasi di bawah untuk membuktikan kepemilikan akun resmi Anda.</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Option 1: Email OTP */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("email")}
                    disabled={isUpdatingPassword}
                    className="w-full p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                            Kirim Kode OTP via Email
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                            Rekomendasi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          {userEmailMasked}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </button>

                  {/* Option 2: Current Password */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("password")}
                    disabled={isUpdatingPassword}
                    className="w-full p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                        <Key className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-slate-800">
                            Masukkan Kata Sandi Saat Ini
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Cepat
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Verifikasi instan menggunakan kata sandi aktif Anda
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
                  </button>

                  {/* Option 3: Authenticator 2FA (if enabled) */}
                  {twoFactorEnabled && (
                    <button
                      type="button"
                      onClick={() => handleSelectMethod("authenticator")}
                      disabled={isUpdatingPassword}
                      className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                              Aplikasi Authenticator (TOTP)
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              2FA Aktif
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Gunakan kode 6-digit dari Google Authenticator
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2A: OTP VERIFICATION */}
            {passwordStep === "verify_otp" && (
              <form onSubmit={handleVerifyOtp} className="p-6 space-y-5 animate-in fade-in duration-150">
                <div className="text-center space-y-1">
                  <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 items-center justify-center border border-indigo-100 mb-1">
                    {verificationChannel === "authenticator" ? <ShieldCheck className="h-6 w-6 text-indigo-600" /> : <Mail className="h-6 w-6 text-indigo-600" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {verificationChannel === "authenticator" ? "Masukkan 6-Digit Token Authenticator" : "Masukkan 6-Digit Kode Verifikasi"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {verificationChannel === "authenticator"
                      ? "Buka aplikasi Google Authenticator Anda dan salin kode 6-digit."
                      : "Kode verifikasi telah dikirimkan ke email terdaftar:"}
                  </p>
                  {verificationChannel !== "authenticator" && (
                    <p className="text-xs font-bold text-slate-800 font-mono">
                      {emailAddress}
                    </p>
                  )}
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <div className="relative max-w-xs mx-auto">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      autoFocus
                      className="w-full h-13 text-center tracking-[0.5em] text-xl font-mono font-bold rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-600 focus:outline-none transition shadow-2xs text-slate-900"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-center text-slate-400">
                    Simulasi pengujian: Masukkan kode <span className="font-mono font-bold text-indigo-600">729410</span>
                  </p>
                </div>

                {/* Resend Timer (Only for Email OTP) */}
                {verificationChannel === "email" && (
                  <div className="flex items-center justify-center gap-1.5 text-xs">
                    {resendTimer > 0 ? (
                      <span className="text-slate-400">
                        Kirim ulang kode dalam <strong className="text-slate-600">{resendTimer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" /> Kirim ulang kode OTP
                      </button>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPasswordStep("select_method")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Pilih Metode Lain</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword || otpCode.length !== 6}
                    className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      "Lanjut Buat Password"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2B: VERIFY CURRENT PASSWORD */}
            {passwordStep === "verify_password" && (
              <form onSubmit={handleVerifyCurrentPassword} className="p-6 space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Kata sandi akun saat ini
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-medium text-indigo-600 hover:underline"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      autoFocus
                      className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-2xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPasswordStep("select_method")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Pilih Metode Lain</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !currentPassword}
                    className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memeriksa...
                      </>
                    ) : (
                      "Lanjut Buat Password"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: NEW PASSWORD FORM (AUTHENTICATED) */}
            {passwordStep === "new_password" && (
              <form onSubmit={handleSaveNewPassword} className="p-6 space-y-4 animate-in fade-in duration-150">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Identitas terverifikasi. Masukkan kata sandi baru untuk akun Anda.</span>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Kata sandi baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      autoFocus
                      className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-2xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Checklist & Bar */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Kekuatan:</span>
                        <span
                          className={`font-semibold ${
                            passwordStrength <= 1
                              ? "text-rose-600"
                              : passwordStrength === 2
                              ? "text-amber-600"
                              : passwordStrength === 3
                              ? "text-blue-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {passwordStrength <= 1
                            ? "Lemah"
                            : passwordStrength === 2
                            ? "Cukup"
                            : passwordStrength === 3
                            ? "Bagus"
                            : "Sangat Kuat"}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              passwordStrength >= step
                                ? passwordStrength <= 1
                                  ? "bg-rose-500"
                                  : passwordStrength === 2
                                  ? "bg-amber-500"
                                  : passwordStrength === 3
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Konfirmasi kata sandi baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className={`w-full h-11 pl-3.5 pr-10 rounded-xl border bg-white text-xs text-slate-800 focus:outline-none transition shadow-2xs ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-slate-200/90 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      Konfirmasi kata sandi tidak cocok
                    </p>
                  )}
                </div>

                {/* Shopee Signature: Logout from other devices checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={logoutOtherDevices}
                    onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    Keluarkan akun dari semua perangkat lain demi keamanan setelah kata sandi diubah.
                  </span>
                </label>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                    className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Kata Sandi Baru"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION (SHOPEE STYLE) */}
            {passwordStep === "success" && (
              <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xs">
                  <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Kata Sandi Berhasil Diperbarui!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Kata sandi baru Anda telah aktif. Notifikasi konfirmasi keamanan telah dikirimkan ke email terdaftar Anda.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-mono text-left space-y-1">
                  <div className="flex justify-between">
                    <span>Waktu Perubahan:</span>
                    <strong className="text-slate-700">Baru saja</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Sesi Lain:</span>
                    <strong className="text-emerald-600">{logoutOtherDevices ? "Telah Dikeluarkan" : "Tetap Login"}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="w-full py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </div>
  );
};
