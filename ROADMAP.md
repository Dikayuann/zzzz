# Campaign Blast Platform - Technical & Functional Specification

> Dokumen ini diekstrak 1:1 langsung dari tabel resmi dokumen **TSD_Campaign-Blast-Platform.docx** dan **FSD-SRS_Campaign-Blast-Platform.docx** tanpa penambahan ataupun pengurangan entitas.

---

## 1. Technology Stack (TSD Section 2.2)

| Layer | Technology |
| :--- | :--- |
| Frontend | React + TypeScript, TailwindCSS, React Query |
| Backend API | Node.js (NestJS) or equivalent REST framework |
| Auth | JWT (access + refresh tokens), bcrypt/argon2 password hashing |
| Database | PostgreSQL 15+ (primary), Redis (cache/queue support) |
| Queue / Workers | RabbitMQ; worker processes in Node.js |
| File Storage | Local filesystem (e.g. Node.js multer disk storage) in Phase 1 — no cloud object storage; a self-hosted option (e.g. MinIO) can be introduced later only if image/attachment volume grows |
| Email Sending | SMTP (via nodemailer or equivalent), using organization-configured SMTP credentials |
| Telegram Sending | Telegram Bot API, using each individual user's own connected bot token |
| Monitoring | Sentry (error tracking) — infrastructure/metrics monitoring to be defined in a later phase |

---

## 2. Data Model (TSD Section 3)

### 3.1 Identity & Access

| Table | Key Columns |
| :--- | :--- |
| `tenants` | id, name, status, created_at |
| `users` | id, tenant_id, name, email (unique), password_hash, status, mfa_enabled, last_login_at |
| `roles` | id, tenant_id (null = system role), name, is_custom |
| `permissions` | id, module, action (view/create/edit/delete/send) |
| `role_permissions` | role_id, permission_id |
| `user_roles` | user_id, role_id |
| `password_resets` | id, user_id, token_hash, expires_at, used_at |
| `audit_logs` | id, tenant_id, actor_user_id, action, entity, entity_id, metadata_json, created_at |

### 3.2 Channel Configuration

| Table | Key Columns |
| :--- | :--- |
| `smtp_configs` | id, tenant_id, host, port, username, password_encrypted, from_name, from_email, verified_at |
| `telegram_bots` | id, user_id, bot_token_encrypted, bot_username, connected_at — one bot per user, not per tenant |

### 3.3 Contacts & Segmentation

| Table | Key Columns |
| :--- | :--- |
| `contacts` | id, tenant_id, email, phone, telegram_chat_id, first_name, last_name, custom_fields_json, created_at |
| `lists` | id, tenant_id, name |
| `list_contacts` | list_id, contact_id |
| `tags` | id, tenant_id, name |
| `contact_tags` | contact_id, tag_id |
| `segments` | id, tenant_id, name, rule_json |
| `consents` | id, contact_id, channel (email/telegram), status (opted_in/opted_out), updated_at |

### 3.4 Templates, Campaigns & Delivery

| Table | Key Columns |
| :--- | :--- |
| `templates` | id, tenant_id, name, channel_mode (email/telegram/both), category |
| `template_versions` | id, template_id, version_no, content_json, content_html, content_telegram, created_by |
| `campaigns` | id, tenant_id, owner_user_id, name, template_id, status, channels, audience_ref, scheduled_at, recurrence_rule, approved_by |
| `campaign_recipients` | id, campaign_id, contact_id, channel, status (queued/sent/delivered/bounced/failed) |
| `delivery_logs` | id, campaign_recipient_id, event_type (sent/delivered/opened/clicked/bounced/failed/blocked), event_at, raw_payload_json |

---

## 3. API Design (TSD Section 4)

