import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Send, Loader2, Mail, User, Users, Phone, MessageSquare, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { RecipientPreview } from "@/types/template";

interface ContactOption {
  id: number;
  name: string;
  email: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  teleChatId?: string | null;
  customFields?: Record<string, any>;
}

interface TestSendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: "email" | "whatsapp" | "telegram";
  templateId?: number | null;
  subject: string;
  compiledHtml: string;
  contentWhatsapp?: string;
  contentTelegram?: string;
  mediaUrl?: string;
  activeRecipient?: RecipientPreview;
}

export const TestSendModal: React.FC<TestSendModalProps> = ({
  open,
  onOpenChange,
  channel = "email",
  templateId,
  subject,
  compiledHtml,
  contentWhatsapp,
  contentTelegram,
  mediaUrl,
  activeRecipient,
}) => {
  const { user } = useAuth();

  // Mode selection: "manual" or "contact"
  const [sourceMode, setSourceMode] = useState<"manual" | "contact">("manual");

  // Form states - prefill from logged-in user if available
  const [targetEmail, setTargetEmail] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [targetChatId, setTargetChatId] = useState("");
  const [customName, setCustomName] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Autocomplete dropdown state
  const [isInputFocused, setIsInputFocused] = useState(false);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);

  // Database contacts list state
  const [dbContacts, setDbContacts] = useState<ContactOption[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [sendToTesterMyself, setSendToTesterMyself] = useState(true);

  // Sync default values when modal opens
  useEffect(() => {
    if (open) {
      if (!targetEmail) {
        setTargetEmail(user?.email || "");
      }
      if (!customName) {
        setCustomName(user?.name || activeRecipient?.name || "Tester");
      }
    }
  }, [open, user, activeRecipient]);

  // Fetch contacts from DB whenever modal opens to power autocomplete & suggestions
  useEffect(() => {
    if (open && dbContacts.length === 0) {
      const fetchContacts = async () => {
        setIsLoadingContacts(true);
        try {
          const res = await api.get("/contacts?limit=100");
          const list = res.data?.contacts || res.data?.data || [];
          setDbContacts(list);
          if (list.length > 0 && !selectedContactId) {
            setSelectedContactId(list[0].id);
          }
        } catch (err) {
          console.warn("Could not fetch contacts for test modal:", err);
        } finally {
          setIsLoadingContacts(false);
        }
      };
      fetchContacts();
    }
  }, [open, dbContacts.length, selectedContactId]);

  // Filter contacts who have started the Telegram Bot (have teleChatId)
  const telegramSubscribers = useMemo(() => {
    return dbContacts.filter((c) => {
      const username = (c.customFields as any)?.telegramUsername;
      const teleId = c.teleChatId || (c.customFields as any)?.teleChatId;
      return Boolean(teleId || username);
    });
  }, [dbContacts]);

  // Autocomplete matching for Telegram input
  const teleSuggestions = useMemo(() => {
    if (!telegramSubscribers.length) return [];
    const q = targetChatId.toLowerCase().trim().replace(/^@/, "");
    if (!q) return telegramSubscribers.slice(0, 5);
    return telegramSubscribers.filter((c) => {
      const username = String((c.customFields as any)?.telegramUsername || "").toLowerCase();
      const name = c.name.toLowerCase();
      const teleId = String(c.teleChatId || (c.customFields as any)?.teleChatId || "");
      return username.includes(q) || name.includes(q) || teleId.includes(q);
    }).slice(0, 5);
  }, [telegramSubscribers, targetChatId]);

  // Filter contacts who have WhatsApp numbers
  const whatsappContacts = useMemo(() => {
    return dbContacts.filter((c) => Boolean(c.whatsappNumber || c.phone));
  }, [dbContacts]);

  // When selecting a telegram subscriber from recommendation or suggestion
  const handleSelectTeleSubscriber = (c: ContactOption) => {
    const teleId = c.teleChatId || (c.customFields as any)?.teleChatId;
    const username = (c.customFields as any)?.telegramUsername;
    // Prefer numeric chat ID if available, otherwise username
    setTargetChatId(teleId || username || "");
    setCustomName(c.name);
    setIsInputFocused(false);
    toast.success(`Kontak Telegram "${c.name}" dipilih`, {
      description: `Chat ID: ${teleId || username}`,
    });
  };

  // When selected contact changes in "contact" mode
  const handleContactSelect = (contactId: number) => {
    setSelectedContactId(contactId);
    const found = dbContacts.find((c) => c.id === contactId);
    if (found) {
      setCustomName(found.name);
      if (!sendToTesterMyself) {
        if (found.email) setTargetEmail(found.email);
        if (found.whatsappNumber || found.phone) {
          setTargetPhone(found.whatsappNumber || found.phone || "");
        }
        const teleId = found.teleChatId || (found.customFields as any)?.teleChatId || "";
        if (teleId) setTargetChatId(teleId);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSending) return;
    
    // Validasi target sesuai channel yang aktif
    if (channel === "whatsapp" && !targetPhone.trim()) {
      toast.error("Nomor WhatsApp tujuan wajib diisi!");
      return;
    }
    if (channel === "telegram" && !targetChatId.trim()) {
      toast.error("Chat ID Telegram tujuan wajib diisi!");
      return;
    }
    if (channel === "email" && !targetEmail.trim()) {
      toast.error("Alamat email tujuan wajib diisi!");
      return;
    }

    setIsSending(true);
    try {
      let sampleContactPayload: any = null;
      let contactIdPayload: number | undefined = undefined;

      if (sourceMode === "contact" && selectedContactId) {
        const found = dbContacts.find((c) => c.id === selectedContactId);
        contactIdPayload = selectedContactId;
        if (found) {
          const nameParts = (found.name || "").trim().split(/\s+/);
          sampleContactPayload = {
            name: found.name,
            firstName: nameParts[0] || found.name,
            lastName: nameParts.slice(1).join(" ") || "",
            email: sendToTesterMyself ? targetEmail.trim() : (found.email || targetEmail.trim()),
            phone: sendToTesterMyself ? targetPhone.trim() : (found.whatsappNumber || found.phone || targetPhone.trim()),
          };
        }
      } else {
        // Manual mode
        const defaultTesterName = user?.name || "Tester";
        const nameParts = (customName || defaultTesterName).trim().split(/\s+/);
        sampleContactPayload = {
          name: customName || defaultTesterName,
          firstName: nameParts[0] || defaultTesterName,
          lastName: nameParts.slice(1).join(" ") || "",
          email: targetEmail.trim(),
          phone: targetPhone.trim(),
        };
      }

      const payload: any = {
        channel,
        contactId: contactIdPayload,
        sampleContact: sampleContactPayload,
        orgName: "Campaign Blast",
      };

      if (channel === "whatsapp") {
        payload.targetPhone = targetPhone.trim();
        payload.contentWhatsapp = contentWhatsapp;
        if (mediaUrl) payload.mediaUrl = mediaUrl;
      } else if (channel === "telegram") {
        payload.targetChatId = targetChatId.trim();
        payload.contentTelegram = contentTelegram;
        if (mediaUrl) payload.mediaUrl = mediaUrl;
      } else {
        payload.targetEmail = targetEmail.trim();
        payload.subject = subject || "Uji Coba Template";
        payload.contentHtml = compiledHtml;
      }

      const endpoint = templateId
        ? `/templates/${templateId}/test-send`
        : `/templates/test-send`;

      const res = await api.post(endpoint, payload);

      toast.success(res.data?.message || "Pesan uji coba berhasil dikirim! 🚀");
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal mengirim pesan uji coba";
      toast.error("Pengiriman gagal", { description: msg });
    } finally {
      setIsSending(false);
    }
  };

  const selectedContact = dbContacts.find((c) => c.id === selectedContactId);

  // Dynamic header based on channel
  const headerConfig = {
    whatsapp: {
      icon: <Phone className="h-5 w-5 text-emerald-600" />,
      badgeBg: "bg-emerald-50 border-emerald-100",
      title: "Kirim Pesan WhatsApp Uji Coba",
      description: "Kirim pesan simulasi ke nomor WhatsApp Anda atau kontak pilihan.",
      btnText: "Kirim WhatsApp Sekarang",
      btnBg: "bg-emerald-600 hover:bg-emerald-700",
    },
    telegram: {
      icon: <MessageSquare className="h-5 w-5 text-sky-600" />,
      badgeBg: "bg-sky-50 border-sky-100",
      title: "Kirim Pesan Telegram Uji Coba",
      description: "Kirim pesan uji coba ke akun atau Chat ID Telegram Anda untuk menguji format Markdown/HTML dan variabel merge tag.",
      btnText: "Kirim Telegram Sekarang",
      btnBg: "bg-sky-600 hover:bg-sky-700",
    },
    email: {
      icon: <Mail className="h-5 w-5 text-indigo-600" />,
      badgeBg: "bg-indigo-50 border-indigo-100",
      title: "Kirim Email Uji Coba",
      description: "Pilih apakah ingin memasukkan email & nama penerima secara manual, atau mengambil simulasi profil dari daftar kontak database.",
      btnText: "Kirim Email Sekarang",
      btnBg: "bg-indigo-600 hover:bg-indigo-700",
    },
  }[channel] || {
    icon: <Mail className="h-5 w-5 text-indigo-600" />,
    badgeBg: "bg-indigo-50 border-indigo-100",
    title: "Kirim Email Uji Coba",
    description: "Kirim simulasi pesan ke tujuan pengujian Anda.",
    btnText: "Kirim Sekarang",
    btnBg: "bg-indigo-600 hover:bg-indigo-700",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${headerConfig.badgeBg}`}>
              {headerConfig.icon}
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {headerConfig.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            {headerConfig.description}
          </DialogDescription>
        </DialogHeader>

        {/* MODE SELECTOR PILLS */}
        <div className="flex p-1 bg-slate-100 rounded-xl gap-1 mt-1">
          <button
            type="button"
            onClick={() => setSourceMode("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              sourceMode === "manual"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Ketik Manual</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceMode("contact")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              sourceMode === "contact"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pilih dari Kontak ({dbContacts.length})</span>
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4 pt-2">
          {/* TAB 1: MANUAL MODE */}
          {sourceMode === "manual" ? (
            <div className="space-y-3">
              {/* TARGET INPUT ACCORDING TO CHANNEL */}
              {channel === "whatsapp" ? (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Nomor WhatsApp Tujuan:
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890 atau 6281234567890"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  {/* QUICK SUGGESTIONS WHATSAPP */}
                  {whatsappContacts.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Pilih cepat dari kontak WA:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {whatsappContacts.slice(0, 4).map((c) => {
                          const num = c.whatsappNumber || c.phone || "";
                          const isSelected = targetPhone === num;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setTargetPhone(num);
                                setCustomName(c.name);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs transition cursor-pointer border ${
                                isSelected
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50/50 hover:border-emerald-200"
                              }`}
                            >
                              <span>{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({num.slice(-4)})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : channel === "telegram" ? (
                <div className="space-y-2">
                  <div className="space-y-1.5 relative" ref={suggestionContainerRef}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Telegram Chat ID / Username:
                      </label>
                      {telegramSubscribers.length > 0 && (
                        <span className="text-[10px] text-sky-600 font-medium flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          {telegramSubscribers.length} kontak aktif di bot
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-sky-500" />
                      <input
                        type="text"
                        required
                        placeholder="Ketik nama, @username, atau Chat ID..."
                        value={targetChatId}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                        onChange={(e) => setTargetChatId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                      />
                    </div>

                    {/* AUTOCOMPLETE FLOATING DROPDOWN WHILE TYPING */}
                    {isInputFocused && teleSuggestions.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden py-1 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                          Rekomendasi:
                        </div>
                        {teleSuggestions.map((c) => {
                          const teleId = c.teleChatId || (c.customFields as any)?.teleChatId;
                          const username = (c.customFields as any)?.telegramUsername;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectTeleSubscriber(c);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-sky-50/70 transition flex items-center justify-between group cursor-pointer"
                            >
                              <div>
                                <p className="text-xs font-semibold text-slate-800 group-hover:text-sky-700">
                                  {c.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {username && <span className="text-sky-600 font-mono">{username}</span>}
                                  {teleId && <span>{` (ID: ${teleId})`}</span>}
                                </p>
                              </div>
                              <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                                Pilih
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* QUICK RECOMMENDATION PILLS BELOW INPUT */}
                  {telegramSubscribers.length > 0 ? (
                    <div className="space-y-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Pernah /start bot Telegram Anda:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-0.5">
                        {telegramSubscribers.map((c) => {
                          const teleId = c.teleChatId || (c.customFields as any)?.teleChatId;
                          const username = (c.customFields as any)?.telegramUsername;
                          const isSelected = targetChatId === teleId || (username && targetChatId === username);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectTeleSubscriber(c)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer border ${
                                isSelected
                                  ? "bg-sky-50 border-sky-300 text-sky-700 font-semibold"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50/60 hover:border-sky-200"
                              }`}
                            >
                              <span className="font-medium">{c.name}</span>
                              {username ? (
                                <span className="text-[10px] text-sky-600 font-mono">{username}</span>
                              ) : teleId ? (
                                <span className="text-[10px] text-slate-400 font-mono">#{teleId}</span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-sky-50/60 border border-sky-100 rounded-xl text-[11px] text-sky-700 flex items-start gap-2">
                      <Bot className="h-4 w-4 shrink-0 mt-0.5 text-sky-500" />
                      <span>
                        Belum ada yang menekan <code className="bg-sky-100 px-1 py-0.5 rounded font-mono font-semibold">/start</code> pada bot ini. Buka bot di aplikasi Telegram dan kirim pesan <code className="bg-sky-100 px-1 py-0.5 rounded font-mono font-semibold">/start</code> untuk otomatis terdeteksi di sini.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Email Tujuan Pengujian:
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
                    <input
                      type="email"
                      required
                      placeholder="nama.anda@gmail.com"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Nama Penerima (Merge Tags) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Nama Penerima (untuk variabel {"{{first_name}}"}):
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Contoh: Dika Pratama"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Variabel seperti <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">{"{{nama}}"}</code> atau <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">{"{{first_name}}"}</code> akan disubstitusi dengan nama ini.
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: CONTACT DATABASE MODE */
            <div className="space-y-3">
              {/* Kontak Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Pilih Kontak Pelanggan:
                </label>
                {isLoadingContacts ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-indigo-500" />
                    Memuat daftar kontak...
                  </div>
                ) : dbContacts.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    Belum ada kontak tersimpan di database. Silakan gunakan mode <strong>Ketik Manual</strong>.
                  </div>
                ) : (
                  <select
                    value={selectedContactId || ""}
                    onChange={(e) => handleContactSelect(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                  >
                    {dbContacts.map((c) => {
                      const teleInfo = (c.customFields as any)?.telegramUsername || (c.teleChatId ? `ID: ${c.teleChatId}` : "");
                      const channelLabel =
                        channel === "whatsapp"
                          ? `(${c.whatsappNumber || c.phone || "No WA"})`
                          : channel === "telegram"
                          ? `(${teleInfo || "Belum /start bot"})`
                          : `(${c.email || "No Email"})`;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} {channelLabel}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Kirim ke Penguji Pribadi vs Langsung ke Kontak */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToTesterMyself}
                    onChange={(e) => setSendToTesterMyself(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-800">
                      Kirim ke akun/nomor saya (simulasikan profil kontak terpilih)
                    </span>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Pesan masuk ke nomor/email Anda, namun isi merge tags (nama, data profil) meniru data kontak database ini.
                    </p>
                  </div>
                </label>

                {sendToTesterMyself ? (
                  <div className="pt-1">
                    {channel === "whatsapp" ? (
                      <input
                        type="tel"
                        required
                        placeholder="Masukkan nomor WhatsApp Anda (misal: 081234567890)"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    ) : channel === "telegram" ? (
                      <input
                        type="text"
                        required
                        placeholder="Masukkan Chat ID Telegram Anda"
                        value={targetChatId}
                        onChange={(e) => setTargetChatId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    ) : (
                      <input
                        type="email"
                        required
                        placeholder="Masukkan email pribadi Anda (misal: dika@gmail.com)"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {channel === "whatsapp"
                      ? `Pesan akan dikirim langsung ke: ${selectedContact?.whatsappNumber || selectedContact?.phone || "Nomor belum ada"}`
                      : channel === "telegram"
                      ? `Pesan akan dikirim langsung ke: ${(selectedContact?.customFields as any)?.telegramUsername || selectedContact?.teleChatId || "Belum ada Chat ID"}`
                      : `Email akan dikirim langsung ke: ${selectedContact?.email || "Email kontak"}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Media Attachment Indicator */}
          {mediaUrl && (channel === "whatsapp" || channel === "telegram") && (
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700">
              <div className="h-10 w-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                <img
                  src={mediaUrl}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/200x120?text=Gambar+Tidak+Valid";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-800 block text-[11px] flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  Menyertakan Banner Gambar
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  Pesan uji coba akan dikirim beserta banner gambar ini.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSending}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white ${headerConfig.btnBg} disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer active:scale-95`}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mengirim Pesan...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>{headerConfig.btnText}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
