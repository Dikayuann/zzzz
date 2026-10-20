import { useState, useEffect, useRef, useMemo } from "react";
import { api } from "@/lib/api";
import { type DatabaseTemplateItem } from "@/components/templates";
import type {
  TemplateChannel,
  RecipientPreview,
} from "@/types/template";
import {
  SAMPLE_RECIPIENTS,
  DEFAULT_WA_CONTENT,
  DEFAULT_TELEGRAM_CONTENT,
} from "@/utils/templateParser";
import { type PresetTemplate } from "@/data/presetTemplates";
import { toast } from "sonner";

const STORAGE_KEY = "campaign_current_template_v2";
const SNAPSHOT_KEY = "campaign_last_saved_snapshot_v2";

export function resolveChannelFromTemplate(
  item: DatabaseTemplateItem,
  currentChannel: TemplateChannel = "email"
): TemplateChannel {
  const mode = item.channelMode?.toLowerCase()?.trim();
  const latestVersion = item.versions?.[0];
  const hasHtml = Boolean(latestVersion?.contentHtml?.trim());
  const hasWa = Boolean(
    latestVersion?.contentWhatsapp?.trim() &&
    latestVersion.contentWhatsapp !== DEFAULT_WA_CONTENT
  );
  const hasTg = Boolean(
    latestVersion?.contentTelegram?.trim() &&
    latestVersion.contentTelegram !== DEFAULT_TELEGRAM_CONTENT
  );

  // 1. Explicit standard channel
  if (mode === "email") return "email";
  if (mode === "whatsapp") return "whatsapp";
  if (mode === "telegram") return "telegram";

  // 2. Name hint (e.g. "Template email" or "Promo WA")
  const nameLower = (item.name || "").toLowerCase();
  if (nameLower.includes("email") && hasHtml) return "email";
  if (nameLower.includes("whatsapp") && hasWa) return "whatsapp";
  if (nameLower.includes("telegram") && hasTg) return "telegram";

  // 3. Match current active channel if that channel has content in this template
  if (currentChannel === "email" && hasHtml) return "email";
  if (currentChannel === "whatsapp" && hasWa) return "whatsapp";
  if (currentChannel === "telegram" && hasTg) return "telegram";

  // 4. Content availability priority
  if (hasHtml) return "email";
  if (hasWa) return "whatsapp";
  if (hasTg) return "telegram";

  return currentChannel === "whatsapp" || currentChannel === "telegram" ? currentChannel : "email";
}