### 4.1 Authentication & Account

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Create tenant + first Org Admin user; sends verification email |
| `POST` | `/api/v1/auth/verify-email` | Verify email via token |
| `POST` | `/api/v1/auth/login` | Authenticate; returns access + refresh token |
| `POST` | `/api/v1/auth/refresh` | Exchange refresh token for new access token |
| `POST` | `/api/v1/auth/logout` | Invalidate current session/refresh token |
| `POST` | `/api/v1/auth/forgot-password` | Send password reset email |
| `POST` | `/api/v1/auth/reset-password` | Reset password using token |
| `POST` | `/api/v1/users/me/change-password` | Change password (requires current password) |
| `POST` | `/api/v1/auth/2fa/enable` | Enable TOTP 2FA; returns QR/secret |

### 4.2 Users & Roles

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/users` | List users in current tenant |
| `POST` | `/api/v1/users/invite` | Invite a new user by email with a role |
| `PATCH` | `/api/v1/users/{id}/role` | Change a user's role |
| `DELETE` | `/api/v1/users/{id}` | Deactivate/remove a user |
| `GET` | `/api/v1/roles` | List predefined + custom roles |
| `POST` | `/api/v1/roles` | Create a custom role with permission matrix |

### 4.3 Channel Configuration

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET/POST` | `/api/v1/settings/smtp` | Get / set the organization's SMTP configuration |
| `POST` | `/api/v1/settings/smtp/test` | Send a test email using the configured SMTP settings |
| `GET/POST` | `/api/v1/users/me/telegram-bot` | Get / connect the current user's personal Telegram bot token |
| `POST` | `/api/v1/users/me/telegram-bot/test` | Send a test message using the current user's connected bot |
| `DELETE` | `/api/v1/users/me/telegram-bot` | Disconnect the current user's Telegram bot |

### 4.4 Contacts & Segmentation

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET/POST` | `/api/v1/contacts` | List / create contacts |
| `POST` | `/api/v1/contacts/import` | Bulk import via CSV/XLSX |
| `PATCH/DELETE` | `/api/v1/contacts/{id}` | Update / delete a contact |
| `GET/POST` | `/api/v1/lists` | List / create contact lists |
| `GET/POST` | `/api/v1/segments` | List / create dynamic segments |
| `POST` | `/api/v1/contacts/{id}/consent` | Update opt-in/opt-out status |

### 4.5 Templates

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET/POST` | `/api/v1/templates` | List / create templates |
| `GET` | `/api/v1/templates/{id}/versions` | Get version history |
| `POST` | `/api/v1/templates/{id}/preview` | Render preview per channel with sample merge data |
| `POST` | `/api/v1/templates/{id}/send-test` | Send test message to a test contact/list |

