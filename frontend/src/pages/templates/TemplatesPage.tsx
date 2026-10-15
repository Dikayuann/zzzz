import React, { useState, useMemo } from "react";
import {
  TemplateHeader,
  TemplateEditorPanel,
  TemplateLivePreview,
  TemplateSelectorModal,
  TestSendModal,
} from "@/components/templates";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import { useTemplateEditor } from "@/hooks/useTemplateEditor";
import { compileTemplateToEmailHtml } from "@/utils/templateParser";

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
    isTemplatePickerOpen,
    setIsTemplatePickerOpen,
    isMergeTagsModalOpen,
    setIsMergeTagsModalOpen,
    isSaving,
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
        onNewTemplate={handleNewBlankTemplate}
        onSaveTemplate={handleSaveTemplate}
        onOpenTestSend={() => setIsTestSendModalOpen(true)}
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
            mediaUrl={mediaUrl}
            onMediaUrlChange={setMediaUrl}
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
            mediaUrl={mediaUrl}
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
    </div>
  );
};
