export type CampaignChannel = "Email" | "Telegram" | "WhatsApp";
export type CampaignStatus = "Sent" | "Sending" | "Scheduled" | "Draft" | "Failed";

export interface CampaignItem {
  id: string;
  name: string;
  date: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: string;
  audienceCount: number;
  sentCount: number;
  failedCount: number;
  openRate: number | null;
  clickRate: number | null;
  subject?: string;
  messageContent: string;
  scheduledTime?: string;
  hasAttention?: boolean;
}
