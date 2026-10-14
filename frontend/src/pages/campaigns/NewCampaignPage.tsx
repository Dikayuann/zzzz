import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  X,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import type {
  DeliveryChannel,
  PresetTemplate,
  DraftPayload,
} from "@/types/campaignWizard";
import {
  PRESET_TEMPLATES,
  SENDER_PROFILES,
  AUDIENCE_OPTIONS,
} from "@/data/mockWizardData";
import {
  CampaignWizardStepper,
  StepChannel,
  StepAudience,
  StepTemplate,
  StepSchedule,
  StepReview,
  CancelCampaignModal,
  ResetCampaignModal,
} from "@/components/campaigns/wizard";

const DRAFT_STORAGE_KEY = "campaign_blast_draft_v1";

const getInitialDraft = (): Partial<DraftPayload> | null => {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.campaignName?.trim() && (!parsed.currentStep || parsed.currentStep <= 1)) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return null;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Gagal membaca draft dari localStorage:", e);
  }
  return null;
};

export const NewCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const initialDraft = useMemo(() => getInitialDraft(), []);

  // Stepper State
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialDraft?.currentStep && initialDraft.currentStep >= 1 && initialDraft.currentStep <= 5) {
      return initialDraft.currentStep;
    }
    return 1;
  });

  const [maxStepReached, setMaxStepReached] = useState<number>(() => {
    return Math.max(initialDraft?.maxStepReached || 1, initialDraft?.currentStep || 1, 1);
  });

  // Form State
  const [campaignName, setCampaignName] = useState<string>(() => initialDraft?.campaignName ?? "");
  const [selectedChannels, setSelectedChannels] = useState<DeliveryChannel[]>(() => {
    if (initialDraft?.selectedChannels && initialDraft.selectedChannels.length > 0) {
      return initialDraft.selectedChannels;
    }
    return ["Email"];
  });

  // Sender configs
  const [emailSender, setEmailSender] = useState<string>(() => initialDraft?.emailSender ?? "promo@acmecorp.co");
  const [replyToEmail, setReplyToEmail] = useState<string>(() => initialDraft?.replyToEmail ?? "support@acmecorp.co");
  const waSender = "+62 812-8899-7766";
  const telegramBot = "@AcmeOfficialBlastBot";

  // Audience
  const [selectedAudience, setSelectedAudience] = useState<string>(() => initialDraft?.selectedAudience ?? "all-subscribers");

  // Template & Composer State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => initialDraft?.selectedTemplateId ?? "newsletter");
  const [activeTemplateTab, setActiveTemplateTab] = useState<DeliveryChannel>(() => initialDraft?.activeTemplateTab ?? "Email");
  const [emailSubject, setEmailSubject] = useState<string>(() => {
    if (initialDraft?.emailSubject !== undefined) return initialDraft.emailSubject;
    return PRESET_TEMPLATES[1].emailSubject;
  });
  const [emailContent, setEmailContent] = useState<string>(() => {
    if (initialDraft?.emailContent !== undefined) return initialDraft.emailContent;
    return PRESET_TEMPLATES[1].emailContent;
  });
  const [waContent, setWaContent] = useState<string>(() => {
    if (initialDraft?.waContent !== undefined) return initialDraft.waContent;
    return PRESET_TEMPLATES[1].waContent;
  });
  const [telegramContent, setTelegramContent] = useState<string>(() => {
    if (initialDraft?.telegramContent !== undefined) return initialDraft.telegramContent;
    return PRESET_TEMPLATES[1].telegramContent;
  });

  // Schedule & Throttle
  const [scheduleType, setScheduleType] = useState<"instant" | "scheduled">(() => initialDraft?.scheduleType ?? "instant");
  const [scheduledDate, setScheduledDate] = useState<string>(() => initialDraft?.scheduledDate ?? "2026-09-23");
  const [scheduledTime, setScheduledTime] = useState<string>(() => initialDraft?.scheduledTime ?? "10:00");
  const [throttleRate, setThrottleRate] = useState<string>(() => initialDraft?.throttleRate ?? "safe");

  // Email Styling Defaults
  const emailBrandName = initialDraft?.emailBrandName ?? "ACME CORP";
  const emailHeaderStyle = initialDraft?.emailHeaderStyle ?? "clean";
  const emailCtaEnabled = initialDraft?.emailCtaEnabled ?? false;
  const emailCtaText = initialDraft?.emailCtaText ?? "Klaim Penawaran Spesial ➔";
  const emailCtaUrl = initialDraft?.emailCtaUrl ?? "https://acmecorp.co/promo";
  const emailCtaColor = initialDraft?.emailCtaColor ?? "indigo";
  const [emailEditorMode, setEmailEditorMode] = useState<"visual" | "html">(() => initialDraft?.emailEditorMode ?? "visual");
  const emailThemeId = initialDraft?.emailThemeId ?? "plain";
  const [reviewChannelTab, setReviewChannelTab] = useState<DeliveryChannel>(() => initialDraft?.selectedChannels?.[0] || "Email");

  // Modals & Draft Info
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(() => {
    return Boolean(
      initialDraft &&
        (initialDraft.campaignName ||
          initialDraft.emailSubject ||
          initialDraft.emailContent ||
          (initialDraft.currentStep && initialDraft.currentStep > 1))
    );
  });

  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    if (initialDraft?.updatedAt) {
      return new Date(initialDraft.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return "";
  });

  // Save to LocalStorage
  const saveDraftToStorage = (overrides?: Partial<DraftPayload>) => {
    const effectiveName = overrides?.campaignName !== undefined ? overrides.campaignName : campaignName;
    const effectiveStep = overrides?.currentStep !== undefined ? overrides.currentStep : currentStep;

    if (!effectiveName.trim() && effectiveStep === 1) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      return;
    }

    const data: DraftPayload = {
      campaignName,
      selectedChannels,
      emailSender,
      replyToEmail,
      selectedAudience,
      selectedTemplateId,
      activeTemplateTab,
      emailSubject,
      emailContent,
      waContent,
      telegramContent,
      scheduleType,
      scheduledDate,
      scheduledTime,
      throttleRate,
      currentStep,
      maxStepReached,
      updatedAt: new Date().toISOString(),
      emailBrandName,
      emailHeaderStyle,
      emailCtaEnabled,
      emailCtaText,
      emailCtaUrl,
      emailCtaColor,
      emailEditorMode,
      emailThemeId,
      ...overrides,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("Gagal menyimpan draft ke localStorage:", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (campaignName.trim() || currentStep > 1) {
        saveDraftToStorage();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    campaignName,
    selectedChannels,
    emailSender,
    replyToEmail,
    selectedAudience,
    selectedTemplateId,
    activeTemplateTab,
    emailSubject,
    emailContent,
    waContent,
    telegramContent,
    scheduleType,
    scheduledDate,
    scheduledTime,
    throttleRate,
    currentStep,
    maxStepReached,
    emailEditorMode,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (campaignName.trim() || currentStep > 1) {
        saveDraftToStorage();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  });

  const currentSenderProfile =
    SENDER_PROFILES.find((p) => p.id === emailSender) || SENDER_PROFILES[0];
  const currentAudienceObj =
    AUDIENCE_OPTIONS.find((a) => a.id === selectedAudience) || AUDIENCE_OPTIONS[0];

  const isFormDirty = () => campaignName.trim().length > 0 || currentStep > 1;

  const handleAttemptCancel = () => {
    if (!isFormDirty()) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      navigate("/campaigns");
      return;
    }
    setShowCancelModal(true);
  };

  const handleSaveDraftAndExit = () => {
    if (!isFormDirty()) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      setShowCancelModal(false);
      navigate("/campaigns");
      return;
    }
    saveDraftToStorage();
    toast.success(`Draf kampanye "${campaignName || "Tanpa Judul"}" tersimpan dengan aman.`);
    setShowCancelModal(false);
    navigate("/campaigns");
  };

  const handleManualSave = () => {
    saveDraftToStorage();
    toast.success("Draf kampanye tersimpan!");
  };

  const handleDiscardAndExit = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
    setShowCancelModal(false);
    toast.info("Draf kampanye dibuang.");
    navigate("/campaigns");
  };

  const handleResetDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
    setCampaignName("");
    setSelectedChannels(["Email"]);
    setEmailSender("promo@acmecorp.co");
    setReplyToEmail("support@acmecorp.co");
    setSelectedAudience("all-subscribers");
    setSelectedTemplateId("blank");
    setEmailSubject("");
    setEmailContent("");
    setWaContent("");
    setTelegramContent("");
    setCurrentStep(1);
    setMaxStepReached(1);
    setHasRestoredDraft(false);
    setShowResetModal(false);
    setShowCancelModal(false);
    toast.info("Draf telah di-reset ke pengaturan awal.");
  };

  const handleSelectTemplate = (template: PresetTemplate) => {
    setSelectedTemplateId(template.id);
    setEmailSubject(template.emailSubject);
    setEmailContent(template.emailContent);
    setWaContent(template.waContent);
    setTelegramContent(template.telegramContent);

    if (template.id === "blank") {
      toast.info("Memilih Blank Template. Anda dapat menulis pesan dari awal.");
    } else {
      toast.success(`Template "${template.name}" berhasil diterapkan.`);
    }
  };

  const handleToggleChannel = (target: DeliveryChannel) => {
    if (selectedChannels.includes(target)) {
      if (selectedChannels.length === 1) {
        toast.error("Minimal harus memilih 1 saluran pengiriman!");
        return;
      }
      const updated = selectedChannels.filter((c) => c !== target);
      setSelectedChannels(updated);
      if (activeTemplateTab === target) {
        setActiveTemplateTab(updated[0]);
      }
    } else {
      const updated = [...selectedChannels, target];
      setSelectedChannels(updated);
    }
  };

  const handleInsertTag = (tag: string) => {
    const placeholder = `{{${tag}}}`;
    if (activeTemplateTab === "Email") {
      setEmailContent((prev) => (prev ? `${prev} ${placeholder}` : `<p>${placeholder}</p>`));
    } else if (activeTemplateTab === "WhatsApp") {
      setWaContent((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
    } else {
      setTelegramContent((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
    }
    toast.success(`Variabel ${placeholder} disisipkan!`);
  };

  const canContinue = () => {
    if (currentStep === 1) {
      return campaignName.trim().length > 0 && selectedChannels.length > 0;
    }
    if (currentStep === 3) {
      if (selectedChannels.includes("Email") && !emailContent.trim()) return false;
      if (selectedChannels.includes("WhatsApp") && !waContent.trim()) return false;
      if (selectedChannels.includes("Telegram") && !telegramContent.trim()) return false;
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxStepReached((prev) => Math.max(prev, nextStep));
    } else {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}

      toast.success(
        `Kampanye "${campaignName}" multichannel (${selectedChannels.join(", ")}) berhasil ${
          scheduleType === "instant" ? "diluncurkan!" : "dijadwalkan!"
        }`
      );
      navigate("/campaigns");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      className={`min-h-[85vh] flex flex-col justify-between mx-auto px-2 sm:px-4 py-4 space-y-6 transition-all duration-300 ${
        currentStep === 3 ? "max-w-6xl" : "max-w-5xl"
      }`}
    >
      {/* 1. TOP HEADER & CLOSE / SAVE CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              New Campaign
            </h1>
            <span className="rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.5 text-[11px] font-bold">
              Multi-Channel
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Follow the steps below to create and send your campaign.</span>
            <span className="text-slate-300">•</span>
            {!campaignName.trim() && currentStep === 1 ? (
              <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                <span>Form baru</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Draf tersimpan otomatis {lastSavedTime ? `(pk. ${lastSavedTime})` : ""}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleManualSave}
            title="Simpan perubahan draf sekarang"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200/80 bg-sky-50/60 hover:bg-sky-100 text-sky-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Bookmark className="h-3.5 w-3.5 fill-sky-600 text-sky-600" />
            <span>Simpan Draf</span>
          </button>

          <button
            type="button"
            onClick={handleAttemptCancel}
            title="Tutup & Simpan Draft"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-rose-50/80 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold shadow-2xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            <X className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* DRAFT RESTORED BANNER */}
      {hasRestoredDraft && (
        <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-2.5 text-xs text-sky-900 shadow-2xs max-w-3xl w-full mx-auto animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span>
              <strong>Draf Otomatis Aktif:</strong> Melanjutkan data kampanye yang tersimpan{" "}
              {lastSavedTime ? `(tersimpan pk. ${lastSavedTime})` : ""}. Data Anda 100% aman.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-[11px] font-semibold text-sky-700 hover:text-rose-600 underline cursor-pointer"
          >
            Mulai Baru (Reset Draf)
          </button>
        </div>
      )}

      {/* 2. STEPPER NAVIGATION */}
      <CampaignWizardStepper
        currentStep={currentStep}
        maxStepReached={maxStepReached}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* 3. MAIN STEP CARD */}
      <div
        className={`rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs w-full mx-auto flex-1 flex flex-col justify-center transition-all duration-300 ${
          currentStep === 3 ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        {currentStep === 1 && (
          <StepChannel
            campaignName={campaignName}
            onCampaignNameChange={setCampaignName}
            selectedChannels={selectedChannels}
            onToggleChannel={handleToggleChannel}
            emailSender={emailSender}
            onEmailSenderChange={setEmailSender}
            replyToEmail={replyToEmail}
            onReplyToEmailChange={setReplyToEmail}
            waSender={waSender}
            telegramBot={telegramBot}
            senderProfiles={SENDER_PROFILES}
          />
        )}

        {currentStep === 2 && (
          <StepAudience
            selectedAudience={selectedAudience}
            onSelectAudience={setSelectedAudience}
            selectedChannels={selectedChannels}
            audienceOptions={AUDIENCE_OPTIONS}
          />
        )}

        {currentStep === 3 && (
          <StepTemplate
            campaignName={campaignName}
            selectedChannels={selectedChannels}
            activeTemplateTab={activeTemplateTab}
            onActiveTemplateTabChange={setActiveTemplateTab}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            presetTemplates={PRESET_TEMPLATES}
            emailSubject={emailSubject}
            onEmailSubjectChange={setEmailSubject}
            emailContent={emailContent}
            onEmailContentChange={setEmailContent}
            waContent={waContent}
            onWaContentChange={setWaContent}
            telegramContent={telegramContent}
            onTelegramContentChange={setTelegramContent}
            emailEditorMode={emailEditorMode}
            onEmailEditorModeChange={setEmailEditorMode}
            emailBrandName={emailBrandName}
            emailHeaderStyle={emailHeaderStyle}
            emailCtaEnabled={emailCtaEnabled}
            emailCtaText={emailCtaText}
            emailCtaUrl={emailCtaUrl}
            emailCtaColor={emailCtaColor}
            emailThemeId={emailThemeId}
            onOpenMergeModal={() => setShowMergeModal(true)}
            onSaveTemplate={handleManualSave}
          />
        )}

        {currentStep === 4 && (
          <StepSchedule
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            scheduledDate={scheduledDate}
            onScheduledDateChange={setScheduledDate}
            scheduledTime={scheduledTime}
            onScheduledTimeChange={setScheduledTime}
            throttleRate={throttleRate}
            onThrottleRateChange={setThrottleRate}
          />
        )}

        {currentStep === 5 && (
          <StepReview
            selectedChannels={selectedChannels}
            campaignName={campaignName}
            currentSenderProfile={currentSenderProfile}
            currentAudienceObj={currentAudienceObj}
            scheduleType={scheduleType}
            scheduledDate={scheduledDate}
            scheduledTime={scheduledTime}
            throttleRate={throttleRate}
            emailSubject={emailSubject}
            emailContent={emailContent}
            waContent={waContent}
            telegramContent={telegramContent}
            emailBrandName={emailBrandName}
            emailCtaEnabled={emailCtaEnabled}
            emailCtaText={emailCtaText}
            emailCtaColor={emailCtaColor}
            emailThemeId={emailThemeId}
            reviewChannelTab={reviewChannelTab}
            onReviewChannelTabChange={setReviewChannelTab}
            onEditStep={(step) => setCurrentStep(step)}
          />
        )}
      </div>

      {/* 4. BOTTOM ACTION BAR */}
      <div
        className={`flex items-center justify-between w-full mx-auto pt-2 transition-all duration-300 ${
          currentStep === 3 ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAttemptCancel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>{!campaignName.trim() && currentStep === 1 ? "Batal" : "Batal & Simpan Draf"}</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium select-none">
          Step {currentStep} of 5
        </span>

        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </button>
          )}

          <button
            type="button"
            disabled={!canContinue()}
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95 ${
              canContinue()
                ? currentStep === 5
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-600/20"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>{currentStep === 5 ? "Luncurkan Kampanye" : "Continue"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 5. MODALS */}
      <CancelCampaignModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onSaveDraftAndExit={handleSaveDraftAndExit}
        onDiscardAndExit={handleDiscardAndExit}
      />

      <ResetCampaignModal
        open={showResetModal}
        onOpenChange={setShowResetModal}
        onReset={handleResetDraft}
      />

      <MergeTagsModal
        open={showMergeModal}
        onOpenChange={setShowMergeModal}
        onSelectTag={handleInsertTag}
      />
    </div>
  );
};

export default NewCampaignPage;
