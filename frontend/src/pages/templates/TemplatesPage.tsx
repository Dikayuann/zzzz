import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import {
  TemplateHeader,
  TemplateEditorPanel,
  TemplateLivePreview,
  TemplateSelectorModal,
  type DatabaseTemplateItem,
} from "@/components/templates";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import type {
  TemplateChannel,
  RecipientPreview,
  TemplateData,
} from "@/types/template";
import {
  SAMPLE_RECIPIENTS,
  DEFAULT_WA_CONTENT,
} from "@/utils/templateParser";
import { type PresetTemplate } from "@/data/presetTemplates";
import { toast } from "sonner";

const STORAGE_KEY = "campaign_current_template_v2";

export const TemplatesPage: React.FC = () => {
  // Database tracking: id if loaded from DB, null if new custom
  const [templateId, setTemplateId] = useState<number | null>(null);

  // Core template state (Default: Clean & Empty canvas as requested by user)
  const [title, setTitle] = useState("Template Kustom");
  const [channel, setChannel] = useState<TemplateChannel>("email");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [content, setContent] = useState("");
  const [recipient, setRecipient] = useState<RecipientPreview>(SAMPLE_RECIPIENTS[0]);

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
        const parsed: TemplateData & { templateId?: number } = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.channel) setChannel(parsed.channel);
        if (parsed.subject !== undefined) setSubject(parsed.subject);
        if (parsed.preheader !== undefined) setPreheader(parsed.preheader);
        if (parsed.content !== undefined) setContent(parsed.content);
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

    if (newChannel === "whatsapp" && !content.trim()) {
      setContent(DEFAULT_WA_CONTENT);
    }
  };

  // Handler: Select a Preset Template
  const handleSelectPreset = (preset: PresetTemplate) => {
    setTitle(preset.name);
    setChannel(preset.channel);
    setSubject(preset.subject);
    setPreheader(preset.preheader);
    setContent(preset.content);
    setTemplateId(null); // Fresh preset
    toast.success(`Template "${preset.name}" dimuat.`);
  };

  // Handler: Select a Saved Template from Database
  const handleSelectSavedTemplate = (item: DatabaseTemplateItem) => {
    setTemplateId(item.id);
    setTitle(item.name);
    setChannel((item.channelMode as TemplateChannel) || "email");

    const latestVersion = item.versions?.[0];
    if (latestVersion) {
      setSubject(latestVersion.subject || "");
      setPreheader(latestVersion.preheader || "");
      if (item.channelMode === "whatsapp") {
        setContent(latestVersion.contentWhatsapp || "");
      } else if (item.channelMode === "telegram") {
        setContent(latestVersion.contentTelegram || "");
      } else {
        setContent(latestVersion.contentHtml || "");
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
    setSubject("");
    setPreheader("");
    setContent("");
    setEnableLogo(false);
    setLogoUrl("");
    setEnableCta(false);
    setEnableSocial(false);
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
      const payloadContent = {
        subject: channel === "email" ? subject : undefined,
        preheader: channel === "email" ? preheader : undefined,
        contentHtml: channel === "email" ? content : undefined,
        contentWhatsapp: channel === "whatsapp" ? content : undefined,
        contentTelegram: channel === "telegram" ? content : undefined,
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

      if (templateId) {
        // 1. Update existing template name & channel
        await api.put(`/templates/${templateId}`, {
          name: title,
          channelMode: channel,
          category: "custom",
        });

        // 2. Add new version with latest content
        await api.post(`/templates/${templateId}/versions`, payloadContent);

        toast.success(`Template "${title}" berhasil diperbarui!`);
      } else {
        // Create new template
        const createPayload = {
          name: title,
          channelMode: channel,
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

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. TOP HEADER & CONTROLS */}
      <TemplateHeader
        title={title}
        onTitleChange={setTitle}
        channel={channel}
        onChannelChange={handleChannelChange}
        onOpenMergeTags={() => setIsMergeTagsModalOpen(true)}
        onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
        onNewTemplate={handleNewBlankTemplate}
        onSaveTemplate={handleSaveTemplate}
        isSaving={isSaving}
        hasSavedTemplate={Boolean(templateId)}
      />

      {/* 2. SPLIT LAYOUT: EDITOR (LEFT) & LIVE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: DUAL-MODE EDITOR & MAILCHIMP BLOCKS */}
        <div className="lg:col-span-7">
          <TemplateEditorPanel
            channel={channel}
            subject={subject}
            onSubjectChange={setSubject}
            preheader={preheader}
            onPreheaderChange={setPreheader}
            content={content}
            onContentChange={setContent}
            onOpenMergeTagsModal={() => setIsMergeTagsModalOpen(true)}
            onRegisterInsertTagHandler={(fn) => {
              insertTagRef.current = fn;
            }}
            activeTarget={activeTarget}
            onActiveTargetChange={setActiveTarget}
            // Custom Logo props
            enableLogo={enableLogo}
            onEnableLogoChange={setEnableLogo}
            logoUrl={logoUrl}
            onLogoUrlChange={setLogoUrl}
            logoWidth={logoWidth}
            onLogoWidthChange={setLogoWidth}
            logoAlign={logoAlign}
            onLogoAlignChange={setLogoAlign}
            // Mailchimp CTA Button props
            enableCta={enableCta}
            onEnableCtaChange={setEnableCta}
            ctaText={ctaText}
            onCtaTextChange={setCtaText}
            ctaUrl={ctaUrl}
            onCtaUrlChange={setCtaUrl}
            ctaColor={ctaColor}
            onCtaColorChange={setCtaColor}
            // Mailchimp Social props
            enableSocial={enableSocial}
            onEnableSocialChange={setEnableSocial}
            websiteUrl={websiteUrl}
            onWebsiteUrlChange={setWebsiteUrl}
            instagramUrl={instagramUrl}
            onInstagramUrlChange={setInstagramUrl}
            whatsappUrl={whatsappUrl}
            onWhatsappUrlChange={setWhatsappUrl}
          />
        </div>

        {/* RIGHT COLUMN: REALISTIC EMAIL CLIENT LIVE PREVIEW */}
        <div className="lg:col-span-5 sticky top-6">
          <TemplateLivePreview
            channel={channel}
            subject={subject}
            preheader={preheader}
            content={content}
            orgName="Acme Corp"
            senderEmail="hello@acmecorp.co"
            brandColor={brandColor}
            recipient={recipient}
            onRecipientChange={setRecipient}
            // Custom Logo props
            enableLogo={enableLogo}
            logoUrl={logoUrl}
            logoWidth={logoWidth}
            logoAlign={logoAlign}
            // Mailchimp CTA Button props
            enableCta={enableCta}
            ctaText={ctaText}
            ctaUrl={ctaUrl}
            ctaColor={ctaColor}
            // Mailchimp Social props
            enableSocial={enableSocial}
            websiteUrl={websiteUrl}
            instagramUrl={instagramUrl}
            whatsappUrl={whatsappUrl}
            footerAddress={footerAddress}
          />
        </div>
      </div>

      {/* 3. TEMPLATE SELECTION MODAL (PRESETS + SAVED DATABASE TEMPLATES) */}
      <TemplateSelectorModal
        open={isTemplatePickerOpen}
        onOpenChange={setIsTemplatePickerOpen}
        channel={channel}
        currentTemplateId={templateId}
        savedTemplates={savedTemplates}
        onSelectPreset={handleSelectPreset}
        onSelectSavedTemplate={handleSelectSavedTemplate}
        onNewBlankTemplate={handleNewBlankTemplate}
        onRefreshSavedTemplates={fetchSavedTemplates}
      />

      {/* 4. REUSABLE MERGE TAGS MODAL */}
      <MergeTagsModal
        open={isMergeTagsModalOpen}
        onOpenChange={setIsMergeTagsModalOpen}
        onSelectTag={handleSelectMergeTag}
        targetField={activeTarget}
        onTargetFieldChange={setActiveTarget}
        showTargetSelector={channel === "email"}
      />
    </div>
  );
};
