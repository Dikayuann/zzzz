import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MergeTagsModal } from "@/components/campaigns/MergeTagsModal";
import type {
  DeliveryChannel,
  PresetTemplate,
  AudienceOption,
  DraftPayload,
  SenderProfile,
} from "@/types/campaignWizard";
import {
  PRESET_TEMPLATES,
  SENDER_PROFILES,
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

  // state untuk melacak proses kirim API
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
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
  const [emailSender, setEmailSender] = useState<string>(() => initialDraft?.emailSender && initialDraft.emailSender !== "promo@acmecorp.co" ? initialDraft.emailSender : "");
  const [replyToEmail, setReplyToEmail] = useState<string>(() => initialDraft?.replyToEmail && initialDraft.replyToEmail !== "support@acmecorp.co" ? initialDraft.replyToEmail : "");
  
  const [channelStatus, setChannelStatus] =useState({
    email: { connected: false, fromEmail: "", fromName: "" },
    whatsapp: { connected: false, phoneNumber: "", pushName: "" },
    telegram: { connected: false, botUsername: "" },
    isLoading: true,
  }) 

  // Audience & Templates dari Database
  const [selectedAudience, setSelectedAudience] = useState<string>(() => {
    if (initialDraft?.selectedAudience && initialDraft.selectedAudience !== "all-subscribers") {
      return initialDraft.selectedAudience;
    }
    return "all";
  });
  const [audienceOptions, setAudienceOptions] = useState<AudienceOption[]>([
    {
      id: "all",
      name: "Semua Kontak Aktif",
      desc: "Seluruh kontak aktif yang terdaftar di database",
      count: 0,
      badge: "Semua",
    },
  ]);
  const [availableTemplates, setAvailableTemplates] = useState<PresetTemplate[]>(PRESET_TEMPLATES);
  const [isLoadingAudiences, setIsLoadingAudiences] = useState<boolean>(true);

  // Template & Composer State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => initialDraft?.selectedTemplateId ?? "blank");
  const [activeTemplateTab, setActiveTemplateTab] = useState<DeliveryChannel>(() => initialDraft?.activeTemplateTab ?? "Email");
  const [emailSubject, setEmailSubject] = useState<string>(() => initialDraft?.emailSubject ?? "");
  const [emailContent, setEmailContent] = useState<string>(() => initialDraft?.emailContent ?? "");
  const [waContent, setWaContent] = useState<string>(() => initialDraft?.waContent ?? "");
  const [telegramContent, setTelegramContent] = useState<string>(() => initialDraft?.telegramContent ?? "");

  const getTodayDateString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayDateStr = getTodayDateString();

  // Schedule & Throttle
  const [scheduleType, setScheduleType] = useState<"instant" | "scheduled">(() => {
    if (initialDraft?.selectedChannels?.includes("WhatsApp")) return "scheduled";
    return initialDraft?.scheduleType ?? "instant";
  });
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    if (initialDraft?.scheduledDate && initialDraft.scheduledDate >= todayDateStr) {
      return initialDraft.scheduledDate;
    }
    return todayDateStr;
  });
  const [scheduledTime, setScheduledTime] = useState<string>(() => initialDraft?.scheduledTime ?? "09:00");
  const [sendStartTime, setSendStartTime] = useState<string>(() => initialDraft?.sendStartTime ?? "09:00");
  const [sendEndTime, setSendEndTime] = useState<string>(() => initialDraft?.sendEndTime ?? "17:00");
  const [enableSendingWindow, setEnableSendingWindow] = useState<boolean>(() => initialDraft?.enableSendingWindow ?? false);
  const [enableEndDate, setEnableEndDate] = useState<boolean>(() => initialDraft?.enableEndDate ?? false);
  const [endDate, setEndDate] = useState<string>(() => {
    if (initialDraft?.endDate && initialDraft.endDate >= todayDateStr) {
      return initialDraft.endDate;
    }
    return "";
  });
  const [throttleRate, setThrottleRate] = useState<string>(() => initialDraft?.throttleRate ?? "safe");

  const emailBrandName =
    initialDraft?.emailBrandName && initialDraft.emailBrandName !== "ACME CORP" && initialDraft.emailBrandName !== "Brand Resmi"
      ? initialDraft.emailBrandName
      : channelStatus.email.fromName || "Campaign Blast";
  const emailHeaderStyle = initialDraft?.emailHeaderStyle ?? "minimal";
  const emailCtaEnabled = initialDraft?.emailCtaEnabled ?? false;
  const emailCtaText = initialDraft?.emailCtaText ?? "Klaim Penawaran Spesial ➔";
  const emailCtaUrl =
    initialDraft?.emailCtaUrl && !initialDraft.emailCtaUrl.includes("acmecorp")
      ? initialDraft.emailCtaUrl
      : "#";
  const emailCtaColor = initialDraft?.emailCtaColor ?? "indigo";
  const [emailEditorMode, setEmailEditorMode] = useState<"visual" | "html">(() => initialDraft?.emailEditorMode ?? "visual");
  const emailThemeId = initialDraft?.emailThemeId ?? "plain";
  const [reviewChannelTab, setReviewChannelTab] = useState<DeliveryChannel>(() => initialDraft?.selectedChannels?.[0] || "Email");

  // Modals & Draft Info
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);


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
      sendStartTime,
      sendEndTime,
      enableSendingWindow,
      enableEndDate,
      endDate,
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
    enableSendingWindow,
    enableEndDate,
    endDate,
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

  // Ambil data kontak, list, tag, dan template asli dari Database
  useEffect(() => {
    let isMounted = true;

    const loadAudienceAndTemplates = async () => {
      try {
        const [contactsRes, listsRes, tagsRes, templatesRes,smtpRes,waRes,tgRes] = await Promise.allSettled([
          api.get("/contacts?limit=1"),
          api.get("/lists"),
          api.get("/tags"),
          api.get("/templates"),
          api.get("/settings/smtp"),
          api.get("/channels/whatsapp/qr/status"),
          api.get("/channels/telegram")
        ]);

        if (!isMounted) return;
        //  Evaluasi status koneksi masing-masing saluran
        const smtpData = smtpRes.status === "fulfilled" ? smtpRes.value.data?.data: null;
        const isEmailConnected = Boolean(smtpData && smtpData.host);

        const waData = waRes.status === "fulfilled" ? waRes.value.data?.data: null;
        const isWaConnected = waData?.status === "connected"

        const tgPayload = tgRes.status === "fulfilled" ? tgRes.value.data?.data || tgRes.value.data : null;
        const tgBot = tgPayload?.bot || tgPayload;
        const isTgConnected = Boolean(tgPayload?.status === "connected" || tgBot?.status === "connected");

        setChannelStatus({
          email: {
            connected: isEmailConnected,
            fromEmail: smtpData?.fromEmail || "",
            fromName: smtpData?.fromName || "",
          },
          whatsapp: {
            connected: isWaConnected,
            phoneNumber: waData?.phoneNumber ? `+${waData.phoneNumber}` : "",
            pushName: waData?.pushName || "",
          },
          telegram: {
            connected: isTgConnected,
            botUsername: tgBot?.botUsername ? `@${tgBot.botUsername.replace(/^@/, "")}` : "",
          },
          isLoading: false,
        });

        if (smtpData?.fromEmail) {
          setEmailSender((prev) => (!prev || prev === "promo@acmecorp.co" ? smtpData.fromEmail : prev));
          setReplyToEmail((prev) => (!prev || prev === "support@acmecorp.co" ? smtpData.fromEmail : prev));
        }

        const activeList: DeliveryChannel[] = [];
        if (isEmailConnected) activeList.push("Email");
        if (isWaConnected) activeList.push("WhatsApp");
        if (isTgConnected) activeList.push("Telegram");

        if (activeList.length > 0) {
          setSelectedChannels([activeList[0]]);
          setActiveTemplateTab(activeList[0]);
        }

        const totalContacts =
          contactsRes.status === "fulfilled"
            ? (contactsRes.value.data?.pagination?.total ??
               contactsRes.value.data?.data?.pagination?.total ??
               contactsRes.value.data?.data?.meta?.total ??
               contactsRes.value.data?.meta?.total ??
               0)
            : 0;

        const dynamicAudiences: AudienceOption[] = [
          {
            id: "all",
            name: "Semua Kontak Aktif",
            desc: "Seluruh kontak aktif yang terdaftar di database",
            count: totalContacts,
            badge: "Semua",
          },
        ];

        if (listsRes.status === "fulfilled" && Array.isArray(listsRes.value.data?.data)) {
          listsRes.value.data.data.forEach((l: any) => {
            dynamicAudiences.push({
              id: `list:${l.id}`,
              name: l.name,
              desc: l.description || `Folder kontak: ${l.name}`,
              count: l.contactCount ?? 0,
              badge: "List",
            });
          });
        }

        if (tagsRes.status === "fulfilled" && Array.isArray(tagsRes.value.data?.data)) {
          tagsRes.value.data.data.forEach((t: any) => {
            dynamicAudiences.push({
              id: `tag:${t.id}`,
              name: `#${t.name}`,
              desc: `Kontak dengan label #${t.name}`,
              count: t.contactCount ?? 0,
              badge: "Tag",
            });
          });
        }

        if (dynamicAudiences.length > 0) {
          setAudienceOptions(dynamicAudiences);

          setSelectedAudience((prev) => {
            if (prev === "all-subscribers" || !dynamicAudiences.some((a) => a.id === prev)) {
              return "all";
            }
            return prev;
          });
        }

        if (templatesRes.status === "fulfilled" && Array.isArray(templatesRes.value.data?.data)) {
          const dbTemplates = templatesRes.value.data.data;
          const formattedDb: PresetTemplate[] = dbTemplates.map((t: any) => {
            const ver = t.versions?.[0] || {};
            return {
              id: String(t.id),
              name: t.name,
              badge: t.channelMode ? t.channelMode.toUpperCase() : "Pustaka",
              desc: `Template tersimpan di sistem`,
              icon: Bookmark,
              iconColor: "text-sky-600 bg-sky-50",
              emailSubject: ver.subject || "",
              emailContent: ver.contentHtml || "",
              waContent: ver.contentWhatsapp || "",
              telegramContent: ver.contentTelegram || "",
            };
          });

          // Gabungkan template bawaan dengan seluruh template database nyata
          setAvailableTemplates([...PRESET_TEMPLATES, ...formattedDb]);
        }
      } catch (err) {
        console.error("Gagal memuat audiens / template:", err);
      } finally {
        if (isMounted) setIsLoadingAudiences(false);
      }
    };

    loadAudienceAndTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter template hanya yang relevan dengan saluran terpilih (WhatsApp / Email / Telegram)
  const filteredTemplates = useMemo(() => {
    const activeChannel = selectedChannels[0] || "Email";
    return availableTemplates.filter((tmpl) => {
      if (tmpl.id === "blank") return true;
      const mode = (tmpl.badge || "").toLowerCase();
      if (mode === "multiple") return true;

      if (activeChannel === "WhatsApp") {
        return mode === "whatsapp" || Boolean(tmpl.waContent?.trim());
      }
      if (activeChannel === "Email") {
        return mode === "email" || Boolean(tmpl.emailContent?.trim());
      }
      if (activeChannel === "Telegram") {
        return mode === "telegram" || Boolean(tmpl.telegramContent?.trim());
      }
      return false;
    });
  }, [availableTemplates, selectedChannels]);

  // Jika template terpilih tidak ada di filteredTemplates, hanya ubah selectedTemplateId tanpa menghapus isi pesan yang sudah ada
  useEffect(() => {
    if (availableTemplates.length > 0 && !filteredTemplates.some((t) => t.id === selectedTemplateId)) {
      setSelectedTemplateId("blank");
    }
  }, [filteredTemplates, selectedTemplateId, availableTemplates.length]);

  const currentSenderProfile: SenderProfile = useMemo(() => {
    const base = SENDER_PROFILES.find((p) => p.id === emailSender) || SENDER_PROFILES[0];
    return {
      id: emailSender || base?.id || "smtp",
      name: channelStatus.email.fromName || base?.name || "Pengirim Resmi",
      email: channelStatus.email.fromEmail || emailSender || base?.email || "pengirim@domain.com",
      quota: base?.quota || "Unlimited",
      badge: channelStatus.email.connected ? "Terhubung" : base?.badge || "Standar",
    };
  }, [channelStatus.email, emailSender]);
  const currentAudienceObj =
    audienceOptions.find((a) => a.id === selectedAudience) || audienceOptions[0] || {
      id: "all",
      name: "Semua Kontak Aktif",
      desc: "Seluruh kontak aktif yang terdaftar di database",
      count: 0,
      badge: "Semua",
    };

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
    setEmailSender(channelStatus.email.fromEmail || "");
    setReplyToEmail(channelStatus.email.fromEmail || "");
    setSelectedAudience("all-subscribers");
    setSelectedTemplateId("blank");
    setEmailSubject("");
    setEmailContent("");
    setWaContent("");
    setTelegramContent("");
    setCurrentStep(1);
    setMaxStepReached(1);
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

  const fetchTemplatesList = async () => {
    try {
      const res = await api.get("/templates");
      if (Array.isArray(res.data?.data)) {
        const dbTemplates = res.data.data;
        const formattedDb: PresetTemplate[] = dbTemplates.map((t: any) => {
          const ver = t.versions?.[0] || {};
          return {
            id: String(t.id),
            name: t.name,
            badge: t.channelMode ? t.channelMode.toUpperCase() : "Pustaka",
            desc: `Template tersimpan di sistem`,
            icon: Bookmark,
            iconColor: "text-sky-600 bg-sky-50",
            emailSubject: ver.subject || "",
            emailContent: ver.contentHtml || "",
            waContent: ver.contentWhatsapp || "",
            telegramContent: ver.contentTelegram || "",
          };
        });
        setAvailableTemplates([...PRESET_TEMPLATES, ...formattedDb]);
        return formattedDb;
      }
    } catch (e) {
      console.error("Gagal memperbarui daftar template:", e);
    }
    return [];
  };

  const handleRefreshTemplates = async () => {
    const list = await fetchTemplatesList();
    toast.success(`Daftar template berhasil diperbarui (${list.length} template tersedia).`);
  };

  const handleOpenTemplatesPage = (editId?: string) => {
    saveDraftToStorage();
    const url = editId
      ? `/templates?id=${editId}&from=campaign&returnTo=/campaigns/new`
      : `/templates?from=campaign&returnTo=/campaigns/new`;
    navigate(url);
  };

  useEffect(() => {
    const handleFocus = () => {
      fetchTemplatesList();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleToggleChannel = (target: DeliveryChannel) => {
    setSelectedChannels([target]); // hanya 1 saluran aktif
    setActiveTemplateTab(target); // template otomatis menyesuaikan channel
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

  const isContentEmpty = (content: string | undefined | null): boolean => {
    if (!content) return true;
    if (content.includes("<img")) return false;
    const stripped = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim();
    return stripped.length === 0;
  };

  const getStepValidationError = (step: number): string | null => {
    if (step === 1) {
      if (!campaignName.trim()) return "Nama kampanye wajib diisi!";
      if (selectedChannels.length === 0) return "Pilih setidaknya satu saluran pengiriman!";
      return null;
    }
    if (step === 2) {
      if (!selectedAudience) return "Pilih target audiens terlebih dahulu!";
      return null;
    }
    if (step === 3) {
      if (selectedChannels.includes("Email")) {
        if (!emailSubject.trim()) return "Subjek email wajib diisi sebelum lanjut!";
        if (isContentEmpty(emailContent)) return "Isi pesan email masih kosong. Silakan tulis pesan atau pilih template!";
      }
      if (selectedChannels.includes("WhatsApp")) {
        if (isContentEmpty(waContent)) return "Isi pesan WhatsApp masih kosong. Silakan tulis pesan atau pilih template!";
      }
      if (selectedChannels.includes("Telegram")) {
        if (isContentEmpty(telegramContent)) return "Isi pesan Telegram masih kosong. Silakan tulis pesan atau pilih template!";
      }
      return null;
    }
    if (step === 4) {
      if (selectedChannels.includes("WhatsApp")) {
        if (!scheduledDate) return "Pilih tanggal mulai pengiriman WhatsApp!";
        if (!sendStartTime || !sendEndTime) return "Tentukan jam mulai dan jam selesai kerja WhatsApp!";
        if (sendStartTime >= sendEndTime) {
          return "Jam mulai kerja harus lebih awal dari jam selesai kerja (contoh: 09:00 – 17:00 WIB)!";
        }
      }

      if (scheduleType === "scheduled") {
        if (!scheduledDate || !scheduledTime) {
          return "Pilih tanggal dan jam pengiriman!";
        }
        const scheduleDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
        if (scheduleDateTime.getTime() < Date.now() - 2 * 60 * 1000) {
          return "Waktu peluncuran terjadwal tidak boleh berada di masa lampau!";
        }
      }

      if (enableSendingWindow) {
        if (!sendStartTime || !sendEndTime) {
          return "Tentukan jam mulai dan jam selesai kerja pengiriman!";
        }
        if (sendStartTime >= sendEndTime) {
          return "Jam mulai kerja harus lebih awal dari jam selesai kerja (contoh: 09:00 – 17:00 WIB)!";
        }
      }

      // Validasi Batas Tanggal Berakhir
      if (enableEndDate) {
        if (!endDate) {
          return "Tentukan tanggal batas akhir pengiriman atau nonaktifkan opsi batas waktu!";
        }
        const startDateStr = (selectedChannels.includes("WhatsApp") || scheduleType === "scheduled") && scheduledDate
          ? scheduledDate
          : todayDateStr;
        if (endDate < startDateStr) {
          return `Tanggal batas akhir (${endDate}) tidak boleh lebih awal dari tanggal pengiriman (${startDateStr})!`;
        }
      }

      return null;
    }
    return null;
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      saveDraftToStorage({ currentStep: targetStep });
      return;
    }
    // Validasi setiap step antara currentStep sampai targetStep
    for (let s = currentStep; s < targetStep; s++) {
      const err = getStepValidationError(s);
      if (err) {
        toast.error(err);
        return;
      }
    }
    setCurrentStep(targetStep);
    saveDraftToStorage({ currentStep: targetStep });
  };

  const handleNext = async () => {
    const err = getStepValidationError(currentStep);
    if (err) {
      toast.error(err);
      return;
    }

    // Jika masih di Step 1 sampai 4, lanjut ke step berikutnya seperti biasa
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      const nextMax = Math.max(maxStepReached, nextStep);
      setCurrentStep(nextStep);
      setMaxStepReached(nextMax);
      saveDraftToStorage({ currentStep: nextStep, maxStepReached: nextMax });
      return;
    }

    // STEP 5: User klik tombol "Luncurkan Kampanye"
    setIsSubmitting(true);

    try {
      // 1. Tentukan saluran pengiriman utama
      const primaryChannel = selectedChannels.includes("WhatsApp")
        ? "whatsapp_qr"
        : selectedChannels.includes("Telegram")
        ? "telegram"
        : "email";

      // 2. Format target audiens
      let audienceType = "all";
      let audienceRef: string | null = null;
      if (selectedAudience.startsWith("list:")) {
        audienceType = "list";
        audienceRef = selectedAudience;
      } else if (selectedAudience.startsWith("tag:")) {
        audienceType = "tag";
        audienceRef = selectedAudience;
      }

      // 3. Format waktu jadwal (jika user memilih jadwal di masa depan atau WhatsApp)
      let scheduledAt: string | null = null;
      let recurrenceRule: string | null = null;

      const windowRule =
        selectedChannels.includes("WhatsApp") || enableSendingWindow
          ? `window:${sendStartTime}-${sendEndTime}`
          : null;
      const untilRule = enableEndDate && endDate ? `until:${endDate}` : null;

      const ruleParts = [windowRule, untilRule].filter(Boolean);
      recurrenceRule = ruleParts.length > 0 ? ruleParts.join(";") : null;

      if (selectedChannels.includes("WhatsApp")) {
        scheduledAt = new Date(`${scheduledDate}T${sendStartTime}:00`).toISOString();
      } else if (scheduleType === "scheduled" && scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      } else {
        scheduledAt = new Date().toISOString();
      }

      // 4. Hubungkan / Auto-create template ke database MariaDB
      // Backend mewajibkan 'templateId' sebelum kampanye dapat dijadwalkan
      let dbTemplateId: number | null = null;
      if (selectedTemplateId && !isNaN(Number(selectedTemplateId))) {
        dbTemplateId = Number(selectedTemplateId);
      } else {
        // Buat template di DB dengan konten dari wizard Step 3
        const tplRes = await api.post("/templates", {
          name: `Tpl: ${campaignName.trim()} #${Date.now().toString().slice(-4)}`,
          channelMode: "multiple",
          subject: emailSubject || campaignName.trim(),
          contentHtml: emailContent || `<p>${campaignName.trim()}</p>`,
          contentWhatsapp: waContent || "",
          contentTelegram: telegramContent || "",
        });
        dbTemplateId = tplRes.data?.data?.id || null;
      }

      // 5. Siapkan payload data sesuai schema backend (createCampaignSchema)
      const payload = {
        name: campaignName.trim(),
        channel: primaryChannel,
        templateId: dbTemplateId,
        audienceType,
        audienceRef,
        scheduledAt,
        recurrenceRule,
      };

      // 6. Panggil API backend POST /api/v1/campaigns
      const res = await api.post("/campaigns", payload);
      const createdCampaign = res.data?.data;

      // 7. Jika tipe 'instant' atau WhatsApp, langsung antrikan penerima untuk blast
      if ((scheduleType === "instant" || selectedChannels.includes("WhatsApp")) && createdCampaign?.id) {
        await api.post(`/campaigns/${createdCampaign.id}/schedule`);
        await api.post(`/campaigns/${createdCampaign.id}/send-now`);
      }


      // Hapus draf lokal di browser setelah sukses
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}

      toast.success(
        `Kampanye "${campaignName}" berhasil ${
          scheduleType === "instant"
            ? "diluncurkan ke antrean blast! 🚀"
            : "dijadwalkan!"
        }`
      );

      // Pindah ke halaman tabel kampanye
      navigate("/campaigns");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal membuat kampanye. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Buat Kampanye
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Tentukan saluran, target audiens, template pesan, dan jadwal peluncuran.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {lastSavedTime && (
            <span className="text-[11px] text-slate-400 font-medium mr-1">
              Tersimpan {lastSavedTime}
            </span>
          )}

          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Bookmark className="h-3.5 w-3.5 text-slate-500" />
            <span>Simpan</span>
          </button>

          <button
            type="button"
            onClick={handleAttemptCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <X className="h-3.5 w-3.5 text-slate-500" />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* 2. STEPPER NAVIGATION */}
      <CampaignWizardStepper
        currentStep={currentStep}
        maxStepReached={maxStepReached}
        onStepClick={handleStepClick}
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
            waSender={channelStatus.whatsapp.phoneNumber || "Belum ada nomor terhubung"}
            telegramBot={channelStatus.telegram.botUsername || "Belum ada bot terhubung"}
            senderProfiles={SENDER_PROFILES}
            channelStatus={channelStatus}
          />
        )}

        {currentStep === 2 && (
          <div className="relative space-y-3">
            {isLoadingAudiences && (
              <div className="flex items-center justify-end gap-1.5 text-[11px] text-sky-600 font-medium">
                <span className="h-3 w-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span>Memuat data segmen & list kontak...</span>
              </div>
            )}
            <StepAudience
              selectedAudience={selectedAudience}
              onSelectAudience={setSelectedAudience}
              selectedChannels={selectedChannels}
              audienceOptions={audienceOptions}
            />
          </div>
        )}

        {currentStep === 3 && (
          <StepTemplate
            campaignName={campaignName}
            selectedChannels={selectedChannels}
            activeTemplateTab={activeTemplateTab}
            onActiveTemplateTabChange={setActiveTemplateTab}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            presetTemplates={filteredTemplates}
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
            waSenderName={channelStatus.whatsapp.pushName || "WhatsApp Official"}
            telegramBotName={channelStatus.telegram.botUsername || "Official Telegram Bot"}
            emailSenderName={channelStatus.email.fromName || "Campaign Blast"}
            emailSenderAddress={channelStatus.email.fromEmail || emailSender || "dev@zerollz.biz.id"}
            onRefreshTemplates={handleRefreshTemplates}
            onOpenTemplatesPage={handleOpenTemplatesPage}
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
            sendStartTime={sendStartTime}
            onSendStartTimeChange={setSendStartTime}
            sendEndTime={sendEndTime}
            onSendEndTimeChange={setSendEndTime}
            enableSendingWindow={enableSendingWindow}
            onEnableSendingWindowChange={setEnableSendingWindow}
            enableEndDate={enableEndDate}
            onEnableEndDateChange={setEnableEndDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            throttleRate={throttleRate}
            onThrottleRateChange={setThrottleRate}
            selectedChannels={selectedChannels}
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
            sendStartTime={sendStartTime}
            sendEndTime={sendEndTime}
            enableSendingWindow={enableSendingWindow}
            enableEndDate={enableEndDate}
            endDate={endDate}
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
            disabled={isSubmitting}
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition shadow-xs active:scale-95 cursor-pointer ${
              isSubmitting
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : getStepValidationError(currentStep) !== null
                ? "bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-600 shadow-none border border-slate-300/40"
                : currentStep === 5
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-600/20"
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>
                  {currentStep === 5
                    ? scheduleType === "instant"
                      ? "Luncurkan Kampanye"
                      : "Jadwalkan Kampanye"
                    : "Continue"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
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
