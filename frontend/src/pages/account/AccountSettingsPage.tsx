import React, { useState } from "react";
import {
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

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

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

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

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Masukkan kata sandi saat ini!");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    toast.success("Kata sandi berhasil diperbarui!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
          {/* Change Password Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Password & Authentication
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui kata sandi akun Anda untuk menjaga keamanan akses.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Update password
              </button>
            </form>
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
    </div>
  );
};