### 4.6 Campaigns (Scheduler & Broadcast)

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET/POST` | `/api/v1/campaigns` | List / create campaigns |
| `PATCH` | `/api/v1/campaigns/{id}` | Update a draft/scheduled campaign |
| `POST` | `/api/v1/campaigns/{id}/approve` | Approve a campaign pending review |
| `POST` | `/api/v1/campaigns/{id}/schedule` | Schedule campaign at a future date/time |
| `POST` | `/api/v1/campaigns/{id}/send-now` | Send campaign immediately |
| `POST` | `/api/v1/campaigns/{id}/cancel` | Cancel a scheduled (not-yet-sent) campaign |
| `GET` | `/api/v1/campaigns/{id}/report` | Get delivery/engagement analytics |
| `POST` | `/api/v1/webhooks/esp` | ESP delivery/engagement event webhook |
| `POST` | `/api/v1/webhooks/telegram` | Telegram Bot update webhook (status, replies, blocks) |

---

## 4. Role Permission Matrix (FSD Section 5)

| Module / Action | Org Admin | Campaign Mgr | Editor | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| Users & Roles | VED | — | — | — |
| Channel Config (SMTP) | VED | — | — | — |
| Telegram Bot (own account) | VED | VED | VED | — |
| Contacts | VED | VED | VE | V |
| Templates | VED | VED | VE | V |
| Scheduler | VED | VED | V | V |
| Broadcast / Send | VED | VED | — | V |
| Analytics / Reports | VED | VED | V | V |

---

## 5. Functional Requirements (FSD Section 3)

### 3.1 Authentication & Password Management

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :---: |
| FR-AUTH-01 | User Registration | New user can sign up with name, email, and password; email verification link is sent and required before first login. | M |
| FR-AUTH-02 | Login | Registered user logs in with email + password; invalid attempts show generic error (no user enumeration). | M |
| FR-AUTH-03 | Forgot / Reset Password | User requests a reset link via email; link/token expires after 30 minutes and is single-use. | M |
| FR-AUTH-04 | Change Password | Logged-in user changes password by providing current password + new password meeting policy. | M |
| FR-AUTH-05 | Password Policy | Minimum 8 characters, upper + lower case, number, and symbol; passwords stored as salted hash, never plain text. | M |
| FR-AUTH-06 | Session / Token Management | Access token expires (e.g. 60 min) with refresh token flow; explicit logout invalidates session; "remember me" option. | M |
| FR-AUTH-07 | Account Lockout | Account is temporarily locked after 5 consecutive failed login attempts; unlock via email or timed cooldown. | S |
| FR-AUTH-08 | Two-Factor Authentication (2FA) | Optional TOTP-based 2FA (authenticator app) enabled per user. | C |
| FR-AUTH-09 | Single Sign-On (SSO) | Optional login via Google/Microsoft OAuth for Enterprise plan tenants. | C |

### 3.2 Role & Access Management

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :---: |
| FR-ROLE-01 | Predefined Roles | System ships with predefined roles: Org Admin, Campaign Manager, Editor, Viewer (see 2.2). | M |
| FR-ROLE-02 | Assign / Change Role | Org Admin can invite users and assign/change their role at any time. | M |
| FR-ROLE-03 | Permission Enforcement | Every module (Contacts, Templates, Scheduler, Broadcast, Billing, Settings) enforces action-level permissions per role on both UI and API. | M |
| FR-ROLE-04 | Custom Roles | Org Admin can create custom roles with a granular permission matrix (view/create/edit/delete/send per module). | S |
| FR-ROLE-05 | Team Invitation | Org Admin invites teammates by email; invitee sets password via invite link to join the tenant. | M |
| FR-ROLE-06 | Remove / Deactivate User | Org Admin can deactivate or remove a user, revoking all sessions and access immediately. | M |
| FR-ROLE-07 | Audit Log | All role changes, user invites/removals, and permission-sensitive actions are logged with actor, timestamp, and action. | S |

### 3.3 Channel & Sending Configuration

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :---: |
| FR-CHN-01 | SMTP Configuration | Org Admin configures an SMTP server (host, port, username, password, from-name/address) used for all outbound email campaigns. | M |
| FR-CHN-02 | Personal Telegram Bot Connection | Each individual user connects their own Telegram Bot token (created via BotFather) under their account/profile settings; the user's campaigns send through their own bot. | M |
| FR-CHN-03 | Connection Test | User can send a test SMTP email or Telegram message to verify a configured connection before using it in a campaign. | M |
| FR-CHN-04 | Credential Storage | SMTP passwords and Telegram bot tokens are stored encrypted and are never displayed in full after saving. | M |
| FR-CHN-05 | Disconnect / Replace Token | User can disconnect or replace their Telegram bot token or SMTP credentials at any time. | S |

### 3.4 Contact Management

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :---: |
| FR-CON-01 | Import Contacts | Import contacts via CSV/XLSX with column mapping and validation (email format, phone/Telegram ID format). | M |
| FR-CON-02 | Manual Contact CRUD | Create, view, edit, and delete individual contacts and their custom fields. | M |
| FR-CON-03 | Duplicate Detection | System detects and offers to merge duplicate contacts by email or phone. | S |
| FR-CON-04 | Lists & Tags | Group contacts into static lists and apply tags for filtering. | M |
| FR-CON-05 | Dynamic Segments | Build rule-based segments (e.g. tag = VIP AND channel = Telegram) with live matching contact count. | S |
| FR-CON-06 | Consent & Suppression | Track opt-in/opt-out per channel; suppressed contacts are automatically excluded from all future sends. | M |

### 3.5 Rich Text Template Editor

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :---: |
| FR-TPL-01 | WYSIWYG Editor | Rich text editor supporting bold/italic/underline, links, images, lists, headings, and text alignment. | M |
| FR-TPL-02 | Personalization / Merge Tags | Insert dynamic placeholders (e.g. {{first_name}}) with live preview substitution. | M |
| FR-TPL-03 | Template Library | Save, categorize, search, and reuse templates; template version history. | M |
| FR-TPL-04 | Channel-Specific Rendering | Preview and export template appropriately for Email (responsive HTML) and Telegram (supported Markdown/HTML subset). | M |
| FR-TPL-05 | Telegram Rich Elements | Support inline buttons/links and media attachments within Telegram-mode templates. | S |
| FR-TPL-06 | Send Test Message | Send a test version of a template/campaign to a designated test contact or list before broadcasting. | M |

### 3.6 Scheduler Management

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :---: |
| FR-SCH-01 | Send Now / Later | Campaign can be sent immediately or scheduled for a specific future date, time, and timezone. | M |
| FR-SCH-02 | Recurring Campaigns | Support recurrence rules (daily/weekly/monthly) for repeat campaigns. | S |
| FR-SCH-03 | Edit / Cancel Scheduled Send | A scheduled (not-yet-sent) campaign can be edited or cancelled. | M |
| FR-SCH-04 | Send Throttling | Sending is rate-limited per channel to respect ESP/Telegram API limits and improve deliverability. | M |
| FR-SCH-05 | Campaign Status Tracking | Each campaign has a visible status: Draft, Scheduled, Sending, Sent, Failed, Paused. | M |

### 3.7 Broadcast / Blast Message Management

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :---: |
| FR-BRD-01 | Campaign Creation Wizard | Guided flow: select channel(s) → select audience → select/build template → schedule → review → send. | M |
| FR-BRD-02 | Multi-Channel Campaign | A single campaign can be sent via Email and Telegram together to the same or different audiences. | S |
| FR-BRD-03 | Approval Workflow | Optional approval step where a Campaign Manager/Admin must approve a Draft before it can be scheduled or sent. | C |
| FR-BRD-04 | Delivery Tracking | Track sent, delivered, bounced, and failed status per recipient per channel. | M |
| FR-BRD-05 | Engagement Tracking | Track email opens/clicks and Telegram button interactions/replies. | S |
| FR-BRD-06 | Campaign Analytics Dashboard | Summarized metrics per campaign (sent/delivered/opened/clicked/bounced/unsubscribed) with export to CSV/PDF. | M |

---

## 6. Non-Functional Requirements (FSD Section 4)

| Category | Requirement |
| :--- | :--- |
| Security | All traffic over HTTPS/TLS; passwords hashed (bcrypt/argon2); PII encrypted at rest; RBAC enforced server-side on every endpoint. |
| Privacy / Compliance | Support unsubscribe/opt-out (CAN-SPAM/GDPR-style) and consent tracking; support data export/delete on request; align with applicable local data-protection regulation (e.g. Indonesia's PDP Law) for tenants operating there. |
| Performance | Campaign send queue must process at a configurable throughput (e.g. ≥ 50 msgs/sec) without blocking the UI. |
| Scalability | Support tenants with contact lists up to at least 1,000,000 contacts without degradation to core workflows. |
| Availability | Target 99.5% uptime for core sending and login services; scheduled maintenance communicated in advance. |
| Usability | Campaign creation wizard completable by a non-technical marketing user in under 10 minutes for a standard blast. |
| Auditability | All authentication, role, billing, and send actions are logged with actor, timestamp, and outcome. |
| Localization | UI supports English and Bahasa Indonesia at minimum. |
