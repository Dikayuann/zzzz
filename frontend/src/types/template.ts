export type TemplateChannel = "email" | "telegram" | "whatsapp";

export interface RecipientPreview {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  customAttributes?: Record<string, string>;
}

export interface TemplateData {
  id: string;
  title: string;
  channel: TemplateChannel;
  subject: string;
  preheader?: string;
  content: string;
  orgName: string;
  senderEmail: string;
  brandColor?: string;
  // Custom Logo Block
  enableLogo?: boolean;
  logoUrl?: string;
  logoWidth?: number;
  logoAlign?: "left" | "center" | "right";
  // Mailchimp CTA Button Block
  enableCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaColor?: string;
  // Mailchimp Social Links & Footer Block
  enableSocial?: boolean;
  websiteUrl?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  footerAddress?: string;
  updatedAt?: string;
}

export type ToolbarAction =
  | "undo"
  | "redo"
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "h1"
  | "h2"
  | "bullet"
  | "link";
