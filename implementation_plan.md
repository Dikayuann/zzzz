# Campaign Blast Platform — Implementation Plan

> Berdasarkan [ROADMAP.md](file:///d:/Code/campaign-blast-api/ROADMAP.md), project ini dibagi menjadi **6 fase** berurutan. Setiap fase fokus pada satu domain fungsional, dimulai dari fondasi (Auth) sampai Broadcast & Analytics.

---

## Status Saat Ini

Yang **sudah selesai** (parsial):

| Komponen | Status | File |
|:---|:---:|:---|
| Prisma schema (Tenant, User, Role, UserRole, EmailVerification) | ✅ | [schema.prisma](file:///d:/Code/campaign-blast-api/prisma/schema.prisma) |
| Register + Email verification + Login | ✅ | [auth.service.ts](file:///d:/Code/campaign-blast-api/src/services/auth.service.ts) |
| JWT middleware | ✅ | [auth.middleware.ts](file:///d:/Code/campaign-blast-api/src/middlewares/auth.middleware.ts) |
| Zod validation (register, verify-email, login) | ✅ | [auth.schema.ts](file:///d:/Code/campaign-blast-api/src/schemas/auth.schema.ts) |
| Swagger config | ✅ | [swagger.ts](file:///d:/Code/campaign-blast-api/src/config/swagger.ts) |

Yang **belum ada**:
- Refresh token, logout, forgot/reset password, change password
- Permission model (`permissions`, `role_permissions` table)
- Semua domain selain Auth (Contacts, Templates, Campaigns, Channels, dll)
- `password_resets` table
- `audit_logs` table
- Contact, List, Tag, Segment, Consent tables
- Template, Campaign, Delivery tables
- SMTP & Telegram config tables

---

## Fase 1 — Lengkapi Authentication & Account (Priority M)

> Menyelesaikan semua endpoint auth yang belum ada sesuai TSD Section 4.1

### 1A. Prisma Schema

#### [MODIFY] [schema.prisma](file:///d:/Code/campaign-blast-api/prisma/schema.prisma)

Tambah model berikut:
- `PasswordReset` — id, userId, tokenHash, expiresAt, usedAt, createdAt → map ke `password_resets`
- `RefreshToken` — id, userId, tokenHash, expiresAt, revokedAt, createdAt → map ke `refresh_tokens` (untuk proper refresh token flow)
- `AuditLog` — id, tenantId, actorUserId, action, entity, entityId, metadataJson, createdAt → map ke `audit_logs`

### 1B. Auth Service — Fitur Baru

#### [MODIFY] [auth.service.ts](file:///d:/Code/campaign-blast-api/src/services/auth.service.ts)

Tambahkan fungsi:
- `refreshToken()` — validasi refresh token, generate access token baru
- `logoutUser()` — revoke refresh token di DB
- `forgotPassword()` — buat token reset, return raw token (nanti kirim via email)
- `resetPassword()` — validasi token + update password hash
- `changePassword()` — cek old password, update ke new password

Fix existing: typo `INVAILID_CREDENTIALS` → `INVALID_CREDENTIALS`

### 1C. Auth Schema — Validasi Baru

#### [MODIFY] [auth.schema.ts](file:///d:/Code/campaign-blast-api/src/schemas/auth.schema.ts)

Tambah schema:
- `refreshTokenSchema` — { refreshToken: string }
- `forgotPasswordSchema` — { email: string }
- `resetPasswordSchema` — { token: string, password: (same policy) }
- `changePasswordSchema` — { currentPassword: string, newPassword: (same policy) }

### 1D. Auth Controller & Routes

#### [MODIFY] [auth.controller.ts](file:///d:/Code/campaign-blast-api/src/controllers/auth.controller.ts)
#### [MODIFY] [auth.routes.ts](file:///d:/Code/campaign-blast-api/src/routes/auth.routes.ts)

Tambah endpoint:
- `POST /api/v1/auth/refresh` — public
- `POST /api/v1/auth/logout` — authenticated
- `POST /api/v1/auth/forgot-password` — public
- `POST /api/v1/auth/reset-password` — public
- `POST /api/v1/users/me/change-password` — authenticated (bisa di route terpisah)

### 1E. Login — Generate Refresh Token

Modifikasi `loginUser()` untuk juga menyimpan dan mengembalikan refresh token.

### 1F. Server Setup

#### [MODIFY] [server.ts](file:///d:/Code/campaign-blast-api/src/server.ts)

- Tambah `setupSwagger(app)` (sudah ada config-nya tapi belum dipanggil)
- Tambah `errorHandler` middleware
- Tambah `dev` script di package.json: `"dev": "tsx watch src/server.ts"`

---

## Fase 2 — Users & Roles Management (Priority M)

> TSD Section 4.2 + FSD Section 3.2

### 2A. Prisma Schema

#### [MODIFY] [schema.prisma](file:///d:/Code/campaign-blast-api/prisma/schema.prisma)

Tambah model:
- `Permission` — id, module, action → map ke `permissions`
- `RolePermission` — roleId, permissionId → map ke `role_permissions`

Tambah field di `User`:
- `invitedBy` (nullable) — referensi ke user yang invite

### 2B. Permission Seed Script

#### [NEW] `src/seeds/permissions.seed.ts`

Seed data:
- 4 predefined roles: `Org Admin`, `Campaign Manager`, `Editor`, `Viewer`
- Permission matrix sesuai FSD Section 5 (modules: users, channels, telegram, contacts, templates, scheduler, broadcast, analytics × actions: view, create, edit, delete, send)

### 2C. RBAC Middleware

#### [NEW] `src/middlewares/rbac.middleware.ts`

- `requirePermission(module, action)` — middleware factory yang cek user role → permissions
- Load permissions dari DB atau cache

### 2D. Users Service, Controller, Routes

#### [NEW] `src/services/user.service.ts`
#### [NEW] `src/controllers/user.controller.ts`
#### [NEW] `src/routes/user.routes.ts`
#### [NEW] `src/schemas/user.schema.ts`

Endpoint:
- `GET /api/v1/users` — list users in tenant (paginated)
- `POST /api/v1/users/invite` — invite user by email + role
- `PATCH /api/v1/users/:id/role` — change user role
- `DELETE /api/v1/users/:id` — deactivate user

### 2E. Roles Service, Controller, Routes

#### [NEW] `src/services/role.service.ts`
#### [NEW] `src/controllers/role.controller.ts`
#### [NEW] `src/routes/role.routes.ts`
#### [NEW] `src/schemas/role.schema.ts`

Endpoint:
- `GET /api/v1/roles` — list roles (system + custom)
- `POST /api/v1/roles` — create custom role with permission matrix

### 2F. Audit Log Utility

#### [NEW] `src/lib/audit.ts`

- `logAudit(tenantId, actorUserId, action, entity, entityId, metadata)` — helper untuk mencatat setiap aksi penting

---

## Fase 3 — Channel Configuration (Priority M)

> TSD Section 4.3 + FSD Section 3.3

### 3A. Prisma Schema

#### [MODIFY] [schema.prisma](file:///d:/Code/campaign-blast-api/prisma/schema.prisma)

Tambah model:
- `SmtpConfig` — id, tenantId, host, port, username, passwordEncrypted, fromName, fromEmail, verifiedAt → map ke `smtp_configs`
- `TelegramBot` — id, userId, botTokenEncrypted, botUsername, connectedAt → map ke `telegram_bots`

### 3B. Encryption Utility

#### [NEW] `src/lib/encryption.ts`

- AES-256-GCM encrypt/decrypt untuk credentials (SMTP password, bot token)
- Menggunakan `ENCRYPTION_KEY` dari .env

### 3C. SMTP Service, Controller, Routes

#### [NEW] `src/services/smtp.service.ts`
#### [NEW] `src/controllers/smtp.controller.ts`
#### [NEW] `src/routes/smtp.routes.ts`
#### [NEW] `src/schemas/smtp.schema.ts`

Endpoint:
- `GET /api/v1/settings/smtp` — get SMTP config (masked password)
- `POST /api/v1/settings/smtp` — save/update SMTP config
- `POST /api/v1/settings/smtp/test` — send test email

### 3D. Telegram Bot Service, Controller, Routes

#### [NEW] `src/services/telegram.service.ts`
#### [NEW] `src/controllers/telegram.controller.ts`
#### [NEW] `src/routes/telegram.routes.ts`
#### [NEW] `src/schemas/telegram.schema.ts`

Endpoint:
- `GET /api/v1/users/me/telegram-bot` — get connected bot info
- `POST /api/v1/users/me/telegram-bot` — connect bot token
- `POST /api/v1/users/me/telegram-bot/test` — send test message
- `DELETE /api/v1/users/me/telegram-bot` — disconnect bot

### 3E. Dependencies Baru

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

---

## Fase 4 — Contacts & Segmentation (Priority M)

> TSD Section 4.4 + FSD Section 3.4

### 4A. Prisma Schema

#### [MODIFY] [schema.prisma](file:///d:/Code/campaign-blast-api/prisma/schema.prisma)

Tambah model:
- `Contact` — id, tenantId, email, phone, telegramChatId, firstName, lastName, customFieldsJson, createdAt
- `List` — id, tenantId, name
- `ListContact` — listId, contactId (M2M)
- `Tag` — id, tenantId, name
- `ContactTag` — contactId, tagId (M2M)
- `Segment` — id, tenantId, name, ruleJson
- `Consent` — id, contactId, channel (email/telegram), status (opted_in/opted_out), updatedAt

### 4B. Contact Service, Controller, Routes

#### [NEW] `src/services/contact.service.ts`
#### [MODIFY] `src/controllers/contact.controller.ts` (sudah ada tapi kosong)
#### [NEW] `src/routes/contact.routes.ts` (sudah ada tapi kosong)
#### [MODIFY] `src/schemas/contact.schema.ts` (sudah ada tapi kosong)

Endpoint:
- `GET /api/v1/contacts` — list contacts (paginated, searchable)
- `POST /api/v1/contacts` — create single contact
- `POST /api/v1/contacts/import` — bulk import CSV/XLSX
- `PATCH /api/v1/contacts/:id` — update contact
- `DELETE /api/v1/contacts/:id` — delete contact
- `POST /api/v1/contacts/:id/consent` — update opt-in/out

### 4C. List & Segment Service

#### [NEW] `src/services/list.service.ts`
#### [NEW] `src/controllers/list.controller.ts`
#### [NEW] `src/routes/list.routes.ts`

- `GET/POST /api/v1/lists`
- `GET/POST /api/v1/segments`

### 4D. CSV/XLSX Import

#### Dependencies:
```bash
npm install multer csv-parse xlsx
npm install -D @types/multer
```

---

## Fase 5 — Templates (Priority M)

> TSD Section 4.5 + FSD Section 3.5

### 5A. Prisma Schema

#### [MODIFY] [schema.prisma](file:///d:/Code/campaign-blast-api/prisma/schema.prisma)

Tambah model:
- `Template` — id, tenantId, name, channelMode (email/telegram/both), category
- `TemplateVersion` — id, templateId, versionNo, contentJson, contentHtml, contentTelegram, createdBy

### 5B. Template Service, Controller, Routes

#### [NEW] `src/services/template.service.ts`
#### [NEW] `src/controllers/template.controller.ts`
#### [NEW] `src/routes/template.routes.ts`
#### [NEW] `src/schemas/template.schema.ts`

Endpoint:
- `GET/POST /api/v1/templates`
- `GET /api/v1/templates/:id/versions`
- `POST /api/v1/templates/:id/preview` — render preview with merge tags
- `POST /api/v1/templates/:id/send-test` — send test message

### 5C. Merge Tag Engine

#### [NEW] `src/lib/merge-tags.ts`

- Parse `{{first_name}}`, `{{email}}`, custom fields
- Replace dengan data contact

---

## Fase 6 — Campaigns, Scheduler & Broadcast (Priority M)

> TSD Section 4.6 + FSD Section 3.6 & 3.7

### 6A. Prisma Schema

#### [MODIFY] [schema.prisma](file:///d:/Code/campaign-blast-api/prisma/schema.prisma)

Tambah model:
- `Campaign` — id, tenantId, ownerUserId, name, templateId, status, channels, audienceRef, scheduledAt, recurrenceRule, approvedBy
- `CampaignRecipient` — id, campaignId, contactId, channel, status (queued/sent/delivered/bounced/failed)
- `DeliveryLog` — id, campaignRecipientId, eventType, eventAt, rawPayloadJson

### 6B. Campaign Service, Controller, Routes

#### [NEW] `src/services/campaign.service.ts`
#### [NEW] `src/controllers/campaign.controller.ts`
#### [NEW] `src/routes/campaign.routes.ts`
#### [NEW] `src/schemas/campaign.schema.ts`

Endpoint:
- `GET/POST /api/v1/campaigns`
- `PATCH /api/v1/campaigns/:id`
- `POST /api/v1/campaigns/:id/approve`
- `POST /api/v1/campaigns/:id/schedule`
- `POST /api/v1/campaigns/:id/send-now`
- `POST /api/v1/campaigns/:id/cancel`
- `GET /api/v1/campaigns/:id/report`

### 6C. Queue & Worker System

#### [NEW] `src/workers/email.worker.ts`
#### [NEW] `src/workers/telegram.worker.ts`
#### [NEW] `src/lib/queue.ts`

- Untuk Phase 1: simple in-process queue menggunakan `bull` atau `bullmq` + Redis
- Rate limiting / throttling per channel
- Status tracking per recipient

### 6D. Webhook Endpoints

#### [NEW] `src/routes/webhook.routes.ts`
#### [NEW] `src/controllers/webhook.controller.ts`

- `POST /api/v1/webhooks/esp` — ESP delivery events
- `POST /api/v1/webhooks/telegram` — Telegram bot updates

### 6E. Dependencies Baru

```bash
npm install bullmq ioredis
```

---

## Open Questions

> [!IMPORTANT]
> **Database**: Saat ini menggunakan **MySQL/MariaDB**. ROADMAP menyebutkan **PostgreSQL 15+**. Apakah ingin tetap pakai MySQL atau migrate ke PostgreSQL?

> [!IMPORTANT]
> **Queue System**: ROADMAP menyebutkan **RabbitMQ** untuk queue/workers. Apakah ingin pakai RabbitMQ, atau alternatif yang lebih ringan seperti **BullMQ + Redis** untuk Phase 1?

> [!IMPORTANT]
> **Mulai dari Fase mana?** Secara berurutan saya akan mulai dari **Fase 1** (lengkapi Auth). Apakah setuju, atau ingin prioritas lain?

---

## Verification Plan

### Automated Tests
Setiap fase akan diverifikasi dengan:
- `npx prisma migrate dev` — memastikan schema valid
- `npx tsx src/server.ts` — memastikan server berjalan tanpa error
- Test manual via Swagger UI (`/api-docs`) atau curl/Postman

### Manual Verification
- Test setiap endpoint via Swagger UI atau HTTP client
- Verifikasi response format dan error handling
