import { useState, useEffect, useRef } from "react";
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
  const [recipient, setRecipient] = useState<RecipientPreview>(SAMPLE_RECIPIENTS[0]);

  // Active channel content accessor
  const content =
    channel === "whatsapp"
      ? whatsappContent
      : channel === "telegram"
      ? telegramContent
      : emailContent;

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
  const [footerAddress, setFooterAddress] = useState("PT Acme Digital Nusantara, Jakarta, Indonesia");

  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isMergeTagsModalOpen, setIsMergeTagsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Active target field tracking (subject | preheader | content)
  const [activeTarget, setActiveTarget] = useState<"subject" | "preheader" | "content">("subject");

  // Cursor tag insert function hook
  const insertTagRef = useRef<((tag: string, target?: "subject" | "preheader" | "content") => void) | null>(null);

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
        if (parsed.channel) setChannel(parsed.channel);
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
        if (parsed.templateId) setTemplateId(parsed.templateId);
      }
    } catch (err) {
      console.warn("Failed to load template from localStorage:", err);
    }
  }, []);

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
    setTemplateId(null);
    toast.success(`Template "${preset.name}" dimuat.`);
  };

  // Handler: Select a Saved Template from Database
  const handleSelectSavedTemplate = (item: DatabaseTemplateItem) => {
    setTemplateId(item.id);
    setTitle(item.name);
    const targetChannel = (item.channelMode as TemplateChannel) || "email";
    setChannel(targetChannel);

    const latestVersion = item.versions?.[0];
    if (latestVersion) {
      setSubject(latestVersion.subject || "");
      setPreheader(latestVersion.preheader || "");
      if (latestVersion.contentHtml) {
        setEmailContent(latestVersion.contentHtml);
      }
      if (latestVersion.contentWhatsapp) {
        setWhatsappContent(latestVersion.contentWhatsapp);
      }
      if (latestVersion.contentTelegram) {
        setTelegramContent(latestVersion.contentTelegram);
      }

      if (latestVersion.contentJson) {
        const json = latestVersion.contentJson;
        if (json.brandColor) setBrandColor(json.brandColor);
        if (json.enableLogo !== undefined) setEnableLogo(json.enableLogo);
        if (json.logoUrl !== undefined) setLogoUrl(json.logoUrl);
        if (json.logoWidth !== undefined) setLogoWidth(json.logoWidth);
        if (json.logoAlign !== undefined) setLogoAlign(json.logoAlign);
        if (json.enableCta !== undefined) setEnableCta(json.enableCta);
        if (json.ctaText) setCtaText(json.ctaText);
        if (json.ctaUrl) setCtaUrl(json.ctaUrl);
        if (json.ctaColor) setCtaColor(json.ctaColor);
        if (json.enableSocial !== undefined) setEnableSocial(json.enableSocial);
        if (json.websiteUrl) setWebsiteUrl(json.websiteUrl);
        if (json.instagramUrl) setInstagramUrl(json.instagramUrl);
        if (json.whatsappUrl) setWhatsappUrl(json.whatsappUrl);
        if (json.footerAddress) setFooterAddress(json.footerAddress);
      }
    }

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
      setEnableSocial(false);
    } else if (channel === "whatsapp") {
      setWhatsappContent(DEFAULT_WA_CONTENT);
    } else {
      setTelegramContent(DEFAULT_TELEGRAM_CONTENT);
    }
    toast.info("Kanvas bersih siap digunakan. Silakan mulai menulis atau pilih template.");
  };

  // Handler: Save Template to Backend Database
  const handleSaveTemplate = async () => {
    if (!title.trim()) {
      toast.error("Nama template tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    try {
      // Simpan semua konten saluran yang terisi agar tidak saling menimpa
      const payloadContent = {
        subject: emailContent.trim() ? subject : undefined,
        preheader: emailContent.trim() ? preheader : undefined,
        contentHtml: emailContent.trim() || undefined,
        contentWhatsapp: whatsappContent.trim() || undefined,
        contentTelegram: telegramContent.trim() || undefined,
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
        },
      };

      const hasEmail = Boolean(emailContent.trim());
      const hasWa = Boolean(whatsappContent.trim() && whatsappContent !== DEFAULT_WA_CONTENT);
      const hasTg = Boolean(telegramContent.trim() && telegramContent !== DEFAULT_TELEGRAM_CONTENT);
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

      fetchSavedTemplates();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan template ke server";
      toast.error(msg);
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
    activeTarget,
    setActiveTarget,
    insertTagRef,
    // Actions
    handleChannelChange,
    handleSelectPreset,
    handleSelectSavedTemplate,
    handleNewBlankTemplate,
    handleSaveTemplate,
    handleSelectMergeTag,
  };
}
