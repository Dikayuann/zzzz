export type ChannelTab = "email" | "telegram" | "whatsapp";
export type WaSubTab = "meta" | "qrcode";

export interface MetaWaConfig {
  phoneNumberId: string;
  accessToken: string;
  wabaId: string;
}

export interface SmtpConfig {
  preset: "custom" | "gmail" | "sendgrid" | "ses" | "brevo" | "zoho";
  host: string;
  port: string;
  encryption: "TLS" | "SSL" | "None";
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  hasPassword?: boolean;
}

export interface TelegramConfig {
  botToken: string;
  botUsername: string;
  targetChatId: string;
  parseMode: "HTML" | "MarkdownV2";
}

export interface TelegramSubscriber {
  id: number;
  name: string;
  teleChatId: string;
  customFields?: { telegramUsername?: string };
  createdAt: string;
}
