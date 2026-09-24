export type NotificationType = "campaign" | "gateway" | "quota" | "contacts" | "security" | "schedule";
export type NotificationSeverity = "success" | "warning" | "error" | "info";

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  fullMessage: string;
  type: NotificationType;
  severity: NotificationSeverity;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  channel?: "Email" | "WhatsApp" | "Telegram" | "Multi-Channel" | "System";
  metrics?: {
    total?: number;
    success?: number;
    failed?: number;
    openRate?: string;
    deliveredRate?: string;
  };
  technicalDetails?: {
    campaignId?: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    errorReason?: string;
    fileName?: string;
    provider?: string;
    resetTime?: string;
    location?: string;
  };
  actionLabel?: string;
  actionUrl?: string;
}