export function useTemplateEditor() {
  // Database tracking: id if loaded from DB, null if new custom
  const [templateId, setTemplateId] = useState<number | null>(null);

  // Core template state
  const [title, setTitle] = useState("Template Kustom");
  const [channel, setChannel] = useState<TemplateChannel>("email");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [whatsappContent, setWhatsappContent] = useState(DEFAULT_WA_CONTENT);
  const [telegramContent, setTelegramContent] = useState(DEFAULT_TELEGRAM_CONTENT);
  const [whatsappMediaUrl, setWhatsappMediaUrl] = useState("");
  const [telegramMediaUrl, setTelegramMediaUrl] = useState("");
  const [recipient, setRecipient] = useState<RecipientPreview>(SAMPLE_RECIPIENTS[0]);

  // Active channel content accessor
  const content =
    channel === "whatsapp"
      ? whatsappContent
      : channel === "telegram"
      ? telegramContent
      : emailContent;

  // Gambar aktif menyesuaikan tab channel yang sedang dibuka
  const mediaUrl =
      channel === "whatsapp"
          ? whatsappMediaUrl
          : channel === "telegram"
              ? telegramMediaUrl
              : "";
  const setMediaUrl = (val: string) => {
    if (channel === "whatsapp") {
      setWhatsappMediaUrl(val);
    } else if (channel === "telegram") {
      setTelegramMediaUrl(val);
    }
  };


  const setContent = (val: string | ((prev: string) => string)) => {
    if (channel === "whatsapp") {
      setWhatsappContent(val);
    } else if (channel === "telegram") {
      setTelegramContent(val);
    } else {
      setEmailContent(val);
    }
  };

  // Saved templates from DB
  const [savedTemplates, setSavedTemplates] = useState<DatabaseTemplateItem[]>([]);

  // Custom Logo state
  const [enableLogo, setEnableLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoWidth, setLogoWidth] = useState(140);
  const [logoAlign, setLogoAlign] = useState<"left" | "center" | "right">("center");

  // Mailchimp Component Blocks state
  const [brandColor, setBrandColor] = useState("#4F46E5");
  const [enableCta, setEnableCta] = useState(false);
  const [ctaText, setCtaText] = useState("Klaim Voucher Sekarang");
  const [ctaUrl, setCtaUrl] = useState("https://tokoonline.com/promo");
  const [ctaColor, setCtaColor] = useState("#4F46E5");
  const [enableSocial, setEnableSocial] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("https://acmecorp.co");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/acmecorp");
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/6281234567890");
  const [footerAddress, setFooterAddress] = useState("");

  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isMergeTagsModalOpen, setIsMergeTagsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Active target field tracking (subject | preheader | content)
  const [activeTarget, setActiveTarget] = useState<"subject" | "preheader" | "content">("subject");

  // Cursor tag insert function hook
  const insertTagRef = useRef<((tag: string, target?: "subject" | "preheader" | "content") => void) | null>(null);

  // Reference to snapshot of last successfully saved or loaded template state
  const lastSavedSnapshotRef = useRef<string | null>(null);

  // Helper to extract clean state snapshot for dirty comparison
  const getNormalizedState = () => ({
    title: title.trim(),
    channel,
    subject: subject.trim(),
    preheader: preheader.trim(),
    emailContent: emailContent.trim(),
    whatsappContent: whatsappContent.trim(),
    telegramContent: telegramContent.trim(),
    brandColor,
    enableLogo,
    logoUrl: logoUrl.trim(),
    logoWidth,
    logoAlign,
    enableCta,
    ctaText: ctaText.trim(),
    ctaUrl: ctaUrl.trim(),
    ctaColor,
    enableSocial,
    websiteUrl: websiteUrl.trim(),
    instagramUrl: instagramUrl.trim(),
    whatsappUrl: whatsappUrl.trim(),
    footerAddress: footerAddress.trim(),
    whatsappMediaUrl: whatsappMediaUrl.trim(),
    telegramMediaUrl: telegramMediaUrl.trim(),
  });

  // Helper to normalize line breaks for robust string comparison
  const normalizeStr = (s?: string) => (s || "").replace(/\r\n/g, "\n").trim();

  // Helper to check whether there is any user-written content on a new template
  const hasUserWrittenContent = () => {
    // 1. Email content
    const hasEmail = Boolean(
      emailContent.trim() ||
      subject.trim() ||
      preheader.trim() ||
      enableLogo ||
      enableCta ||
      enableSocial
    );

    // 2. WhatsApp content (only if modified from default boilerplate)
    const normWa = normalizeStr(whatsappContent);
    const normDefaultWa = normalizeStr(DEFAULT_WA_CONTENT);
    const hasWa = Boolean(
      normWa &&
      normWa !== normDefaultWa
    );

    // 3. Telegram content (only if modified from default boilerplate)
    const normTg = normalizeStr(telegramContent);
    const normDefaultTg = normalizeStr(DEFAULT_TELEGRAM_CONTENT);
    const hasTg = Boolean(
      normTg &&
      normTg !== normDefaultTg
    );

    // 4. Custom title (only if changed from default)
    const trimmedTitle = title.trim();
    const hasCustomTitle = Boolean(
      trimmedTitle &&
      trimmedTitle !== "Template Kustom" &&
      trimmedTitle !== "Template Kustom Baru"
    );

    // Check if the active channel has user content or custom title
    if (channel === "email") {
      return hasEmail || hasCustomTitle;
    } else if (channel === "whatsapp") {
      return hasWa || Boolean(whatsappMediaUrl.trim()) || hasCustomTitle;
    } else {
      return hasTg || Boolean(telegramMediaUrl.trim()) || hasCustomTitle;
    }
  };

  // Whether current editor has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (templateId === null) {
      return hasUserWrittenContent();
    }
    if (lastSavedSnapshotRef.current) {
      return JSON.stringify(getNormalizedState()) !== lastSavedSnapshotRef.current;
    }
    return false;
  }, [
    templateId,
    title,
    channel,
    subject,
    preheader,
    emailContent,
    whatsappContent,
    telegramContent,
    brandColor,
    enableLogo,
    logoUrl,
    logoWidth,
    logoAlign,
    enableCta,
    ctaText,
    ctaUrl,
    ctaColor,
    enableSocial,
    websiteUrl,
    instagramUrl,
    whatsappUrl,
    footerAddress,
    whatsappMediaUrl,
    telegramMediaUrl,
  ]);

  // Browser beforeunload prompt if user attempts to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fetch saved templates from API
  const fetchSavedTemplates = async () => {
    try {
      const res = await api.get("/templates");
      if (res.data?.data) {
        setSavedTemplates(res.data.data);
      }
    } catch (err) {
      console.warn("Could not load templates from server:", err);
    }
  };

  useEffect(() => {
    fetchSavedTemplates();
  }, []);

  // Restore saved template draft from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.channel === "email" || parsed.channel === "whatsapp" || parsed.channel === "telegram") {
          setChannel(parsed.channel);
        } else {
          // If stored channel is invalid (e.g. "multiple"), detect from contents
          const hasHtml = Boolean(parsed.emailContent?.trim());
          const hasWa = Boolean(parsed.whatsappContent?.trim() && parsed.whatsappContent !== DEFAULT_WA_CONTENT);
          const hasTg = Boolean(parsed.telegramContent?.trim() && parsed.telegramContent !== DEFAULT_TELEGRAM_CONTENT);
          if (hasHtml) {
            setChannel("email");
          } else if (hasWa) {
            setChannel("whatsapp");
          } else if (hasTg) {
            setChannel("telegram");
          } else {
            setChannel("email");
          }
        }
        if (parsed.subject !== undefined) setSubject(parsed.subject);
        if (parsed.preheader !== undefined) setPreheader(parsed.preheader);
        if (parsed.emailContent !== undefined) {
          setEmailContent(parsed.emailContent);
        } else if (parsed.content !== undefined && parsed.channel === "email") {
          setEmailContent(parsed.content);
        }
        if (parsed.whatsappContent !== undefined) {
          setWhatsappContent(parsed.whatsappContent);
        } else if (parsed.content !== undefined && parsed.channel === "whatsapp") {
          setWhatsappContent(parsed.content);
        }
        if (parsed.telegramContent !== undefined) {
          setTelegramContent(parsed.telegramContent);
        } else if (parsed.content !== undefined && parsed.channel === "telegram") {
          setTelegramContent(parsed.content);
        }
        if (parsed.brandColor) setBrandColor(parsed.brandColor);
        if (parsed.enableLogo !== undefined) setEnableLogo(parsed.enableLogo);
        if (parsed.logoUrl !== undefined) setLogoUrl(parsed.logoUrl);
        if (parsed.logoWidth !== undefined) setLogoWidth(parsed.logoWidth);
        if (parsed.logoAlign !== undefined) setLogoAlign(parsed.logoAlign);
        if (parsed.enableCta !== undefined) setEnableCta(parsed.enableCta);
        if (parsed.ctaText) setCtaText(parsed.ctaText);
        if (parsed.ctaUrl) setCtaUrl(parsed.ctaUrl);
        if (parsed.ctaColor) setCtaColor(parsed.ctaColor);
        if (parsed.enableSocial !== undefined) setEnableSocial(parsed.enableSocial);
        if (parsed.websiteUrl) setWebsiteUrl(parsed.websiteUrl);
        if (parsed.instagramUrl) setInstagramUrl(parsed.instagramUrl);
        if (parsed.whatsappUrl) setWhatsappUrl(parsed.whatsappUrl);
        if (parsed.footerAddress) setFooterAddress(parsed.footerAddress);
        if (parsed.whatsappMediaUrl !== undefined) {
          setWhatsappMediaUrl(parsed.whatsappMediaUrl);
        } else if (parsed.mediaUrl && parsed.channel === "whatsapp") {
          setWhatsappMediaUrl(parsed.mediaUrl);
        }
        if (parsed.telegramMediaUrl !== undefined) {
          setTelegramMediaUrl(parsed.telegramMediaUrl);
        } else if (parsed.mediaUrl && parsed.channel === "telegram") {
          setTelegramMediaUrl(parsed.mediaUrl);
        }

        if (parsed.templateId) setTemplateId(parsed.templateId);
      }

      const savedSnapshot = localStorage.getItem(SNAPSHOT_KEY);
      if (savedSnapshot) {
        lastSavedSnapshotRef.current = savedSnapshot;
      }
    } catch (err) {
      console.warn("Failed to load template from localStorage:", err);
    }
  }, []);

  // Sync snapshot with savedTemplates if templateId exists but snapshot wasn't in localStorage
  useEffect(() => {
    if (templateId && !lastSavedSnapshotRef.current && savedTemplates.length > 0) {
      const matched = savedTemplates.find((t) => t.id === templateId);
      if (matched) {
        const targetChannel = resolveChannelFromTemplate(matched, channel);
        const latestVersion = matched.versions?.[0];
        const json = latestVersion?.contentJson || {};
        const snap = {
          title: matched.name.trim(),
          channel: targetChannel,
          subject: (latestVersion?.subject || "").trim(),
          preheader: (latestVersion?.preheader || "").trim(),
          emailContent: (latestVersion?.contentHtml || "").trim(),
          whatsappContent: (latestVersion?.contentWhatsapp || DEFAULT_WA_CONTENT).trim(),
          telegramContent: (latestVersion?.contentTelegram || DEFAULT_TELEGRAM_CONTENT).trim(),
          brandColor: json.brandColor || "#4F46E5",
          enableLogo: Boolean(json.enableLogo),
          logoUrl: (json.logoUrl || "").trim(),
          logoWidth: json.logoWidth || 140,
          logoAlign: json.logoAlign || "center",
          enableCta: Boolean(json.enableCta),
          ctaText: (json.ctaText || "Klaim Voucher Sekarang").trim(),
          ctaUrl: (json.ctaUrl || "https://tokoonline.com/promo").trim(),
          ctaColor: json.ctaColor || "#4F46E5",
          enableSocial: Boolean(json.enableSocial),
          websiteUrl: (json.websiteUrl || "https://acmecorp.co").trim(),
          instagramUrl: (json.instagramUrl || "https://instagram.com/acmecorp").trim(),
          whatsappUrl: (json.whatsappUrl || "https://wa.me/6281234567890").trim(),
          footerAddress: (json.footerAddress || "").trim(),
          whatsappMediaUrl: (json.whatsappMediaUrl || (targetChannel === "whatsapp" ? json.mediaUrl : "") || "").trim(),
          telegramMediaUrl: (json.telegramMediaUrl || (targetChannel === "telegram" ? json.mediaUrl : "") || "").trim(),
        };
        lastSavedSnapshotRef.current = JSON.stringify(snap);
      }
    }
  }, [templateId, savedTemplates, channel]);

  // Autosave current draft to localStorage (Debounced 600ms to eliminate typing lag)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draft = {
          templateId,
          title,
          channel,
          subject,
          preheader,
          content,
          emailContent,
          whatsappContent,
          telegramContent,
          brandColor,
          enableLogo,
          logoUrl,
          logoWidth,
          logoAlign,
          enableCta,
          ctaText,
          ctaUrl,
          ctaColor,
          enableSocial,
          websiteUrl,
          instagramUrl,
          whatsappUrl,
          footerAddress,
          mediaUrl,
          whatsappMediaUrl,
          telegramMediaUrl,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // ignore
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    templateId,
    title,
    channel,
    subject,
    preheader,
    content,
    emailContent,
    whatsappContent,
    telegramContent,
    brandColor,
    enableLogo,
    logoUrl,
    logoWidth,
    logoAlign,
    enableCta,
    ctaText,
    ctaUrl,
    ctaColor,
    enableSocial,
    websiteUrl,
    instagramUrl,
    whatsappUrl,
    footerAddress,
    whatsappMediaUrl,
    telegramMediaUrl,
  ]);

  // Handle Channel Switch
  const handleChannelChange = (newChannel: TemplateChannel) => {
    if (newChannel === channel) return;
    setChannel(newChannel);
  };

  // Handler: Select a Preset Template
  const handleSelectPreset = (preset: PresetTemplate) => {
    setTitle(preset.name);
    setChannel(preset.channel);
    setSubject(preset.subject || "");
    setPreheader(preset.preheader || "");
    if (preset.channel === "whatsapp") {
      setWhatsappContent(preset.content);
    } else if (preset.channel === "telegram") {
      setTelegramContent(preset.content);
    } else {
      setEmailContent(preset.content);
    }
    // Reset block states so old template's blocks do not leak into preset
    setEnableLogo(false);
    setLogoUrl("");
    setEnableCta(false);
    setEnableSocial(false);
    setFooterAddress("");
    setWhatsappMediaUrl("");
    setTelegramMediaUrl("");
    setTemplateId(null);
    toast.success(`Template "${preset.name}" dimuat.`);
  };

  // Handler: Select a Saved Template from Database
  const handleSelectSavedTemplate = (item: DatabaseTemplateItem) => {
    setTemplateId(item.id);
    setTitle(item.name);
    const targetChannel = resolveChannelFromTemplate(item, channel);
    setChannel(targetChannel);

    const latestVersion = item.versions?.[0];
    const json = latestVersion?.contentJson || {};

    if (latestVersion) {
      setSubject(latestVersion.subject || "");
      setPreheader(latestVersion.preheader || "");
      setEmailContent(latestVersion.contentHtml || "");
      setWhatsappContent(latestVersion.contentWhatsapp || DEFAULT_WA_CONTENT);
      setTelegramContent(latestVersion.contentTelegram || DEFAULT_TELEGRAM_CONTENT);

      if (latestVersion.contentJson) {
        setBrandColor(json.brandColor || "#4F46E5");
        setEnableLogo(Boolean(json.enableLogo));
        setLogoUrl(json.logoUrl || "");
        setLogoWidth(json.logoWidth || 140);
        setLogoAlign(json.logoAlign || "center");
        setEnableCta(Boolean(json.enableCta));
        setCtaText(json.ctaText || "Klaim Voucher Sekarang");
        setCtaUrl(json.ctaUrl || "https://tokoonline.com/promo");
        setCtaColor(json.ctaColor || "#4F46E5");
        setEnableSocial(Boolean(json.enableSocial));
        setWebsiteUrl(json.websiteUrl || "https://acmecorp.co");
        setInstagramUrl(json.instagramUrl || "https://instagram.com/acmecorp");
        setWhatsappUrl(json.whatsappUrl || "https://wa.me/6281234567890");
        setFooterAddress(json.footerAddress || "");
        setWhatsappMediaUrl(json.whatsappMediaUrl || (targetChannel === "whatsapp" ? json.mediaUrl : "") || "");
        setTelegramMediaUrl(json.telegramMediaUrl || (targetChannel === "telegram" ? json.mediaUrl : "") || "");
      } else {
        setEnableLogo(false);
        setLogoUrl("");
        setEnableCta(false);
        setEnableSocial(false);
        setFooterAddress("");
        setWhatsappMediaUrl("");
        setTelegramMediaUrl("");
      }
    }

    const snapshot = {
      title: item.name.trim(),
      channel: targetChannel,
      subject: (latestVersion?.subject || "").trim(),
      preheader: (latestVersion?.preheader || "").trim(),
      emailContent: (latestVersion?.contentHtml || "").trim(),
      whatsappContent: (latestVersion?.contentWhatsapp || DEFAULT_WA_CONTENT).trim(),
      telegramContent: (latestVersion?.contentTelegram || DEFAULT_TELEGRAM_CONTENT).trim(),
      brandColor: json.brandColor || "#4F46E5",
      enableLogo: Boolean(json.enableLogo),
      logoUrl: (json.logoUrl || "").trim(),
      logoWidth: json.logoWidth || 140,
      logoAlign: json.logoAlign || "center",
      enableCta: Boolean(json.enableCta),
      ctaText: (json.ctaText || "Klaim Voucher Sekarang").trim(),
      ctaUrl: (json.ctaUrl || "https://tokoonline.com/promo").trim(),
      ctaColor: json.ctaColor || "#4F46E5",
      enableSocial: Boolean(json.enableSocial),
      websiteUrl: (json.websiteUrl || "https://acmecorp.co").trim(),
      instagramUrl: (json.instagramUrl || "https://instagram.com/acmecorp").trim(),
      whatsappUrl: (json.whatsappUrl || "https://wa.me/6281234567890").trim(),
      footerAddress: (json.footerAddress || "").trim(),
      whatsappMediaUrl: (json.whatsappMediaUrl || (targetChannel === "whatsapp" ? json.mediaUrl : "") || "").trim(),
      telegramMediaUrl: (json.telegramMediaUrl || (targetChannel === "telegram" ? json.mediaUrl : "") || "").trim(),
    };
    const snapStr = JSON.stringify(snapshot);
    lastSavedSnapshotRef.current = snapStr;
    try {
      localStorage.setItem(SNAPSHOT_KEY, snapStr);
    } catch {}

    toast.success(`Template "${item.name}" berhasil dimuat.`);
  };

  // Handler: Start New Blank Template (Clean canvas)
  const handleNewBlankTemplate = () => {
    setTemplateId(null);
    setTitle("Template Kustom Baru");
    if (channel === "email") {
      setSubject("");
      setPreheader("");
      setEmailContent("");
      setEnableLogo(false);
      setLogoUrl("");
      setEnableCta(false);
      setMediaUrl("");
      setEnableSocial(false);
      setFooterAddress("");
    } else if (channel === "whatsapp") {
      setWhatsappContent(DEFAULT_WA_CONTENT);
      setWhatsappMediaUrl("");
    } else {
      setTelegramContent(DEFAULT_TELEGRAM_CONTENT);
      setTelegramMediaUrl("");
    }
    lastSavedSnapshotRef.current = null;
    try {
      localStorage.removeItem(SNAPSHOT_KEY);
    } catch {}
    toast.info("Kanvas bersih siap digunakan. Silakan mulai menulis atau pilih template.");
  };

  // Handler: Save Template to Backend Database
  const handleSaveTemplate = async (): Promise<boolean> => {
    if (!title.trim()) {
      toast.error("Nama template tidak boleh kosong");
      return false;
    }

    setIsSaving(true);
    try {
      const normWa = normalizeStr(whatsappContent);
      const normTg = normalizeStr(telegramContent);
      const hasEmail = Boolean(emailContent.trim());
      const hasWa = Boolean(normWa && normWa !== normalizeStr(DEFAULT_WA_CONTENT));
      const hasTg = Boolean(normTg && normTg !== normalizeStr(DEFAULT_TELEGRAM_CONTENT));

      // Simpan konten saluran yang terisi agar tidak saling menimpa
      const payloadContent = {
        subject: emailContent.trim() ? subject : undefined,
        preheader: emailContent.trim() ? preheader : undefined,
        contentHtml: emailContent.trim() || undefined,
        contentWhatsapp: (hasWa || channel === "whatsapp") ? whatsappContent.trim() : undefined,
        contentTelegram: (hasTg || channel === "telegram") ? telegramContent.trim() : undefined,
        contentJson: {
          brandColor,
          enableLogo,
          logoUrl,
          logoWidth,
          logoAlign,
          enableCta,
          ctaText,
          ctaUrl,
          ctaColor,
          enableSocial,
          websiteUrl,
          instagramUrl,
          whatsappUrl,
          footerAddress,
          mediaUrl,
          whatsappMediaUrl,
          telegramMediaUrl,
        },
      };

      const filledChannelsCount = (hasEmail ? 1 : 0) + (hasWa ? 1 : 0) + (hasTg ? 1 : 0);
      const channelMode = filledChannelsCount > 1 ? "multiple" : channel;

      if (templateId) {
        await api.put(`/templates/${templateId}`, {
          name: title,
          channelMode,
          category: "custom",
        });

        await api.post(`/templates/${templateId}/versions`, payloadContent);

        toast.success(`Template "${title}" berhasil diperbarui!`);
      } else {
        const createPayload = {
          name: title,
          channelMode,
          category: "custom",
          ...payloadContent,
        };

        const res = await api.post("/templates", createPayload);
        const newId = res.data?.data?.id;
        if (newId) {
          setTemplateId(newId);
        }

        toast.success(`Template "${title}" berhasil disimpan!`);
      }

      // Record snapshot after successful save
      const snapStr = JSON.stringify(getNormalizedState());
      lastSavedSnapshotRef.current = snapStr;
      try {
        localStorage.setItem(SNAPSHOT_KEY, snapStr);
      } catch {}

      fetchSavedTemplates();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan template ke server";
      toast.error(msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Merge tag selected from modal -> insert at cursor
  const handleSelectMergeTag = (tag: string, target?: "subject" | "preheader" | "content") => {
    const formatted = tag.startsWith("{{") ? tag : `{{${tag}}}`;
    const effectiveTarget = target || activeTarget;

    if (insertTagRef.current) {
      insertTagRef.current(formatted, effectiveTarget);
    } else if (effectiveTarget === "subject") {
      setSubject((prev) => `${prev} ${formatted}`);
    } else if (effectiveTarget === "preheader") {
      setPreheader((prev) => `${prev} ${formatted}`);
    } else {
      setContent((prev) => `${prev} ${formatted}`);
    }

    const targetLabel =
      effectiveTarget === "subject"
        ? "Subjek Email"
        : effectiveTarget === "preheader"
        ? "Preheader"
        : "Isi Pesan";

    toast.info(`Variabel ${formatted} disisipkan ke ${targetLabel}.`);
  };

  return {
    templateId,
    setTemplateId,
    title,
    setTitle,
    channel,
    setChannel,
    subject,
    setSubject,
    preheader,
    setPreheader,
    content,
    setContent,
    emailContent,
    setEmailContent,
    whatsappContent,
    setWhatsappContent,
    telegramContent,
    setTelegramContent,
    recipient,
    setRecipient,
    savedTemplates,
    fetchSavedTemplates,
    brandColor,
    setBrandColor,
    enableLogo,
    setEnableLogo,
    logoUrl,
    setLogoUrl,
    logoWidth,
    setLogoWidth,
    logoAlign,
    setLogoAlign,
    enableCta,
    setEnableCta,
    ctaText,
    setCtaText,
    ctaUrl,
    setCtaUrl,
    ctaColor,
    setCtaColor,
    enableSocial,
    setEnableSocial,
    websiteUrl,
    setWebsiteUrl,
    instagramUrl,
    setInstagramUrl,
    whatsappUrl,
    setWhatsappUrl,
    footerAddress,
    setFooterAddress,
    isTemplatePickerOpen,
    setIsTemplatePickerOpen,
    isMergeTagsModalOpen,
    setIsMergeTagsModalOpen,
    isSaving,
    hasUnsavedChanges,
    activeTarget,
    setActiveTarget,
    insertTagRef,
    mediaUrl,
    setMediaUrl,

    // Actions
    handleChannelChange,
    handleSelectPreset,
    handleSelectSavedTemplate,
    handleNewBlankTemplate,
    handleSaveTemplate,
    handleSelectMergeTag,
  };
}
