const sourceCode = `
highlight(0);
for (let i = 1; i < array.length; i++) {
  let j = i;
  while (j > 0) {
    compare(j - 1, j);
    if (array[j] < array[j - 1]) { swap(j - 1, j); j--; }
    else { break; }
  }
  for (let k = 0; k <= i; k++) { highlight(k); }
}
`;
let processedCode = sourceCode
  .replace(/compare\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*,\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'compare($1, $2)')
  .replace(/swap\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*,\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'swap($1, $2)')
  .replace(/highlight\s*\(\s*(?:arr|array)\[([^\]]+)\]\s*\)/gi, 'highlight($1)');
const varRegex = /\b(?:let|var|const)\s+([a-zA-Z_]\w*)\b/g;
const declaredVars = new Set(['i', 'j', 'k', 'temp']);
let match;
while ((match = varRegex.exec(processedCode)) !== null) { declaredVars.add(match[1]); }
declaredVars.delete('array'); declaredVars.delete('arr'); declaredVars.delete('compare'); declaredVars.delete('swap'); declaredVars.delete('highlight');
declaredVars.forEach(v => {
  const declRegex = new RegExp(`\\b(?:let|const|var)\\s+${v}\\b`, 'g');
  processedCode = processedCode.replace(declRegex, v);
});
const lines = processedCode.split('\n');
const instrumentedLines = [];
lines.forEach((line, index) => {
  const trimmed = line.trim();
  const lineNum = index + 1;
  const isBlockControl = trimmed.startsWith('}') || trimmed === 'else {' || trimmed.startsWith('else if');
  if (!trimmed || trimmed.startsWith('//') || isBlockControl) {
    instrumentedLines.push(line);
  } else {
    const varsObjStr = `{ ${Array.from(declaredVars).map(v => `${v}: typeof ${v} !== 'undefined' ? ${v} : undefined`).join(', ')} }`;
    instrumentedLines.push(`__trackLine(${lineNum}, ${varsObjStr}); ${line}`);
  }
});
console.log(instrumentedLines.join('\n'));
