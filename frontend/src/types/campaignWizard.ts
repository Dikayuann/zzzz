import type { LucideIcon } from "lucide-react";

export type DeliveryChannel = "Email" | "Telegram" | "WhatsApp";

export interface PresetTemplate {
  id: string;
  name: string;
  badge: string;
  desc: string;
  icon: LucideIcon;
  iconColor: string;
  emailSubject: string;
  emailContent: string;
  waContent: string;
  telegramContent: string;
}

export interface SenderProfile {
  id: string;
  name: string;
  email: string;
  quota: string;
  badge: string;
}

export interface AudienceOption {
  id: string;
  name: string;
  desc: string;
  count: number;
  badge: string;
}

export interface DraftPayload {
  campaignName: string;
  selectedChannels: DeliveryChannel[];
  emailSender: string;
  replyToEmail: string;
  selectedAudience: string;
  selectedTemplateId: string;
  activeTemplateTab: DeliveryChannel;
  emailSubject: string;
  emailContent: string;
  waContent: string;
  telegramContent: string;
  scheduleType: "instant" | "scheduled";
  scheduledDate: string;
  scheduledTime: string;
  throttleRate: string;
  currentStep: number;
  maxStepReached: number;
  updatedAt: string;
  emailBrandName?: string;
  emailHeaderStyle?: "clean" | "banner" | "minimal";
  emailCtaEnabled?: boolean;
  emailCtaText?: string;
  emailCtaUrl?: string;
  emailCtaColor?: string;
  emailEditorMode?: "visual" | "html";
  emailThemeId?: string;
}
