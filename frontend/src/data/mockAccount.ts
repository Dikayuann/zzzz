import type { AuditLogItem } from "@/types/account";

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
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
    action: "Invited new team member (hani@domainanda.com)",
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
    timestamp: "Sep 20, 2026, 16:45",
    status: "Success",
  },
];
