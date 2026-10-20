// Utility for Syntax Highlighting HTML Code in Template Editor
// Powered by PrismJS for robust, exact tokenization without character drift

import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";

export const DEFAULT_GRAY_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200' viewBox='0 0 600 200' fill='%23f8fafc'><rect width='600' height='200' rx='10' fill='%23f1f5f9'/><rect x='1' y='1' width='598' height='198' rx='9' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-dasharray='6 4'/><circle cx='300' cy='75' r='22' fill='%23cbd5e1'/><path d='M230 145l45-40 30 28 60-52 55 64H230z' fill='%2394a3b8'/><text x='300' y='172' font-family='sans-serif' font-size='12' font-weight='600' fill='%2364748b' text-anchor='middle'>Klik untuk Mengganti Gambar atau Pasang Logo</text></svg>";

// Register custom merge tag token for {{variable}} syntax
if (typeof window !== "undefined" && Prism.languages.markup) {
  try {
    Prism.languages.insertBefore("markup", "tag", {
      "merge-tag": {
        pattern: /\{\{[a-zA-Z0-9_.]+\}\}/,
        greedy: true,
      },
    });
  } catch {
    // Ignore if already registered
  }
}

/**
 * Parses raw HTML string and returns rich HTML with Prism token spans for syntax highlighting.
 * Preserves 100% of characters, whitespace, and formatting for zero cursor drift.
 */
export function highlightHtmlCode(code: string): string {
  if (!code) return "";
  try {
    return Prism.highlight(code, Prism.languages.markup, "markup");
  } catch (err) {
    console.error("Prism syntax highlight error:", err);
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
