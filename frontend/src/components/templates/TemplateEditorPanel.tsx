import React, { useRef, useState, useEffect, useMemo } from "react";
import EditorComponent from "react-simple-code-editor";

// Safe ESM/CJS interop for react-simple-code-editor across Vite dev & production
const Editor: any = (EditorComponent as any).default || EditorComponent;

import type { TemplateChannel, ToolbarAction } from "@/types/template";
import { TemplateEditorToolbar } from "./TemplateEditorToolbar";
import {
  applyToolbarAction,
  insertTagAtCursor,
  insertHtmlSnippetAtCursor,
  isRawHtml,
  extractTextBlocksFromHtml,
  updateTextBlockByIndex,
  updateCohesiveBlockInDoc,
  prepareHtmlForVisualEditor,
  extractCleanHtmlFromVisualDoc,
  isFullHtmlDoc,
  formatHtmlCode,
  type ExtractedTextBlock,
} from "@/utils/templateParser";
import {
  DEFAULT_GRAY_IMAGE_PLACEHOLDER,
  highlightHtmlCode,
} from "@/utils/htmlHighlighter";
import {
  Code2,
  FileText,
  Image as ImageIcon,
  Layout,
  SlidersHorizontal,
  Link2,
  ArrowUpDown,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  LogoBlockEditor,
  CtaBlockEditor,
  SocialBlockEditor,
  SubjectPreheaderInputs,
  FloatingLinkEditor,
  FloatingImageEditor,
  VisualFieldsListEditor,
} from "./blocks";

interface TemplateEditorPanelProps {
  channel: TemplateChannel;
  subject: string;
  onSubjectChange: (newSubject: string) => void;
  preheader?: string;
  onPreheaderChange?: (newPreheader: string) => void;
  content: string;
  onContentChange: (newContent: string) => void;
  onOpenMergeTagsModal: () => void;
  // External ref hook to insert tag at cursor
  onRegisterInsertTagHandler?: (handler: (tag: string, target?: "subject" | "preheader" | "content") => void) => void;
  // Active target field tracking (subject | preheader | content)
  activeTarget?: "subject" | "preheader" | "content";
  onActiveTargetChange?: (target: "subject" | "preheader" | "content") => void;
  // Custom Logo Props
  enableLogo?: boolean;
  onEnableLogoChange?: (val: boolean) => void;
  logoUrl?: string;
  onLogoUrlChange?: (val: string) => void;
  logoWidth?: number;
  onLogoWidthChange?: (val: number) => void;
  logoAlign?: "left" | "center" | "right";
  onLogoAlignChange?: (val: "left" | "center" | "right") => void;
  // Mailchimp CTA Button Props
  enableCta?: boolean;
  onEnableCtaChange?: (val: boolean) => void;
  ctaText?: string;
  onCtaTextChange?: (val: string) => void;
  ctaUrl?: string;
  onCtaUrlChange?: (val: string) => void;
  ctaColor?: string;
  onCtaColorChange?: (val: string) => void;
  // Mailchimp Social Links Props
  enableSocial?: boolean;
  onEnableSocialChange?: (val: boolean) => void;
  websiteUrl?: string;
  onWebsiteUrlChange?: (val: string) => void;
  instagramUrl?: string;
  onInstagramUrlChange?: (val: string) => void;
  whatsappUrl?: string;
  onWhatsappUrlChange?: (val: string) => void;
  footerAddress?: string;
  onFooterAddressChange?: (val: string) => void;
  mediaUrl?: string;
  onMediaUrlChange?: (val: string) => void;
}

const QUICK_MERGE_TAGS = [
  "{{first_name}}",
  "{{nama}}",
  "{{kode_promo}}",
  "{{diskon}}",
  "{{org_name}}",
  "{{unsubscribe_link}}",
  "[nama]",
  "{{}}",
];



