import React, { useState, useEffect } from "react";
import {
  TemplateHeader,
  TemplateEditorPanel,
  TemplateLivePreview,
} from "@/components/templates";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import type {
  TemplateChannel,
  RecipientPreview,
  TemplateData,
} from "@/types/template";
import {
  SAMPLE_RECIPIENTS,
  DEFAULT_TEMPLATE_CONTENT,
  DEFAULT_SUBJECT,
  DEFAULT_PREHEADER,
  DEFAULT_WA_CONTENT,
} from "@/utils/templateParser";
import { toast } from "sonner";

const STORAGE_KEY = "campaign_current_template";

export const TemplatesPage: React.FC = () => {
  // Core template state
  const [title, setTitle] = useState("Monthly Newsletter");
  const [channel, setChannel] = useState<TemplateChannel>("email");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [preheader, setPreheader] = useState(DEFAULT_PREHEADER);
  const [content, setContent] = useState(DEFAULT_TEMPLATE_CONTENT);
  const [recipient, setRecipient] = useState<RecipientPreview>(SAMPLE_RECIPIENTS[0]);

  // Mailchimp Component Blocks state
  const [brandColor, setBrandColor] = useState("#4F46E5");
  const [enableCta, setEnableCta] = useState(false);
  const [ctaText, setCtaText] = useState("Klaim Voucher Sekarang 🚀");
  const [ctaUrl, setCtaUrl] = useState("https://tokoonline.com/promo");
  const [ctaColor, setCtaColor] = useState("#4F46E5");
  const [enableSocial, setEnableSocial] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState("https://acmecorp.co");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/acmecorp");
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/6281234567890");
  const [footerAddress, setFooterAddress] = useState("PT Acme Digital Nusantara, Jakarta, Indonesia");

  const [isMergeTagsModalOpen, setIsMergeTagsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Restore saved template from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: TemplateData = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.channel) setChannel(parsed.channel);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.preheader) setPreheader(parsed.preheader);
        if (parsed.content) setContent(parsed.content);
        if (parsed.brandColor) setBrandColor(parsed.brandColor);
        if (parsed.enableCta !== undefined) setEnableCta(parsed.enableCta);
        if (parsed.ctaText) setCtaText(parsed.ctaText);
        if (parsed.ctaUrl) setCtaUrl(parsed.ctaUrl);
        if (parsed.ctaColor) setCtaColor(parsed.ctaColor);
        if (parsed.enableSocial !== undefined) setEnableSocial(parsed.enableSocial);
        if (parsed.websiteUrl) setWebsiteUrl(parsed.websiteUrl);
        if (parsed.instagramUrl) setInstagramUrl(parsed.instagramUrl);
        if (parsed.whatsappUrl) setWhatsappUrl(parsed.whatsappUrl);
        if (parsed.footerAddress) setFooterAddress(parsed.footerAddress);
      }
    } catch (err) {
      console.warn("Failed to load template from localStorage:", err);
    }
  }, []);

  // Handle Channel Switch with helpful starter content
  const handleChannelChange = (newChannel: TemplateChannel) => {
    if (newChannel === channel) return;
    setChannel(newChannel);

    if (newChannel === "whatsapp" && content === DEFAULT_TEMPLATE_CONTENT) {
      setContent(DEFAULT_WA_CONTENT);
    } else if (newChannel === "email" && content === DEFAULT_WA_CONTENT) {
      setContent(DEFAULT_TEMPLATE_CONTENT);
    }
  };

  // Save handler
  const handleSaveTemplate = () => {
    setIsSaving(true);
    const templatePayload: TemplateData = {
      id: "tpl-newsletter",
      title,
      channel,
      subject,
      preheader,
      content,
      orgName: "Acme Corp",
      senderEmail: "hello@acmecorp.co",
      brandColor,
      enableCta,
      ctaText,
      ctaUrl,
      ctaColor,
      enableSocial,
      websiteUrl,
      instagramUrl,
      whatsappUrl,
      footerAddress,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templatePayload));
      setTimeout(() => {
        setIsSaving(false);
        toast.success(`Template "${title}" berhasil disimpan!`, {
          description: "Semua blok teks, tombol CTA, dan konfigurasi tersimpan rapi.",
        });
      }, 350);
    } catch (err) {
      setIsSaving(false);
      toast.error("Gagal menyimpan template.");
    }
  };

  // Merge tag selected from modal
  const handleSelectMergeTag = (tag: string) => {
    const formatted = tag.startsWith("{{") ? tag : `{{${tag}}}`;
    setContent((prev) => `${prev} ${formatted}`);
    toast.info(`Variabel ${formatted} disisipkan ke template.`);
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
        onSaveTemplate={handleSaveTemplate}
        isSaving={isSaving}
      />

      {/* 2. SPLIT LAYOUT: EDITOR (LEFT) & LIVE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: EDITOR & MAILCHIMP BLOCKS */}
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

        {/* RIGHT COLUMN: LIVE PREVIEW */}
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

      {/* 3. REUSABLE MERGE TAGS MODAL */}
      <MergeTagsModal
        open={isMergeTagsModalOpen}
        onOpenChange={setIsMergeTagsModalOpen}
        onSelectTag={handleSelectMergeTag}
      />
    </div>
  );
};
