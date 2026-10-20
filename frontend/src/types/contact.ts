export type ContactStatus = "Active" | "Unsubscribed" | "Bounced";

export interface ContactConsent {
  email: boolean;
  telegram: boolean;
  whatsapp: boolean;
}

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  consent: ContactConsent;
  status: ContactStatus;
  joinedDate: string;
  tags: string[];
  listId?: string;
  initialsBg?: string;
  initialsColor?: string;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  contactCount?: number;
}
