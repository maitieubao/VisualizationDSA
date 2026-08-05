const KEYWORDS = [
  "let",
  "var",
  "const",
  "for",
  "while",
  "if",
  "else",
  "return",
  "function",
  "class",
  "new",
];

const API_FUNCS = ["compare", "swap", "highlight"];

export const highlightSyntax = (text: string): string => {
  if (!text || text.trim() === "")
    return '<span class="text-text-disabled">//</span>';

  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Chia dòng thành từng đoạn, comment (//...) được tách riêng để không bị
  // bọc span keyword/số bên trong (trước đây `// return` bị highlight xanh
  // keyword làm vỡ màu comment).
  const parts = escaped.split(/(\/\/[^\n]*)/g);
  return parts
    .map((part) => {
      if (part.startsWith("//")) {
        return `<span style="color: #64748b; font-style: italic;">${part}</span>`;
      }

      KEYWORDS.forEach((kw) => {
        part = part.replace(
          new RegExp(`\\b${kw}\\b`, "g"),
          `<span style="color: #60a5fa; font-weight: 500;">${kw}</span>`
        );
      });

      API_FUNCS.forEach((fn) => {
        part = part.replace(
          new RegExp(`\\b${fn}\\b`, "g"),
          `<span style="color: #22d3ee; font-weight: 500;">${fn}</span>`
        );
      });

      part = part.replace(
        /([{}()\[\]])/g,
        '<span style="color: #64748b;">$1</span>'
      );

      part = part.replace(
        /\b(\d+)\b/g,
        '<span style="color: #fbbf24;">$1</span>'
      );

      return part;
    })
    .join("");
};
