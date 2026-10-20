import React, { useState, useMemo } from "react";
import {
  TemplateHeader,
  TemplateEditorPanel,
  TemplateLivePreview,
  TemplateSelectorModal,
  TestSendModal,
  UnsavedChangesModal,
} from "@/components/templates";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import { useTemplateEditor } from "@/hooks/useTemplateEditor";
import { compileTemplateToEmailHtml } from "@/utils/templateParser";
import { Columns2, Edit3, Eye } from "lucide-react";

export const TemplatesPage: React.FC = () => {
  const {
    templateId,
    title,
    setTitle,
    channel,
    subject,
    setSubject,
    preheader,
    setPreheader,
    content,
    setContent,
    emailContent,
    recipient,
    setRecipient,
    savedTemplates,
    fetchSavedTemplates,
    brandColor,
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
  } = useTemplateEditor();

  const [isTestSendModalOpen, setIsTestSendModalOpen] = useState(false);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"split" | "editor" | "preview">("split");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // Handler for New Template button: if dirty, prompt confirmation; otherwise immediately start new
  const handleRequestNewTemplate = () => {
    if (hasUnsavedChanges) {
      setIsUnsavedChangesModalOpen(true);
    } else {
      handleNewBlankTemplate();
    }
  };

  const handleConfirmNewTemplate = () => {
    handleNewBlankTemplate();
  };

  // Compile full HTML email including logo, CTA button, and social footer
  const compiledHtml = useMemo(() => {
    return compileTemplateToEmailHtml({
      subject,
      preheader,
      content: emailContent || content,
      orgName: "Acme Corp",
      senderEmail: "hello@acmecorp.co",
      recipient,
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
    });
  }, [
    subject,
    preheader,
    content,
    emailContent,
    recipient,
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
        onNewTemplate={handleRequestNewTemplate}
        onSaveTemplate={handleSaveTemplate}
        onOpenTestSend={() => setIsTestSendModalOpen(true)}
        isSaving={isSaving}
        hasSavedTemplate={Boolean(templateId)}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 2. RESPONSIVE VIEW SWITCHERS */}
      {/* Mobile / Tablet Segmented Control (< lg) */}
      <div className="lg:hidden flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/90 shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
            mobileTab === "editor"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Editor ({channel.toUpperCase()})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
            mobileTab === "preview"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Pratinjau Klien</span>
        </button>
      </div>

      {/* Desktop Layout Mode Toolbar (>= lg) */}
      <div className="hidden lg:flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Tata Letak Tampilan:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                layoutMode === "split"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Bagi layar dua sisi: Editor di kiri, Pratinjau di kanan"
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Bagi Dua (Split 50:50)</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                layoutMode === "editor"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Fokus penuh pada penulisan dan desain template"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Fokus Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition cursor-pointer ${
                layoutMode === "preview"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Fokus penuh pada simulasi pratinjau penerima"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Fokus Pratinjau</span>
            </button>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          {layoutMode === "split"
            ? "💡 Tip: Pilih 'Fokus Editor' jika ingin kanvas penulisan lebih luas"
            : layoutMode === "editor"
            ? "Mode editor penuh: Pratinjau disembunyikan sementara"
            : "Mode pratinjau penuh"}
        </span>
      </div>

      {/* 3. RESPONSIVE GRID LAYOUT: EDITOR & LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: DUAL-MODE EDITOR & MAILCHIMP BLOCKS */}
        {(layoutMode === "split" || layoutMode === "editor") && (
          <div
            className={`transition-all duration-200 ${
              mobileTab !== "editor" ? "hidden lg:block" : ""
            } ${
              layoutMode === "editor"
                ? "lg:col-span-12 max-w-5xl mx-auto w-full"
                : "lg:col-span-6 xl:col-span-6 2xl:col-span-6"
            }`}
          >
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
              footerAddress={footerAddress}
              onFooterAddressChange={setFooterAddress}
              mediaUrl={mediaUrl}
              onMediaUrlChange={setMediaUrl}
            />
          </div>
        )}

        {/* RIGHT COLUMN: REALISTIC EMAIL CLIENT LIVE PREVIEW */}
        {(layoutMode === "split" || layoutMode === "preview") && (
          <div
            className={`transition-all duration-200 ${
              mobileTab !== "preview" ? "hidden lg:block" : ""
            } ${
              layoutMode === "preview"
                ? "lg:col-span-12 max-w-4xl mx-auto w-full"
                : "lg:col-span-6 xl:col-span-6 2xl:col-span-6 lg:sticky lg:top-6"
            }`}
          >
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
              mediaUrl={mediaUrl}
            />
          </div>
        )}
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
        onNewBlankTemplate={() => {
          setIsTemplatePickerOpen(false);
          handleRequestNewTemplate();
        }}
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

      {/* 5. TEST SEND MODAL (EMAIL, WHATSAPP, TELEGRAM) */}
      <TestSendModal
        open={isTestSendModalOpen}
        onOpenChange={setIsTestSendModalOpen}
        channel={channel}
        templateId={templateId}
        subject={subject}
        compiledHtml={compiledHtml}
        contentWhatsapp={content}
        contentTelegram={content}
        mediaUrl={mediaUrl}
        activeRecipient={recipient}
      />

      {/* 6. UNSAVED CHANGES CONFIRMATION MODAL */}
      <UnsavedChangesModal
        open={isUnsavedChangesModalOpen}
        onOpenChange={setIsUnsavedChangesModalOpen}
        onConfirm={handleConfirmNewTemplate}
      />
    </div>
  );
};
