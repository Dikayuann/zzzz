import React from "react";
import { ChevronDown } from "lucide-react";

interface ProfileTabProps {
  firstName: string;
  lastName: string;
  emailAddress: string;
  orgName: string;
  timezone: string;
  avatarUrl: string | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailAddressChange: (value: string) => void;
  onOrgNameChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  firstName,
  lastName,
  emailAddress,
  orgName,
  timezone,
  avatarUrl,
  onFirstNameChange,
  onLastNameChange,
  onEmailAddressChange,
  onOrgNameChange,
  onTimezoneChange,
  onPhotoUpload,
  onSave,
}) => {
  return (
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
              onChange={onPhotoUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="border-b border-slate-100" />

      {/* Form Fields */}
      <form onSubmit={onSave} className="space-y-4">
        {/* Row 1: First name & Last name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
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
              onChange={(e) => onLastNameChange(e.target.value)}
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
            onChange={(e) => onEmailAddressChange(e.target.value)}
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
            onChange={(e) => onOrgNameChange(e.target.value)}
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
              onChange={(e) => onTimezoneChange(e.target.value)}
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
  );
};
