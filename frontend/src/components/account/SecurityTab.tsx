import { Key, Shield, Smartphone, CheckCircle2, LogOut } from "lucide-react";

interface SecurityTabProps {
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  onToggleTwoFactor: () => void;
  onChangePasswordClick: () => void;
  onSignOutOtherSessions: () => void;
  onOpenLogoutDialog: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  lastPasswordChange,
  twoFactorEnabled,
  onToggleTwoFactor,
  onChangePasswordClick,
  onSignOutOtherSessions,
  onOpenLogoutDialog,
}) => {
  return (
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Secure
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
            onClick={onChangePasswordClick}
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
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
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
            onClick={onToggleTwoFactor}
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
          onClick={onSignOutOtherSessions}
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
            onClick={onOpenLogoutDialog}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
