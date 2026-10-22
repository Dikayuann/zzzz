import React, { useState } from "react";
import {
  Plus,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type UserRole = "Org Admin" | "Campaign Manager" | "Editor" | "Viewer";
export type MemberStatus = "Active" | "Pending";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  joinedDate: string;
  initialsBg: string;
  initialsColor: string;
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "mem-1",
    name: "Sarah Admin",
    email: "sarah@domainanda.com",
    role: "Org Admin",
    status: "Active",
    joinedDate: "Jan 1, 2026",
    initialsBg: "bg-indigo-100",
    initialsColor: "text-indigo-700",
  },
  {
    id: "mem-2",
    name: "Rizky Pratama",
    email: "rizky@domainanda.com",
    role: "Campaign Manager",
    status: "Active",
    joinedDate: "Feb 14, 2026",
    initialsBg: "bg-blue-100",
    initialsColor: "text-blue-700",
  },
  {
    id: "mem-3",
    name: "Lina Kusuma",
    email: "lina@domainanda.com",
    role: "Editor",
    status: "Active",
    joinedDate: "Mar 3, 2026",
    initialsBg: "bg-emerald-100",
    initialsColor: "text-emerald-700",
  },
  {
    id: "mem-4",
    name: "Doni Wicaksono",
    email: "doni@domainanda.com",
    role: "Viewer",
    status: "Active",
    joinedDate: "Apr 20, 2026",
    initialsBg: "bg-amber-100",
    initialsColor: "text-amber-700",
  },
  {
    id: "mem-5",
    name: "Hani Ramadhani",
    email: "hani@domainanda.com",
    role: "Campaign Manager",
    status: "Pending",
    joinedDate: "Sep 10, 2026",
    initialsBg: "bg-purple-100",
    initialsColor: "text-purple-700",
  },
];

const PERMISSIONS_LIST = [
  {
    permission: "Create & edit campaign drafts",
    admin: true,
    manager: true,
    editor: true,
    viewer: false,
  },
  {
    permission: "Trigger & blast broadcast messages",
    admin: true,
    manager: true,
    editor: false,
    viewer: false,
  },
  {
    permission: "Manage contacts & audience lists",
    admin: true,
    manager: true,
    editor: true,
    viewer: false,
  },
  {
    permission: "Configure delivery channels (SMTP, Meta API, Telegram)",
    admin: true,
    manager: false,
    editor: false,
    viewer: false,
  },
  {
    permission: "Invite & remove team members",
    admin: true,
    manager: false,
    editor: false,
    viewer: false,
  },
  {
    permission: "View performance analytics & logs",
    admin: true,
    manager: true,
    editor: true,
    viewer: true,
  },
  {
    permission: "Export contact database & reports",
    admin: true,
    manager: true,
    editor: false,
    viewer: false,
  },
];