export const TemplateEditorPanel: React.FC<TemplateEditorPanelProps> = ({
  channel: rawChannel,
  subject,
  onSubjectChange,
  preheader = "",
  onPreheaderChange,
  content,
  onContentChange,
  onOpenMergeTagsModal,
  onRegisterInsertTagHandler,
  activeTarget: activeTargetProp,
  onActiveTargetChange,
  // Logo
  enableLogo = false,
  onEnableLogoChange,
  logoUrl = "",
  onLogoUrlChange,
  logoWidth = 140,
  onLogoWidthChange,
  logoAlign = "center",
  onLogoAlignChange,
  // CTA
  enableCta = false,
  onEnableCtaChange,
  ctaText = "Klaim Voucher Sekarang",
  onCtaTextChange,
  ctaUrl = "https://domainanda.com/promo",
  onCtaUrlChange,
  ctaColor = "#4F46E5",
  onCtaColorChange,
  // Social
  enableSocial = false,
  onEnableSocialChange,
  websiteUrl = "https://domainanda.com",
  onWebsiteUrlChange,
  instagramUrl = "https://instagram.com/brandanda",
  onInstagramUrlChange,
  whatsappUrl = "https://wa.me/6281234567890",
  onWhatsappUrlChange,
  footerAddress = "",
  onFooterAddressChange,
  mediaUrl = "",
  onMediaUrlChange,
}) => {
  const channel: TemplateChannel =
    rawChannel === "whatsapp" || rawChannel === "telegram" ? rawChannel : "email";

  // Input references for smart cursor tag insertion
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const preheaderInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualIframeRef = useRef<HTMLIFrameElement>(null);
  const visualParentScrollRef = useRef<HTMLDivElement>(null);
  const isIframeEditingRef = useRef(false);
  const lastInternalContentRef = useRef<string>(content);
  const isFullDocRef = useRef<boolean>(isFullHtmlDoc(content));
  const lastIframeRangeRef = useRef<Range | null>(null);

  // Exact selection positions saved across blur events
  const subjectSelectionRef = useRef<{ start: number; end: number }>({
    start: subject.length,
    end: subject.length,
  });
  const preheaderSelectionRef = useRef<{ start: number; end: number }>({
    start: preheader.length,
    end: preheader.length,
  });

  // Track which input was last focused so tags insert into the active field!
  const lastFocusedFieldRef = useRef<"subject" | "preheader" | "content">("subject");
  const [activeTargetState, setActiveTargetState] = useState<"subject" | "preheader" | "content">("subject");
  const currentActiveTarget = activeTargetProp !== undefined ? activeTargetProp : activeTargetState;

  const setActiveTarget = (target: "subject" | "preheader" | "content") => {
    setActiveTargetState(target);
    onActiveTargetChange?.(target);
    lastFocusedFieldRef.current = target;
  };


  // Editor mode: Raw HTML Code for Email vs Visual (Format Teks)
  const [editorMode, setEditorMode] = useState<"visual" | "html">(
    channel === "email" ? "html" : "visual"
  );

  // Sync editorMode when channel changes
  useEffect(() => {
    if (channel !== "email") {
      setEditorMode("visual");
    } else if (isRawHtml(content)) {
      setEditorMode("html");
    }
  }, [channel]);

  // Sub-view inside Visual mode for HTML emails: "canvas" (WYSIWYG) vs "fields" (Daftar Teks Form)
  const [visualSubView, setVisualSubView] = useState<"canvas" | "fields">("canvas");

  // Canva-Style Interactive Link Editing State
  interface ActiveLinkData {
    element: HTMLAnchorElement | null;
    range: Range | null;
    text: string;
    url: string;
    isExisting: boolean;
  }
  const [activeLinkData, setActiveLinkData] = useState<ActiveLinkData | null>(null);
  const [linkUrlInput, setLinkUrlInput] = useState("");

  // Interactive Image Editing State
  interface ActiveImageData {
    element: HTMLImageElement | null;
    src: string;
    alt: string;
    width: string;
    align: "left" | "center" | "right";
    originalHtml?: string;
  }
  const [activeImageData, setActiveImageData] = useState<ActiveImageData | null>(null);
  const [imageSrcInput, setImageSrcInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");
  const [imageWidthInput, setImageWidthInput] = useState("280px");
  const [imageAlignInput, setImageAlignInput] = useState<"left" | "center" | "right">("center");
  const imageUploadInputRef = useRef<HTMLInputElement>(null);

  // HTML Code Editor: Word Wrap Toggle (Soft wrap vs Horizontal scrolling)
  const [wordWrap, setWordWrap] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("campaignblast_word_wrap");
      if (saved !== null) return saved === "true";
    } catch {}
    return false; // Default: horizontal scroll / wrap off for pixel-perfect line numbers
  });

  const handleToggleWordWrap = () => {
    setWordWrap((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("campaignblast_word_wrap", String(next));
      } catch {}
      return next;
    });
  };

  // Cursor Tracking (Line & Column)
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const updateCursorPos = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    const selStart = el.selectionStart || 0;
    const textBefore = el.value.substring(0, selStart);
    const lines = textBefore.split("\n");
    const line = lines.length;
    const col = (lines[lines.length - 1]?.length || 0) + 1;
    setCursorPos({ line, col });
  };

  // Adjustable Editor Height (Panjang / Tinggi Editor)
  const [editorHeight, setEditorHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("campaignblast_editor_height");
      if (saved) return parseInt(saved, 10) || 640;
    } catch {}
    return 640; // Default: spacious 640px height
  });

  const handleSetEditorHeight = (h: number) => {
    setEditorHeight(h);
    try {
      localStorage.setItem("campaignblast_editor_height", String(h));
    } catch {}
  };

  // Undo / Redo History Management
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract all text strings whenever content has HTML
  const extractedTextBlocks: ExtractedTextBlock[] = useMemo(() => {
    if (isRawHtml(content)) {
      return extractTextBlocksFromHtml(content);
    }
    return [];
  }, [content]);

  // Total lines calculation for gutter line numbers
  const lineCount = useMemo(() => {
    return Math.max(1, (content || "").split("\n").length);
  }, [content]);



  // Clean HTML Formatter: automatically formats & indents HTML
  const handleFormatHtml = () => {
    if (!content || !content.trim()) return;
    const formatted = formatHtmlCode(content);
    if (formatted !== content) {
      lastInternalContentRef.current = formatted;
      pushToHistory(formatted);
      onContentChange(formatted);
      toast.success("Kode HTML berhasil dirapikan dan diindentasi!");
    } else {
      toast.info("Kode HTML sudah rapi.");
    }
  };

  const pushToHistory = (newVal: string) => {
    if (newVal === history[historyIndex]) return;

    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      if (truncated.length >= 50) truncated.shift();
      return [...truncated, newVal];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetVal = history[targetIndex];
      setHistoryIndex(targetIndex);
      isUndoRedoAction.current = true;
      onContentChange(targetVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetVal = history[targetIndex];
      setHistoryIndex(targetIndex);
      isUndoRedoAction.current = true;
      onContentChange(targetVal);
    }
  };

  const handleOpenVisualLinkEditor = () => {
    const iframe = visualIframeRef.current;
    if (!iframe) return;
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument || win?.document;
    if (!win || !doc) return;

    const sel = win.getSelection();
    let selectedText = sel ? sel.toString().trim() : "";
    let targetRange: Range | null = null;
    let existingLinkEl: HTMLAnchorElement | null = null;

    if (sel && sel.rangeCount > 0) {
      targetRange = sel.getRangeAt(0);
      const node = targetRange.commonAncestorContainer;
      existingLinkEl = (node instanceof HTMLElement ? node.closest("a") : node.parentElement?.closest("a")) as HTMLAnchorElement | null;
    }

    if (existingLinkEl) {
      const currentHref = existingLinkEl.getAttribute("href") || "";
      const text = (existingLinkEl.innerText || existingLinkEl.textContent || "").trim() || "Tautan";
      setActiveLinkData({
        element: existingLinkEl,
        range: null,
        text,
        url: currentHref,
        isExisting: true,
      });
      setLinkUrlInput(currentHref);
    } else if (selectedText) {
      setActiveLinkData({
        element: null,
        range: targetRange,
        text: selectedText,
        url: "https://",
        isExisting: false,
      });
      setLinkUrlInput("https://");
    } else {
      setActiveLinkData({
        element: null,
        range: targetRange,
        text: "Kunjungi Tautan",
        url: "https://",
        isExisting: false,
      });
      setLinkUrlInput("https://");
    }
  };

  const handleApplyLink = () => {
    if (!activeLinkData) return;
    const targetUrl = linkUrlInput.trim() || "#";
    const iframe = visualIframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc) return;

    if (activeLinkData.element) {
      activeLinkData.element.setAttribute("href", targetUrl);
      activeLinkData.element.setAttribute("target", "_blank");
      activeLinkData.element.setAttribute("rel", "noopener noreferrer");
    } else if (activeLinkData.range && activeLinkData.range.toString().trim()) {
      try {
        const newA = doc.createElement("a");
        newA.href = targetUrl;
        newA.target = "_blank";
        newA.rel = "noopener noreferrer";
        newA.style.color = "#2563eb";
        newA.style.textDecoration = "underline";
        activeLinkData.range.surroundContents(newA);
      } catch {
        doc.execCommand("createLink", false, targetUrl);
      }
    } else {
      const newA = doc.createElement("a");
      newA.href = targetUrl;
      newA.target = "_blank";
      newA.rel = "noopener noreferrer";
      newA.style.color = "#2563eb";
      newA.style.textDecoration = "underline";
      newA.textContent = activeLinkData.text || targetUrl;
      if (activeLinkData.range) {
        activeLinkData.range.insertNode(newA);
      } else {
        doc.body.appendChild(newA);
      }
    }

    isIframeEditingRef.current = true;
    const updated = doc.body.innerHTML;
    pushToHistory(updated);
    onContentChange(updated);
    setActiveLinkData(null);
    toast.success("Tautan berhasil diterapkan!");
  };

  const handleRemoveLink = () => {
    if (!activeLinkData?.element) return;
    const doc = visualIframeRef.current?.contentDocument || visualIframeRef.current?.contentWindow?.document;
    if (!doc) return;

    const el = activeLinkData.element;
    const parent = el.parentNode;
    if (parent) {
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    }

    isIframeEditingRef.current = true;
    const updated = doc.body.innerHTML;
    pushToHistory(updated);
    onContentChange(updated);
    setActiveLinkData(null);
    toast.info("Tautan berhasil dihapus.");
  };

  // Live real-time preview update for image styling, dimensions, source, and alignment
  const applyImageLiveUpdate = (updates: {
    src?: string;
    alt?: string;
    width?: string;
    align?: "left" | "center" | "right";
  }) => {
    if (!activeImageData?.element) return;
    const doc =
      visualIframeRef.current?.contentDocument ||
      visualIframeRef.current?.contentWindow?.document;
    if (!doc) return;

    const el = activeImageData.element;

    if (updates.src !== undefined) {
      const trimmed = updates.src.trim();
      if (trimmed) {
        el.setAttribute("src", trimmed);
      }
      setImageSrcInput(updates.src);
    }

    if (updates.alt !== undefined) {
      const trimmed = updates.alt.trim();
      if (trimmed) {
        el.setAttribute("alt", trimmed);
      } else {
        el.removeAttribute("alt");
      }
      setImageAltInput(updates.alt);
    }

    if (updates.width !== undefined) {
      const w = updates.width.trim();
      if (w) {
        const formatted =
          w.includes("%") || w.endsWith("px") ? w : `${w}px`;
        el.style.width = formatted;
        el.style.maxWidth = "100%";
        el.style.height = "auto";
        el.setAttribute("width", formatted);
      }
      setImageWidthInput(updates.width);
    }

    if (updates.align !== undefined) {
      const parent = el.parentElement;
      if (
        parent &&
        (parent.tagName === "DIV" || parent.tagName === "P" || parent.tagName === "TD")
      ) {
        parent.style.textAlign = updates.align;
      }
      el.style.display = updates.align === "center" ? "inline-block" : "block";
      if (updates.align === "center") {
        el.style.margin = "0 auto";
      } else if (updates.align === "right") {
        el.style.marginLeft = "auto";
        el.style.marginRight = "0";
      } else {
        el.style.marginLeft = "0";
        el.style.marginRight = "auto";
      }
      setImageAlignInput(updates.align);
    }

    // Direct synchronous update to iframe and propagate to parent live preview instantly
    isIframeEditingRef.current = true;
    const updated = doc.body.innerHTML;
    onContentChange(updated);
  };

  const handleCancelImageEdit = () => {
    if (activeImageData?.originalHtml) {
      const doc =
        visualIframeRef.current?.contentDocument ||
        visualIframeRef.current?.contentWindow?.document;
      if (doc) {
        doc.body.innerHTML = activeImageData.originalHtml;
        isIframeEditingRef.current = true;
        onContentChange(activeImageData.originalHtml);
      }
    }
    setActiveImageData(null);
  };

  const handleApplyImage = () => {
    if (!activeImageData?.element) {
      setActiveImageData(null);
      return;
    }
    const doc =
      visualIframeRef.current?.contentDocument ||
      visualIframeRef.current?.contentWindow?.document;
    if (!doc) {
      setActiveImageData(null);
      return;
    }

    applyImageLiveUpdate({
      src: imageSrcInput,
      alt: imageAltInput,
      width: imageWidthInput,
      align: imageAlignInput,
    });

    isIframeEditingRef.current = true;
    const updated = doc.body.innerHTML;
    pushToHistory(updated);
    onContentChange(updated);
    setActiveImageData(null);
    toast.success("Pengaturan gambar berhasil disimpan!");
  };

  const handleRemoveImage = () => {
    if (!activeImageData?.element) return;
    const doc =
      visualIframeRef.current?.contentDocument ||
      visualIframeRef.current?.contentWindow?.document;
    if (!doc) return;

    const el = activeImageData.element;
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    }

    isIframeEditingRef.current = true;
    const updated = doc.body.innerHTML;
    pushToHistory(updated);
    onContentChange(updated);
    setActiveImageData(null);
    toast.info("Gambar berhasil dihapus.");
  };

  const handleUploadImageInModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pilih file gambar valid (PNG, JPG, SVG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setImageSrcInput(dataUrl);
        applyImageLiveUpdate({ src: dataUrl });
        toast.success("Gambar berhasil dimuat dan langsung diperbarui!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsertVisualImagePlaceholder = () => {
    const iframe = visualIframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const placeholderHtml = `\n<div style="text-align: center; margin: 20px 0;">\n  <img src="${DEFAULT_GRAY_IMAGE_PLACEHOLDER}" alt="Placeholder Gambar" style="max-width: 100%; width: 440px; height: auto; border-radius: 10px; display: inline-block; border: 1.5px dashed #cbd5e1; cursor: pointer;" />\n</div>\n`;

    const sel = iframe.contentWindow?.getSelection();
    if (sel && sel.rangeCount > 0 && sel.focusNode) {
      try {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const tempDiv = doc.createElement("div");
        tempDiv.innerHTML = placeholderHtml;
        const node = tempDiv.firstElementChild || tempDiv;
        range.insertNode(node);
        isIframeEditingRef.current = true;
        const updated = doc.body.innerHTML;
        pushToHistory(updated);
        onContentChange(updated);
        toast.info("Placeholder abu-abu disisipkan. Klik gambar untuk mengatur gambar atau logo.");
        return;
      } catch {
        // fallback
      }
    }

    doc.body.insertAdjacentHTML("beforeend", placeholderHtml);
    isIframeEditingRef.current = true;
    const updated = doc.body.innerHTML;
    pushToHistory(updated);
    onContentChange(updated);
    toast.info("Placeholder abu-abu disisipkan. Klik gambar untuk mengatur gambar atau logo.");
  };



  const handleToolbarAction = (action: ToolbarAction) => {
    if (action === "undo") {
      handleUndo();
      return;
    }
    if (action === "redo") {
      handleRedo();
      return;
    }

    // Intercept link action when in visual canvas mode
    if (action === "link" && editorMode === "visual" && contentIsHtml && visualSubView === "canvas") {
      handleOpenVisualLinkEditor();
      return;
    }

    // Intercept bracket action
    if (action === "bracket") {
      handleInsertTag("{{nama}}");
      return;
    }

    // Direct formatting commands in Visual Canvas iframe!
    if (editorMode === "visual" && contentIsHtml && visualSubView === "canvas") {
      const iframe = visualIframeRef.current;
      const win = iframe?.contentWindow;
      const doc = iframe?.contentDocument;
      if (win && doc) {
        win.focus();
        if (action === "bold") doc.execCommand("bold");
        else if (action === "italic") doc.execCommand("italic");
        else if (action === "underline") doc.execCommand("underline");
        else if (action === "strikethrough") doc.execCommand("strikeThrough");
        else if (action === "h1") doc.execCommand("formatBlock", false, "<h1>");
        else if (action === "h2") doc.execCommand("formatBlock", false, "<h2>");
        else if (action === "bullet") doc.execCommand("insertUnorderedList");

        const cleanHtml = extractCleanHtmlFromVisualDoc(doc, isFullDocRef.current);
        lastInternalContentRef.current = cleanHtml;
        pushToHistory(cleanHtml);
        onContentChange(cleanHtml);
        return;
      }
    }

    const targetEl = getActiveTextarea();
    if (!targetEl) return;
    const updated = applyToolbarAction(targetEl, action, content, channel);
    if (updated !== content) {
      lastInternalContentRef.current = updated;
      pushToHistory(updated);
      onContentChange(updated);
    }
  };

  // Dedicated Tag Insertion for Subject Line
  const handleInsertSubjectTag = (tag: string) => {
    const formattedTag = tag.startsWith("{{") || tag.startsWith("[") || tag.startsWith("{") ? tag : `{{${tag}}}`;
    const input = subjectInputRef.current;
    const start = input?.selectionStart ?? subjectSelectionRef.current.start ?? subject.length;
    const end = input?.selectionEnd ?? subjectSelectionRef.current.end ?? subject.length;
    const newSubject = subject.substring(0, start) + formattedTag + subject.substring(end);
    onSubjectChange(newSubject);
    const newPos = start + formattedTag.length;
    subjectSelectionRef.current = { start: newPos, end: newPos };
    setActiveTarget("subject");
    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Dedicated Tag Insertion for Preheader
  const handleInsertPreheaderTag = (tag: string) => {
    if (!onPreheaderChange) return;
    const formattedTag = tag.startsWith("{{") || tag.startsWith("[") || tag.startsWith("{") ? tag : `{{${tag}}}`;
    const input = preheaderInputRef.current;
    const start = input?.selectionStart ?? preheaderSelectionRef.current.start ?? preheader.length;
    const end = input?.selectionEnd ?? preheaderSelectionRef.current.end ?? preheader.length;
    const newPreheader = preheader.substring(0, start) + formattedTag + preheader.substring(end);
    onPreheaderChange(newPreheader);
    const newPos = start + formattedTag.length;
    preheaderSelectionRef.current = { start: newPos, end: newPos };
    setActiveTarget("preheader");
    setTimeout(() => {
      if (input) {
        input.focus();
        input.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  // Dedicated Tag Insertion for Body Content
  const handleInsertContentTag = (tag: string) => {
    const formattedTag = tag.startsWith("{{") || tag.startsWith("[") || tag.startsWith("{") ? tag : `{{${tag}}}`;
    setActiveTarget("content");

    // If in visual iframe mode: insert directly into exact cursor range inside the iframe DOM!
    if (editorMode === "visual" && contentIsHtml && visualSubView === "canvas") {
      const iframe = visualIframeRef.current;
      const iframeWin = iframe?.contentWindow;
      const iframeDoc = iframe?.contentDocument;
      if (iframeWin && iframeDoc && iframeDoc.body) {
        let range = lastIframeRangeRef.current;
        const sel = iframeWin.getSelection();
        if (sel && sel.rangeCount > 0 && sel.focusNode && iframeDoc.body.contains(sel.focusNode)) {
          range = sel.getRangeAt(0);
        }

        if (range && iframeDoc.body.contains(range.commonAncestorContainer)) {
          iframeWin.focus();
          range.deleteContents();
          const textNode = iframeDoc.createTextNode(formattedTag);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          sel?.removeAllRanges();
          sel?.addRange(range);
          lastIframeRangeRef.current = range.cloneRange();

          const cleanHtml = extractCleanHtmlFromVisualDoc(iframeDoc, isFullDocRef.current);
          lastInternalContentRef.current = cleanHtml;
          pushToHistory(cleanHtml);
          onContentChange(cleanHtml);
          toast.success(`Bracket ${formattedTag} berhasil disisipkan!`);
          return;
        } else {
          // If no range found, append to first editable text element inside body without corrupting HTML
          const targetEl = iframeDoc.body.querySelector("p, h1, h2, h3, div, td") || iframeDoc.body;
          const textNode = iframeDoc.createTextNode(` ${formattedTag} `);
          targetEl.appendChild(textNode);

          const cleanHtml = extractCleanHtmlFromVisualDoc(iframeDoc, isFullDocRef.current);
          lastInternalContentRef.current = cleanHtml;
          pushToHistory(cleanHtml);
          onContentChange(cleanHtml);
          toast.success(`Bracket ${formattedTag} berhasil disisipkan!`);
          return;
        }
      }
    }

    if (editorMode === "html" || !isRawHtml(content)) {
      const targetEl = getActiveTextarea();
      const updated = insertTagAtCursor(targetEl, content, formattedTag);
      if (updated !== content) {
        lastInternalContentRef.current = updated;
        pushToHistory(updated);
        onContentChange(updated);
      }
    } else {
      const updated = `${content}\n${formattedTag}`;
      lastInternalContentRef.current = updated;
      pushToHistory(updated);
      onContentChange(updated);
    }
  };

  // Smart tag insertion: Routes to target field based on active focus or explicit override
  const handleInsertTag = (tag: string, targetOverride?: "subject" | "preheader" | "content") => {
    const target = targetOverride || currentActiveTarget || lastFocusedFieldRef.current;
    if (target === "subject") {
      handleInsertSubjectTag(tag);
      return;
    }
    if (target === "preheader") {
      handleInsertPreheaderTag(tag);
      return;
    }
    handleInsertContentTag(tag);
  };

  const handleInsertHtmlSnippet = (snippet: string) => {
    const targetEl = getActiveTextarea();
    const updated = insertHtmlSnippetAtCursor(targetEl, content, snippet);
    if (updated !== content) {
      pushToHistory(updated);
      onContentChange(updated);
    }
  };

  // Insert Logo Snippet at cursor
  const handleInsertLogoSnippet = () => {
    const src = logoUrl || "https://dummyimage.com/280x80/4f46e5/ffffff&text=LOGO";
    const snippet = `<div style="text-align: ${logoAlign}; margin: 20px 0;"><img src="${src}" alt="Logo" style="max-width: ${logoWidth}px; height: auto; display: inline-block;" /></div>`;
    handleInsertHtmlSnippet(snippet);
  };

  // Expose insert tag handler to parent (e.g. for MergeTagsModal)
  useEffect(() => {
    if (onRegisterInsertTagHandler) {
      onRegisterInsertTagHandler(handleInsertTag);
    }
  }, [onRegisterInsertTagHandler, content, subject, preheader, currentActiveTarget]);

  // Helper to reliably retrieve active textarea (in HTML code or plain text mode)
  const getActiveTextarea = (): HTMLTextAreaElement | null => {
    return (
      textareaRef.current ||
      (document.getElementById("template-html-code-editor") as HTMLTextAreaElement | null)
    );
  };

  // High-performance direct change handler for HTML Editor
  const handleEditorValueChange = (newVal: string) => {
    lastInternalContentRef.current = newVal;
    onContentChange(newVal);

    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      pushToHistory(newVal);
    }, 400);

    const el = getActiveTextarea();
    if (el) updateCursorPos(el);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    lastInternalContentRef.current = newVal;
    onContentChange(newVal);

    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      pushToHistory(newVal);
    }, 400);
  };

  // Handler: Change a detected text block inside the HTML (from Formulir Teks)
  const handleUpdateExtractedText = (blockIndex: number, newText: string) => {
    // 1. Directly update the Visual Canvas iframe DOM if available
    const iframe = visualIframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (doc && doc.body) {
      try {
        updateCohesiveBlockInDoc(doc, blockIndex, newText);
      } catch (err) {
        console.warn("Could not update visual iframe DOM directly:", err);
      }
    }

    // 2. Deterministically update the master HTML string by cohesive block index
    const updated = updateTextBlockByIndex(content, blockIndex, newText);
    if (updated !== content) {
      lastInternalContentRef.current = updated;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        pushToHistory(updated);
      }, 400);
      onContentChange(updated);
    }
  };

  // Save active selection inside visual iframe
  const saveIframeSelection = () => {
    const iframe = visualIframeRef.current;
    const win = iframe?.contentWindow;
    const doc = iframe?.contentDocument || win?.document;
    if (!win || !doc) return;
    try {
      const sel = win.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (doc.body && doc.body.contains(range.commonAncestorContainer)) {
          lastIframeRangeRef.current = range.cloneRange();
        }
      }
    } catch {}
  };

  // Immediate real-time sync from Visual Canvas iframe to parent state & Live Preview
  const handleVisualInput = () => {
    const iframe = visualIframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc || !doc.body) return;

    try {
      const cleanHtml = extractCleanHtmlFromVisualDoc(doc, isFullDocRef.current);
      if (cleanHtml && cleanHtml !== lastInternalContentRef.current) {
        lastInternalContentRef.current = cleanHtml;
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          pushToHistory(cleanHtml);
        }, 400);
        onContentChange(cleanHtml);
      }
    } catch (err) {
      console.warn("Visual input sync error:", err);
    }
  };

  const handleVisualFocus = () => {
    setActiveTarget("content");
    saveIframeSelection();
  };

  const handleVisualClick = (e: MouseEvent) => {
    saveIframeSelection();
    const target = e.target as HTMLElement;
    if (!target) return;

    // 1. Intercept Image Click (for resize, custom image/logo, alignment)
    const imgEl = target.closest("img") as HTMLImageElement | null;
    if (imgEl) {
      e.preventDefault();
      e.stopPropagation();
      const currentSrc = imgEl.getAttribute("src") || "";
      const currentAlt = imgEl.getAttribute("alt") || "";
      const currentWidth =
        imgEl.style.width || imgEl.getAttribute("width") || imgEl.style.maxWidth || "280px";
      let currentAlign: "left" | "center" | "right" = "center";
      const parent = imgEl.parentElement;
      if (parent && parent.style.textAlign) {
        currentAlign = (parent.style.textAlign as any) || "center";
      }
      const iframe = visualIframeRef.current;
      const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
      setActiveImageData({
        element: imgEl,
        src: currentSrc,
        alt: currentAlt,
        width: currentWidth,
        align: currentAlign,
        originalHtml: doc ? extractCleanHtmlFromVisualDoc(doc, isFullDocRef.current) : content,
      });
      setImageSrcInput(currentSrc);
      setImageAltInput(currentAlt);
      setImageWidthInput(currentWidth || "280px");
      setImageAlignInput(currentAlign);
      setActiveLinkData(null);
      return;
    }

    // 2. Intercept Anchor Link Click
    const linkEl = target.closest("a") as HTMLAnchorElement | null;
    if (linkEl) {
      e.preventDefault();
      e.stopPropagation();
      const currentHref = linkEl.getAttribute("href") || "";
      const linkText = (linkEl.innerText || linkEl.textContent || "").trim() || "Tombol / Tautan";
      setActiveLinkData({
        element: linkEl,
        range: null,
        text: linkText,
        url: currentHref,
        isExisting: true,
      });
      setLinkUrlInput(currentHref);
      setActiveImageData(null);
      return;
    }
  };

  // Attach all event listeners to iframe document ensuring capture phase is true
  const attachVisualIframeListeners = (doc: Document) => {
    if (!doc || !doc.body) return;

    const onDelayedInput = () => setTimeout(handleVisualInput, 15);

    // Document-level capture listeners
    doc.removeEventListener("input", handleVisualInput, true);
    doc.addEventListener("input", handleVisualInput, true);

    doc.removeEventListener("keyup", handleVisualInput, true);
    doc.addEventListener("keyup", handleVisualInput, true);

    doc.removeEventListener("paste", onDelayedInput, true);
    doc.addEventListener("paste", onDelayedInput, true);

    doc.removeEventListener("cut", onDelayedInput, true);
    doc.addEventListener("cut", onDelayedInput, true);

    doc.removeEventListener("drop", onDelayedInput, true);
    doc.addEventListener("drop", onDelayedInput, true);

    doc.removeEventListener("blur", handleVisualInput, true);
    doc.addEventListener("blur", handleVisualInput, true);

    doc.removeEventListener("selectionchange", saveIframeSelection);
    doc.addEventListener("selectionchange", saveIframeSelection);

    doc.removeEventListener("click", handleVisualClick as any, true);
    doc.addEventListener("click", handleVisualClick as any, true);

    // Body-level listeners as secondary guarantee
    if (doc.body) {
      doc.body.removeEventListener("input", handleVisualInput, true);
      doc.body.addEventListener("input", handleVisualInput, true);

      doc.body.removeEventListener("keyup", handleVisualInput, true);
      doc.body.addEventListener("keyup", handleVisualInput, true);

      doc.body.removeEventListener("focus", handleVisualFocus);
      doc.body.addEventListener("focus", handleVisualFocus);

      doc.body.removeEventListener("mouseup", saveIframeSelection);
      doc.body.addEventListener("mouseup", saveIframeSelection);
    }
  };

  // Helper to load or reload iframe HTML content
  const loadIframeContent = (force: boolean = false) => {
    const iframe = visualIframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // If content hasn't changed externally and document is already populated, just ensure listeners are attached
    if (!force && content === lastInternalContentRef.current && doc.body && doc.body.innerHTML) {
      attachVisualIframeListeners(doc);
      return;
    }

    lastInternalContentRef.current = content;

    const { fullHtml, isFullDoc } = prepareHtmlForVisualEditor(content);
    isFullDocRef.current = isFullDoc;

    const win = iframe.contentWindow;
    const prevScrollX = win ? win.scrollX : 0;
    const prevScrollY = win ? win.scrollY : 0;
    const parentContainer = visualParentScrollRef.current;
    const parentScrollTop = parentContainer ? parentContainer.scrollTop : 0;

    doc.open();
    doc.write(fullHtml);
    doc.close();

    if (win && (prevScrollX > 0 || prevScrollY > 0)) {
      win.scrollTo(prevScrollX, prevScrollY);
    }
    if (parentContainer && parentScrollTop > 0) {
      parentContainer.scrollTop = parentScrollTop;
    }

    attachVisualIframeListeners(doc);
  };

  // In-place Visual HTML Iframe Editor synchronization effect
  useEffect(() => {
    if (editorMode !== "visual" || !isRawHtml(content)) return;

    // If content matches internal content (user typed in iframe), NEVER re-write the document!
    const iframe = visualIframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (content === lastInternalContentRef.current && doc && doc.body && doc.body.innerHTML) {
      // Re-attach listeners to ensure they remain active across state cycles
      attachVisualIframeListeners(doc);
      return;
    }

    // External change (switched tab, typed in HTML code editor, undo/redo): reload document
    loadIframeContent(true);
  }, [content, editorMode, visualSubView]);



  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        handleRedo();
        return;
      }
    }

    // Support Tab key indentation inside HTML code editor
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const tabSpaces = "  "; // 2 spaces

      const newVal = val.substring(0, start) + tabSpaces + val.substring(end);
      lastInternalContentRef.current = newVal;
      pushToHistory(newVal);
      onContentChange(newVal);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + tabSpaces.length;
          textareaRef.current.selectionEnd = start + tabSpaces.length;
          updateCursorPos(textareaRef.current);
        }
      }, 0);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const contentIsHtml = channel === "email" && isRawHtml(content);

  return (
    <div className="space-y-4">
      {/* 1. EMAIL SUBJECT & PREHEADER INPUTS */}
      <SubjectPreheaderInputs
        channel={channel}
        subject={subject}
        onSubjectChange={onSubjectChange}
        preheader={preheader}
        onPreheaderChange={onPreheaderChange}
        currentActiveTarget={currentActiveTarget}
        setActiveTarget={setActiveTarget}
        subjectInputRef={subjectInputRef}
        preheaderInputRef={preheaderInputRef}
        subjectSelectionRef={subjectSelectionRef}
        preheaderSelectionRef={preheaderSelectionRef}
        onOpenMergeTagsModal={onOpenMergeTagsModal}
        handleInsertSubjectTag={handleInsertSubjectTag}
        handleInsertPreheaderTag={handleInsertPreheaderTag}
      />

      {/* BANNER / IMAGE ATTACHMENT FOR WHATSAPP & TELEGRAM */}
      {(channel === "whatsapp" || channel === "telegram") && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                    className={`p-2 rounded-xl ${
                        channel === "whatsapp"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-sky-50 text-sky-600 border border-sky-100"
                    }`}
                >
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Banner Gambar Promosi</span>
                    <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    Opsional
                  </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Gambar akan dikirim sebagai banner utama, dan teks pesan di bawah menjadi keterangan (caption).
                  </p>
                </div>
              </div>

              {mediaUrl && (
                  <button
                      type="button"
                      onClick={() => onMediaUrlChange?.("")}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-medium hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Hapus</span>
                  </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Input Link / URL Gambar */}
              <div className="relative flex-1 w-full">
                <Link2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                    type="url"
                    value={mediaUrl || ""}
                    onChange={(e) => onMediaUrlChange?.(e.target.value)}
                    placeholder="Tempel link URL gambar (misal: https://...)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono transition"
                />
              </div>

              {/* Tombol Upload File dari Komputer */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">atau</span>
                <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 transition shrink-0 active:scale-95 w-full sm:w-auto">
                  <Upload className="h-3.5 w-3.5 text-slate-600" />
                  <span>Pilih Gambar</span>
                  <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Ukuran gambar maksimal 5MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;

                            if (result) {
                              // Kompres otomatis gambar ke ukuran banner optimal (~100KB) agar muat disimpan di browser
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const maxWidth = 1000;
                                let width = img.width;
                                let height = img.height;
                                if (width > maxWidth) {
                                  height = Math.round((height * maxWidth) / width);
                                  width = maxWidth;
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                ctx?.drawImage(img, 0, 0, width, height);
                                const compressed = canvas.toDataURL("image/jpeg", 0.8);
                                onMediaUrlChange?.(compressed);
                                toast.success(`Gambar "${file.name}" siap dilampirkan!`);
                              };
                              img.src = result;
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}

                  />
                </label>
              </div>
            </div>

            {/* Mini Thumbnail Preview */}
            {mediaUrl && (
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="h-16 w-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
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
                  <div className="text-[11px] text-slate-600">
                    <p className="font-semibold text-emerald-700 flex items-center gap-1">
                      ✓ Gambar Terpasang
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Banner siap dikirim bersama teks pesan template.
                    </p>
                  </div>
                </div>
            )}
          </div>
      )}


      {/* 2. RICH EDITOR CONTAINER WITH DUAL MODE */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col focus-within:border-slate-400 transition">
        {/* Unified Mode Switcher Tabs */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            {contentIsHtml ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditorMode("visual");
                    setVisualSubView("canvas");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    editorMode === "visual" && visualSubView === "canvas"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Edit langsung pada kanvas visual email"
                >
                  <Layout className="h-3.5 w-3.5 text-slate-600" />
                  <span>Kanvas Visual</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditorMode("visual");
                    setVisualSubView("fields");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    editorMode === "visual" && visualSubView === "fields"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Edit teks melalui formulir terdeteksi"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600" />
                  <span>Formulir Teks ({extractedTextBlocks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorMode("html")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    editorMode === "html"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Lihat atau edit kode HTML mentah"
                >
                  <Code2 className="h-3.5 w-3.5 text-slate-600" />
                  <span>Kode HTML</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditorMode("visual")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    editorMode === "visual"
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-slate-600" />
                  <span>Editor Teks</span>
                </button>

                {channel === "email" && (
                  <button
                    type="button"
                    onClick={() => setEditorMode("html")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      editorMode === "html"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5 text-slate-600" />
                    <span>Kode HTML</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {enableLogo && logoUrl && (
              <button
                type="button"
                onClick={handleInsertLogoSnippet}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-md"
                title="Sisipkan logo di posisi kursor"
              >
                <ImageIcon className="h-3 w-3 text-slate-500" />
                <span>Sisipkan Logo</span>
              </button>
            )}

            {/* Quick Height Expand Toggle Button */}
            <button
              type="button"
              onClick={() =>
                handleSetEditorHeight(
                  editorHeight >= 850 ? 500 : editorHeight === 500 ? 680 : 880
                )
              }
              className="text-[11px] font-medium text-slate-700 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs whitespace-nowrap"
              title="Perpanjang atau atur tinggi area kerja editor"
            >
              <ArrowUpDown className="h-3 w-3 text-slate-500" />
              <span>
                {editorHeight >= 850
                  ? "Tinggi: Ekstra (880px)"
                  : editorHeight >= 640
                  ? "Tinggi: Panjang (680px)"
                  : "Tinggi: Sedang (500px)"}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Toolbar */}
        <TemplateEditorToolbar
          onAction={handleToolbarAction}
          canUndo={canUndo}
          canRedo={canRedo}
          channel={channel}
          editorMode={editorMode}
          onInsertHtmlSnippet={handleInsertHtmlSnippet}
          onInsertTag={handleInsertTag}
          onFormatHtml={handleFormatHtml}
          wordWrap={wordWrap}
          onToggleWordWrap={handleToggleWordWrap}
        />

        {/* EDITOR BODY CONTENT */}
        <div className="relative">
          {editorMode === "html" ? (
            /* MODE 1: KODE HTML EMAIL (DIRECT SYNTAX HIGHLIGHTED CODE EDITOR) */
            <div
              className="relative w-full bg-[#0d1117] text-slate-100 rounded-b-xl overflow-auto font-mono text-xs flex border-t border-slate-800"
              style={{ height: `${editorHeight}px` }}
            >
              {/* Synchronized Sticky Gutter */}
              <div
                aria-hidden="true"
                className="sticky left-0 z-20 select-none bg-[#090d16] border-r border-slate-800/80 text-slate-500 font-mono text-[11px] text-right py-3 pr-2.5 pl-2 shrink-0 pointer-events-none"
                style={{ minHeight: "100%" }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i + 1}
                    style={{ height: "22px", lineHeight: "22px" }}
                    className={`${
                      cursorPos.line === i + 1 ? "text-indigo-400 font-bold" : "text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Editor Workspace powered by react-simple-code-editor & PrismJS */}
              <div className="flex-1 min-w-0">
                <Editor
                  value={content}
                  onValueChange={handleEditorValueChange}
                  highlight={(code: string) => highlightHtmlCode(code)}
                  padding={12}
                  tabSize={2}
                  insertSpaces={true}
                  ignoreTabKey={false}
                  textareaId="template-html-code-editor"
                  textareaClassName="font-mono text-[13px] leading-[22px] outline-none text-slate-100"
                  preClassName="font-mono text-[13px] leading-[22px] text-slate-100"
                  className={wordWrap ? "code-editor-wrap text-slate-100" : "code-editor-nowrap text-slate-100"}
                  style={{
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: "13px",
                    lineHeight: "22px",
                    color: "#f8fafc",
                    minHeight: "100%",
                  }}
                  onClick={() => {
                    setActiveTarget("content");
                    const el = getActiveTextarea();
                    if (el) {
                      textareaRef.current = el;
                      updateCursorPos(el);
                    }
                  }}
                  onFocus={() => {
                    setActiveTarget("content");
                    const el = getActiveTextarea();
                    if (el) {
                      textareaRef.current = el;
                      updateCursorPos(el);
                    }
                  }}
                  onKeyUp={() => {
                    const el = getActiveTextarea();
                    if (el) {
                      textareaRef.current = el;
                      updateCursorPos(el);
                    }
                  }}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.ctrlKey || e.metaKey) {
                      if (e.key === "z" || e.key === "Z") {
                        e.preventDefault();
                        if (e.shiftKey) {
                          handleRedo();
                        } else {
                          handleUndo();
                        }
                        return;
                      } else if (e.key === "y" || e.key === "Y") {
                        e.preventDefault();
                        handleRedo();
                        return;
                      }
                    }
                  }}
                  placeholder="<!-- Tulis atau tempel kode HTML Email Anda di sini -->"
                />
              </div>
            </div>
          ) : contentIsHtml ? (
            /* MODE 2: VISUAL FORMAT TEKS (NO RAW CODE TAGS!) */
            <div className="relative">
              {/* SUB-VIEW 2A: IN-PLACE EDITABLE VISUAL CANVAS */}
              <div
                style={{ display: visualSubView === "canvas" ? "flex" : "none" }}
                className="flex-col bg-white"
              >
                <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-700">
                      Klik langsung pada teks atau gambar untuk mengedit
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenVisualLinkEditor}
                      className="h-7 px-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap"
                      title="Sisipkan atau ubah tautan URL"
                    >
                      <Link2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Tautan</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInsertVisualImagePlaceholder}
                      className="h-7 px-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap"
                      title="Sisipkan placeholder gambar abu-abu"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>Gambar</span>
                    </button>
                  </div>
                </div>

                {/* Clean Floating Link Editor Bar */}
                {activeLinkData && (
                  <FloatingLinkEditor
                    activeLinkData={activeLinkData}
                    linkUrlInput={linkUrlInput}
                    onLinkUrlInputChange={setLinkUrlInput}
                    onClose={() => setActiveLinkData(null)}
                    onApply={handleApplyLink}
                    onRemove={handleRemoveLink}
                  />
                )}

                {/* Clean Floating Image Editor Bar */}
                {activeImageData && (
                  <FloatingImageEditor
                    activeImageData={activeImageData}
                    imageSrcInput={imageSrcInput}
                    imageAltInput={imageAltInput}
                    imageWidthInput={imageWidthInput}
                    imageAlignInput={imageAlignInput}
                    enableLogo={enableLogo}
                    logoUrl={logoUrl}
                    logoWidth={logoWidth}
                    logoAlign={logoAlign}
                    imageUploadInputRef={imageUploadInputRef}
                    onApplyLiveUpdate={applyImageLiveUpdate}
                    onUploadImage={handleUploadImageInModal}
                    onCancel={handleCancelImageEdit}
                    onApply={handleApplyImage}
                    onRemove={handleRemoveImage}
                  />
                )}

                <div
                  ref={visualParentScrollRef}
                  className="p-3 bg-slate-50 overflow-auto transition-all duration-150"
                  style={{ height: `${editorHeight}px` }}
                >
                  <iframe
                    ref={visualIframeRef}
                    onLoad={() => loadIframeContent(false)}
                    title="In-Place Visual Email Editor"
                    className="w-full h-full min-h-[440px] border border-slate-200/90 rounded-xl bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* SUB-VIEW 2B: DETECTED TEXT FORM INPUTS */}
              <div style={{ display: visualSubView === "fields" ? "block" : "none" }}>
                <VisualFieldsListEditor
                  extractedTextBlocks={extractedTextBlocks}
                  editorHeight={editorHeight}
                  onUpdateExtractedText={handleUpdateExtractedText}
                />
              </div>
            </div>
          ) : (
            /* MODE 3: STANDARD PLAIN TEXT / MARKDOWN EDITOR */
            <textarea
              ref={textareaRef}
              value={content}
              onFocus={() => {
                setActiveTarget("content");
              }}
              onClick={() => {
                setActiveTarget("content");
              }}
              onSelect={() => {
                setActiveTarget("content");
              }}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                channel === "whatsapp"
                  ? "Tulis pesan broadcast WhatsApp di sini... Contoh: Halo kak *{{first_name}}*, terima kasih telah memesan!"
                  : "Tulis konten email di sini...\nGunakan **teks tebal**, *miring*, heading (# Judul), atau tautan [teks](url).\nSisipkan merge tag seperti {{first_name}} atau {{kode_promo}}."
              }
              rows={13}
              className="w-full p-4 text-xs font-mono bg-white text-slate-800 resize-none focus:outline-none leading-relaxed selection:bg-slate-200 placeholder:text-slate-400 transition-all duration-150"
              style={{ height: `${editorHeight}px` }}
            />
          )}
        </div>

        {/* Editor Bottom Bar */}
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              {content.length} karakter
            </span>

            {editorMode === "html" && (
              <span className="text-[11px] text-indigo-600 font-mono font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Baris {cursorPos.line}, Kolom {cursorPos.col}
              </span>
            )}

            {/* Quick Height Control */}
            <div className="inline-flex items-center gap-1 text-[11px] bg-slate-200/60 p-0.5 rounded-lg">
              <span className="text-slate-500 text-[10px] px-1 font-medium">Tinggi Editor:</span>
              <button
                type="button"
                onClick={() => handleSetEditorHeight(500)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                  editorHeight <= 540
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tinggi sedang (500px)"
              >
                Sedang (500px)
              </button>
              <button
                type="button"
                onClick={() => handleSetEditorHeight(680)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                  editorHeight > 540 && editorHeight <= 750
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tinggi panjang (680px)"
              >
                Panjang (680px)
              </button>
              <button
                type="button"
                onClick={() => handleSetEditorHeight(880)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                  editorHeight > 750
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Tinggi ekstra (880px)"
              >
                Ekstra (880px)
              </button>
            </div>
          </div>

          {/* Quick Merge Tag Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5 hidden sm:inline">
              Tag Cepat:
            </span>
            {QUICK_MERGE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsertContentTag(tag)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[11px] font-medium transition cursor-pointer active:scale-95"
                title={`Klik untuk menyisipkan ${tag} ke editor email`}
              >
                {tag}
              </button>
            ))}

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onOpenMergeTagsModal}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
            >
              Tag Lain...
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODUL LOGO PERUSAHAAN (CUSTOM LOGO) */}
      {channel === "email" && (
        <LogoBlockEditor
          enableLogo={enableLogo}
          onEnableLogoChange={onEnableLogoChange}
          logoUrl={logoUrl}
          onLogoUrlChange={onLogoUrlChange}
          logoWidth={logoWidth}
          onLogoWidthChange={onLogoWidthChange}
          logoAlign={logoAlign}
          onLogoAlignChange={onLogoAlignChange}
        />
      )}

      {/* 4. MODUL CTA BUTTON & SOCIAL */}
      {channel === "email" && (
        <div className="space-y-3 pt-1">
          <CtaBlockEditor
            enableCta={enableCta}
            onEnableCtaChange={onEnableCtaChange}
            ctaText={ctaText}
            onCtaTextChange={onCtaTextChange}
            ctaUrl={ctaUrl}
            onCtaUrlChange={onCtaUrlChange}
            ctaColor={ctaColor}
            onCtaColorChange={onCtaColorChange}
          />
          <SocialBlockEditor
            enableSocial={enableSocial}
            onEnableSocialChange={onEnableSocialChange}
            websiteUrl={websiteUrl}
            onWebsiteUrlChange={onWebsiteUrlChange}
            instagramUrl={instagramUrl}
            onInstagramUrlChange={onInstagramUrlChange}
            whatsappUrl={whatsappUrl}
            onWhatsappUrlChange={onWhatsappUrlChange}
            footerAddress={footerAddress}
            onFooterAddressChange={onFooterAddressChange}
          />
        </div>
      )}
    </div>
  );
};
