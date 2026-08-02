export const highlightSyntax = (text: string): string => {
  if (!text || text.trim() === "")
    return '<span class="text-text-disabled">//</span>';

  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  
  const keywords = [
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
  keywords.forEach((kw) => {
    escaped = escaped.replace(
      new RegExp(`\\b${kw}\\b`, "g"),
      `<span style="color: #60a5fa; font-weight: 500;">${kw}</span>`
    );
  });

  
  const apiFuncs = ["compare", "swap", "highlight"];
  apiFuncs.forEach((fn) => {
    escaped = escaped.replace(
      new RegExp(`\\b${fn}\\b`, "g"),
      `<span style="color: #22d3ee; font-weight: 500;">${fn}</span>`
    );
  });

  
  escaped = escaped.replace(
    /([{}()\[\]])/g,
    '<span style="color: #64748b;">$1</span>'
  );

  
  escaped = escaped.replace(
    /\b(\d+)\b/g,
    '<span style="color: #fbbf24;">$1</span>'
  );

  
  escaped = escaped.replace(
    /(\/.*)/g,
    '<span style="color: #64748b; font-style: italic;">$1</span>'
  );

  return escaped;
};