export const UsersRolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"members" | "matrix">("members");
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);

  // Invite Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("Campaign Manager");

  // Remove confirmation modal
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    const target = members.find((m) => m.id === memberId);
    toast.success(`Role untuk ${target?.name || "member"} diubah ke ${newRole}`);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Alamat email wajib diisi!");
      return;
    }

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "Pending",
      joinedDate: "Hari ini",
      initialsBg: "bg-purple-100",
      initialsColor: "text-purple-700",
    };

    setMembers((prev) => [...prev, newMember]);
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteName("");
    toast.success(`Undangan berhasil dikirim ke ${newMember.email}`, {
      description: `Peran: ${newMember.role}. Member akan menerima email aktivasi.`,
    });
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
    toast.info(`${memberToRemove.name} telah dihapus dari workspace.`);
    setMemberToRemove(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 max-w-5xl">
      {/* 1. TOP HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Users & Roles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your team members and their permissions.
          </p>
        </div>

        {/* Invite Member Button */}
        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Invite member</span>
        </button>
      </div>

      {/* 2. TABS: Team Members & Permission Matrix */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`pb-3 text-sm font-semibold transition cursor-pointer relative ${
              activeTab === "members"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Team Members
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`pb-3 text-sm font-semibold transition cursor-pointer relative ${
              activeTab === "matrix"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Permission Matrix
          </button>
        </nav>
      </div>

      {/* 3. TAB 1: TEAM MEMBERS DATA TABLE (EXACT MATCH TO SCREENSHOT) */}
      {activeTab === "members" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-4 pl-6 pr-4 font-bold">MEMBER</th>
                  <th className="py-4 px-6 font-bold">ROLE</th>
                  <th className="py-4 px-6 font-bold">STATUS</th>
                  <th className="py-4 px-6 font-bold">JOINED</th>
                  <th className="py-4 pr-6 pl-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {members.map((member) => {
                  const isOrgAdmin = member.role === "Org Admin";
                  const isPending = member.status === "Pending";

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* 1. MEMBER */}
                      <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full ${member.initialsBg} ${member.initialsColor} font-bold text-xs flex items-center justify-center flex-shrink-0`}
                          >
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight text-xs">
                              {member.name}
                            </span>
                            <span className="text-slate-400 text-xs mt-0.5 block">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. ROLE */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member.id, e.target.value as UserRole)
                            }
                            className="appearance-none bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 font-medium text-xs rounded-xl pl-3.5 pr-8 py-2 border border-transparent focus:outline-none focus:border-indigo-400 transition cursor-pointer"
                          >
                            <option value="Org Admin">Org Admin</option>
                            <option value="Campaign Manager">Campaign Manager</option>
                            <option value="Editor">Editor</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* 3. STATUS */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            <span>Pending</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </div>
                        )}
                      </td>

                      {/* 4. JOINED */}
                      <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap font-normal">
                        {member.joinedDate}
                      </td>

                      {/* 5. ACTION (REMOVE) */}
                      <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap">
                        {!isOrgAdmin && (
                          <button
                            type="button"
                            onClick={() => setMemberToRemove(member)}
                            className="text-rose-500 hover:text-rose-600 text-xs font-semibold transition cursor-pointer hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB 2: RBAC PERMISSION MATRIX */}
      {activeTab === "matrix" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-4 pl-6 pr-4 min-w-[280px]">PERMISSION / CAPABILITY</th>
                  <th className="py-4 px-4 text-center min-w-[120px]">ORG ADMIN</th>
                  <th className="py-4 px-4 text-center min-w-[150px]">CAMPAIGN MANAGER</th>
                  <th className="py-4 px-4 text-center min-w-[120px]">EDITOR</th>
                  <th className="py-4 pr-6 pl-4 text-center min-w-[120px]">VIEWER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {PERMISSIONS_LIST.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-6 pr-4 font-medium text-slate-800">
                      {item.permission}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.admin ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.manager ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.editor ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>

                    <td className="py-3.5 pr-6 pl-4 text-center">
                      {item.viewer ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. INVITE MEMBER MODAL */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Invite team member
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Send an email invitation with a specific role to join your workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email address *</label>
              <input
                type="email"
                required
                placeholder="nama@domainanda.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Assign Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Org Admin">Org Admin (Full access to all settings)</option>
                <option value="Campaign Manager">Campaign Manager (Can create & blast)</option>
                <option value="Editor">Editor (Can create & edit drafts)</option>
                <option value="Viewer">Viewer (Read-only access)</option>
              </select>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-sm transition cursor-pointer"
              >
                Send Invitation
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. REMOVE CONFIRMATION MODAL */}
      <Dialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Remove team member?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to remove <strong>{memberToRemove?.name}</strong> ({memberToRemove?.email}) from this workspace? They will lose all access immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 gap-2">
            <button
              type="button"
              onClick={() => setMemberToRemove(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemove}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
            >
              Yes, Remove
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
