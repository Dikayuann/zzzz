import React, { useRef, useState, useEffect, useMemo } from "react";
import type { TemplateChannel, ToolbarAction } from "@/types/template";
import { TemplateEditorToolbar } from "./TemplateEditorToolbar";
import {
  applyToolbarAction,
  insertTagAtCursor,
  insertHtmlSnippetAtCursor,
  isRawHtml,
  extractTextBlocksFromHtml,
  replaceTextInHtml,
  type ExtractedTextBlock,
} from "@/utils/templateParser";
import {
  highlightHtmlCode,
  DEFAULT_GRAY_IMAGE_PLACEHOLDER,
} from "@/utils/htmlHighlighter";
import {
  Code2,
  FileText,
  Image as ImageIcon,
  Layout,
  SlidersHorizontal,
  Link2,
  ArrowUpDown,
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
}

const QUICK_MERGE_TAGS = [
  "{{first_name}}",
  "{{nama}}",
  "{{kode_promo}}",
  "{{diskon}}",
  "{{org_name}}",
  "{{unsubscribe_link}}",
];



export const TemplateEditorPanel: React.FC<TemplateEditorPanelProps> = ({
  channel,
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
  ctaUrl = "https://tokoonline.com/promo",
  onCtaUrlChange,
  ctaColor = "#4F46E5",
  onCtaColorChange,
  // Social
  enableSocial = false,
  onEnableSocialChange,
  websiteUrl = "https://acmecorp.co",
  onWebsiteUrlChange,
  instagramUrl = "https://instagram.com/acmecorp",
  onInstagramUrlChange,
  whatsappUrl = "https://wa.me/6281234567890",
  onWhatsappUrlChange,
}) => {
  // Input references for smart cursor tag insertion
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const preheaderInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualIframeRef = useRef<HTMLIFrameElement>(null);
  const visualParentScrollRef = useRef<HTMLDivElement>(null);
  const isIframeEditingRef = useRef(false);

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


  // Editor mode: Visual (Format Teks) vs Raw HTML Code
  const [editorMode, setEditorMode] = useState<"visual" | "html">(
    isRawHtml(content) ? "visual" : "visual"
  );

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
  const codePreRef = useRef<HTMLPreElement>(null);

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

  // Memoize syntax highlighted HTML to prevent heavy regex recalculations on re-render
  const highlightedHtml = useMemo(() => {
    return highlightHtmlCode(content || "<!-- Tulis kode HTML Email Anda di sini -->") + "\n";
  }, [content]);

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

  const handleCodeScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (codePreRef.current) {
      codePreRef.current.scrollTop = e.currentTarget.scrollTop;
      codePreRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
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

    if (!textareaRef.current) return;
    const updated = applyToolbarAction(textareaRef.current, action, content, channel);
    if (updated !== content) {
      pushToHistory(updated);
      onContentChange(updated);
    }
  };

  // Dedicated Tag Insertion for Subject Line
  const handleInsertSubjectTag = (tag: string) => {
    const formattedTag = tag.startsWith("{{") ? tag : `{{${tag}}}`;
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
    const formattedTag = tag.startsWith("{{") ? tag : `{{${tag}}}`;
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
    const formattedTag = tag.startsWith("{{") ? tag : `{{${tag}}}`;
    setActiveTarget("content");

    // If in visual iframe mode and user has a selection inside iframe
    if (editorMode === "visual" && contentIsHtml && visualSubView === "canvas") {
      const iframeWin = visualIframeRef.current?.contentWindow;
      if (iframeWin) {
        const sel = iframeWin.getSelection();
        if (sel && sel.rangeCount > 0 && sel.focusNode) {
          try {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const textNode = iframeWin.document.createTextNode(formattedTag);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            sel.removeAllRanges();
            sel.addRange(range);
            isIframeEditingRef.current = true;
            const updated = iframeWin.document.body.innerHTML;
            pushToHistory(updated);
            onContentChange(updated);
            return;
          } catch {
            // fallback
          }
        }
      }
      const updated = `${content} ${formattedTag}`;
      pushToHistory(updated);
      onContentChange(updated);
      return;
    }

    if (editorMode === "html" || !isRawHtml(content)) {
      const updated = insertTagAtCursor(textareaRef.current, content, formattedTag);
      if (updated !== content) {
        pushToHistory(updated);
        onContentChange(updated);
      }
    } else {
      const updated = `${content} ${formattedTag}`;
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
    const updated = insertHtmlSnippetAtCursor(textareaRef.current, content, snippet);
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
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

  // Handler: Change a detected text node inside the HTML
  const handleUpdateExtractedText = (originalText: string, newText: string) => {
    if (originalText === newText) return;
    const updated = replaceTextInHtml(content, originalText, newText);
    if (updated !== content) {
      pushToHistory(updated);
      onContentChange(updated);
    }
  };

  // In-place Visual HTML Iframe Editor synchronization
  useEffect(() => {
    if (editorMode !== "visual" || !isRawHtml(content)) return;

    // Prevent rebuilding the iframe DOM when typing directly inside it!
    // This fixes the jumping / scrolling to the top issue!
    if (isIframeEditingRef.current) {
      isIframeEditingRef.current = false;
      return;
    }

    const iframe = visualIframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const win = iframe.contentWindow;
    const prevScrollX = win ? win.scrollX : 0;
    const prevScrollY = win ? win.scrollY : 0;
    const parentContainer = visualParentScrollRef.current;
    const parentScrollTop = parentContainer ? parentContainer.scrollTop : 0;

    const editableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          html, body {
            scroll-behavior: auto !important;
          }
          body {
            margin: 0;
            padding: 18px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            outline: none;
            min-height: 380px;
          }
          [contenteditable="true"] *:hover {
            outline: 1.5px dashed #94a3b8 !important;
            outline-offset: 2px;
            cursor: text;
          }
          [contenteditable="true"] *:focus {
            outline: 1.5px solid #0f172a !important;
            outline-offset: 2px;
          }
          a, [role="button"] {
            cursor: pointer !important;
          }
          a:hover {
            outline: 1.5px solid #2563eb !important;
            outline-offset: 2px !important;
          }
          img {
            cursor: pointer !important;
            transition: outline 0.15s ease-in-out;
          }
          img:hover {
            outline: 2px dashed #0284c7 !important;
            outline-offset: 2px !important;
          }
        </style>
      </head>
      <body contenteditable="true">
        ${content}
      </body>
      </html>
    `;

    doc.open();
    doc.write(editableHtml);
    doc.close();

    // Restore scroll positions so it never jumps to the top
    if (win && (prevScrollX > 0 || prevScrollY > 0)) {
      win.scrollTo(prevScrollX, prevScrollY);
    }
    if (parentContainer && parentScrollTop > 0) {
      parentContainer.scrollTop = parentScrollTop;
    }

    const handleInput = () => {
      if (doc.body) {
        isIframeEditingRef.current = true;
        const updatedHtml = doc.body.innerHTML;
        onContentChange(updatedHtml);
      }
    };

    const handleFocus = () => {
      setActiveTarget("content");
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

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
        setActiveImageData({
          element: imgEl,
          src: currentSrc,
          alt: currentAlt,
          width: currentWidth,
          align: currentAlign,
          originalHtml: doc.body.innerHTML,
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

    doc.body.addEventListener("input", handleInput);
    doc.body.addEventListener("focus", handleFocus);
    doc.body.addEventListener("click", handleClick);

    return () => {
      doc.body?.removeEventListener("input", handleInput);
      doc.body?.removeEventListener("focus", handleFocus);
      doc.body?.removeEventListener("click", handleClick);
    };
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
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        handleRedo();
      }
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
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {editorMode === "html"
                ? "Mode HTML"
                : contentIsHtml
                ? visualSubView === "canvas"
                  ? "Kanvas Visual"
                  : "Formulir Teks"
                : "Teks Biasa"}
            </span>

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
        />

        {/* EDITOR BODY CONTENT */}
        <div className="relative">
          {editorMode === "html" ? (
            /* MODE 1: KODE HTML EMAIL (SYNTAX HIGHLIGHTED) */
            <div
              className="relative w-full bg-slate-950 rounded-b-xl overflow-hidden font-mono text-xs transition-all duration-150"
              style={{ height: `${editorHeight}px` }}
            >
              {/* Highlighted Code Underlay */}
              <pre
                ref={codePreRef}
                aria-hidden="true"
                className="absolute inset-0 p-4 m-0 overflow-hidden font-mono text-xs leading-relaxed whitespace-pre-wrap break-words pointer-events-none select-none text-slate-200"
                dangerouslySetInnerHTML={{
                  __html: highlightedHtml,
                }}
              />

              {/* Transparent Interactive Textarea on Top */}
              <textarea
                ref={textareaRef}
                value={content}
                onScroll={handleCodeScroll}
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
                placeholder="<!-- Tulis atau tempel kode HTML Email Anda di sini -->"
                spellCheck={false}
                className="relative z-10 w-full h-full p-4 font-mono text-xs leading-relaxed bg-transparent text-transparent caret-white selection:bg-indigo-600/50 resize-none focus:outline-none placeholder:text-slate-600 whitespace-pre-wrap break-words"
              />
            </div>
          ) : contentIsHtml ? (
            /* MODE 2: VISUAL FORMAT TEKS (NO RAW CODE TAGS!) */
            visualSubView === "canvas" ? (
              /* SUB-VIEW 2A: IN-PLACE EDITABLE VISUAL CANVAS */
              <div className="flex flex-col bg-white">
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
                    title="In-Place Visual Email Editor"
                    className="w-full h-full min-h-[440px] border border-slate-200/90 rounded-xl bg-white shadow-2xs"
                  />
                </div>
              </div>
            ) : (
              /* SUB-VIEW 2B: DETECTED TEXT FORM INPUTS */
              <VisualFieldsListEditor
                extractedTextBlocks={extractedTextBlocks}
                editorHeight={editorHeight}
                onUpdateExtractedText={handleUpdateExtractedText}
              />
            )
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
          />
        </div>
      )}
    </div>
  );
};
