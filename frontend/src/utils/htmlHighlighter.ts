// Utility for Syntax Highlighting HTML Code in Template Editor
// Zero dependency, high performance tokenizer for HTML Email code

export const DEFAULT_GRAY_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200' viewBox='0 0 600 200' fill='%23f8fafc'><rect width='600' height='200' rx='10' fill='%23f1f5f9'/><rect x='1' y='1' width='598' height='198' rx='9' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-dasharray='6 4'/><circle cx='300' cy='75' r='22' fill='%23cbd5e1'/><path d='M230 145l45-40 30 28 60-52 55 64H230z' fill='%2394a3b8'/><text x='300' y='172' font-family='sans-serif' font-size='12' font-weight='600' fill='%2364748b' text-anchor='middle'>Klik untuk Mengganti Gambar atau Pasang Logo</text></svg>";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightAttributes(attrsString: string): string {
  const attrRegex = /([a-zA-Z0-9_:-]+)(?:(=)(".*?"|'.*?'|[^\s"'>]+))?/g;
  return attrsString.replace(attrRegex, (_match, name, eq, val) => {
    let result = `<span class="text-amber-300">${escapeHtml(name)}</span>`;
    if (eq) {
      result += `<span class="text-slate-400">=</span>`;
    }
    if (val) {
      // Check if attribute value contains a merge tag {{...}}
      const escapedVal = escapeHtml(val);
      const highlightedVal = escapedVal.replace(
        /(\{\{[a-zA-Z0-9_.]+\}\})/g,
        `<span class="text-violet-400 font-semibold">$1</span>`
      );
      result += `<span class="text-emerald-300">${highlightedVal}</span>`;
    }
    return result;
  });
}

/**
 * Parses raw HTML string and returns HTML with colored spans for syntax highlighting.
 */
export function highlightHtmlCode(code: string): string {
  if (!code) return "";

  const tokenRegex =
    /(<!--[\s\S]*?-->)|(<!DOCTYPE[^>]*>)|(<(\/?[a-zA-Z0-9:-]+)((?:\s+[^'">=]+(?:=(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>)|(\{\{[a-zA-Z0-9_.]+\}\})|(&[a-zA-Z0-9#]+;)|([^<{&]+)|([<{&])/g;

  return code.replace(
    tokenRegex,
    (
      fullMatch,
      comment,
      doctype,
      _tagMatch,
      tagName,
      tagAttrs,
      selfCloseSlash,
      mergeTag,
      entity,
      plainText
    ) => {
      // 1. Comment
      if (comment) {
        return `<span class="text-slate-500 italic">${escapeHtml(comment)}</span>`;
      }

      // 2. Doctype
      if (doctype) {
        return `<span class="text-purple-400 font-semibold">${escapeHtml(doctype)}</span>`;
      }

      // 3. HTML Tag
      if (tagName) {
        const isClosing = tagName.startsWith("/");
        const cleanTagName = isClosing ? tagName.slice(1) : tagName;
        const highlightedTag = isClosing
          ? `<span class="text-slate-500">&lt;/</span><span class="text-sky-400 font-bold">${escapeHtml(cleanTagName)}</span><span class="text-slate-500">&gt;</span>`
          : `<span class="text-slate-500">&lt;</span><span class="text-sky-400 font-bold">${escapeHtml(cleanTagName)}</span>${
              tagAttrs ? highlightAttributes(tagAttrs) : ""
            }${selfCloseSlash ? `<span class="text-slate-500"> /</span>` : ""}<span class="text-slate-500">&gt;</span>`;
        return highlightedTag;
      }

      // 4. Merge Tag {{variable}}
      if (mergeTag) {
        return `<span class="text-violet-400 font-semibold bg-violet-950/50 px-1 py-0.5 rounded border border-violet-800/40">${escapeHtml(mergeTag)}</span>`;
      }

      // 5. HTML Entity
      if (entity) {
        return `<span class="text-cyan-400">${escapeHtml(entity)}</span>`;
      }

      // 6. Plain Text / Body Content
      if (plainText) {
        return `<span class="text-slate-200">${escapeHtml(plainText)}</span>`;
      }

      return escapeHtml(fullMatch);
    }
  );
}
