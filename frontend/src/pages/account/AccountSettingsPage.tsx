import React, { useState } from "react";
import { toast } from "sonner";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import type { AccountTab, AuditLogItem } from "@/types/account";
import { INITIAL_AUDIT_LOGS } from "@/data/mockAccount";
import {
  ProfileTab,
  SecurityTab,
  AuditLogTab,
  ChangePasswordModal,
} from "@/components/account";

export const AccountSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  // Profile State
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Admin");
  const [emailAddress, setEmailAddress] = useState("admin@campaignblast.id");
  const [orgName, setOrgName] = useState("Perusahaan Saya");
  const [timezone, setTimezone] = useState("Asia/Jakarta (WIB, UTC+7)");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [lastPasswordChange, setLastPasswordChange] = useState("Diubah 3 bulan yang lalu");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Audit Logs State
  const [auditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perubahan profil berhasil disimpan!", {
      description: `Nama: ${firstName} ${lastName} • Organisasi: ${orgName}`,
    });
  };

  const handlePasswordChanged = (_logoutOthers: boolean) => {
    setLastPasswordChange("Baru saja diubah");
    toast.success("Kata sandi berhasil diperbarui!");
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-4xl">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your profile, security, and activity.
        </p>
      </div>

      {/* 2. Tabs Navigation */}
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

      {/* 3. Tab Content */}
      {activeTab === "profile" && (
        <ProfileTab
          firstName={firstName}
          lastName={lastName}
          emailAddress={emailAddress}
          orgName={orgName}
          timezone={timezone}
          avatarUrl={avatarUrl}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onEmailAddressChange={setEmailAddress}
          onOrgNameChange={setOrgName}
          onTimezoneChange={setTimezone}
          onPhotoUpload={handlePhotoUpload}
          onSave={handleSaveProfile}
        />
      )}

      {activeTab === "security" && (
        <SecurityTab
          lastPasswordChange={lastPasswordChange}
          twoFactorEnabled={twoFactorEnabled}
          onToggleTwoFactor={() => {
            setTwoFactorEnabled(!twoFactorEnabled);
            toast.success(
              twoFactorEnabled
                ? "2FA telah dinonaktifkan."
                : "2FA berhasil diaktifkan dengan aplikasi autentikator!"
            );
          }}
          onChangePasswordClick={() => setIsPasswordModalOpen(true)}
          onSignOutOtherSessions={() => toast.info("Semua sesi perangkat lain telah dicabut.")}
          onOpenLogoutDialog={() => setLogoutDialogOpen(true)}
        />
      )}

      {activeTab === "audit" && <AuditLogTab logs={auditLogs} />}

      {/* 4. Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        emailAddress={emailAddress}
        twoFactorEnabled={twoFactorEnabled}
        onPasswordChanged={handlePasswordChanged}
      />

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </div>
  );
};

export default AccountSettingsPage;
