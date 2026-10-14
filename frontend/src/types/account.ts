export type AccountTab = "profile" | "security" | "audit";

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  ip: string;
  timestamp: string;
  status: "Success" | "Warning";
}

export type VerificationChannel = "email" | "password" | "authenticator";

export type PasswordStep =
  | "select_method"
  | "verify_otp"
  | "verify_password"
  | "new_password"
  | "success";
