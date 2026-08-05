/**
 * Cấu hình Mermaid thống nhất cho toàn bộ tài liệu.
 *
 * Nguyên tắc thiết kế (theo ADR-30):
 * - Chỉ dùng bảng màu tối giản: 1 nền, 1 tông node, 1 tông phụ, 1 màu viền, 1 màu chữ, 1 màu cạnh.
 * - Một accent duy nhất (#3d9970) chỉ dùng cho điểm nhấn trạng thái (activation bar).
 * - Class diagram dùng fillType0..7 xen kẽ 2 tông tối — không "cầu vồng" nhiều màu.
 */

export interface MermaidPalette {
  background: string;
  nodeFill: string;
  nodeBorder: string;
  nodeText: string;
  secondaryFill: string;
  tertiaryFill: string;
  line: string;
  text: string;
  labelBg: string;
  accent: string;
  accentLight: string;
}

export const MERMAID_PALETTE: MermaidPalette = {
  background: '#131614',
  nodeFill: '#1e2320',
  nodeBorder: '#343634',
  nodeText: '#e2e4e2',
  secondaryFill: '#252b27',
  tertiaryFill: '#181c19',
  line: '#5e605e',
  text: '#959795',
  labelBg: '#181c19',
  accent: '#3d9970',
  accentLight: '#5ab88a',
};

export function buildMermaidInitConfig(): Record<string, unknown> {
  const p = MERMAID_PALETTE;
  return {
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    fontSize: 13,
    flowchart: {
      htmlLabels: true,
      curve: 'linear',
    },
    themeVariables: {
      background: p.background,
      primaryColor: p.nodeFill,
      primaryBorderColor: p.nodeBorder,
      primaryTextColor: p.nodeText,
      secondaryColor: p.secondaryFill,
      secondaryBorderColor: p.nodeBorder,
      secondaryTextColor: p.text,
      tertiaryColor: p.tertiaryFill,
      tertiaryBorderColor: p.nodeBorder,
      tertiaryTextColor: p.text,
      lineColor: p.line,
      textColor: p.text,
      edgeLabelBackground: p.labelBg,
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      fontSize: '13px',
      // Class diagram: 2 tông xen kẽ, tránh nhiều màu lòe loẹt
      fillType0: p.nodeFill,
      fillType1: p.secondaryFill,
      fillType2: p.nodeFill,
      fillType3: p.secondaryFill,
      fillType4: p.nodeFill,
      fillType5: p.secondaryFill,
      fillType6: p.nodeFill,
      fillType7: p.secondaryFill,
      classText: p.nodeText,
      // Sequence diagram
      actorBkg: p.nodeFill,
      actorBorder: p.nodeBorder,
      actorTextColor: p.nodeText,
      signalColor: p.line,
      signalTextColor: p.text,
      noteBkgColor: p.tertiaryFill,
      noteBorderColor: p.nodeBorder,
      noteTextColor: p.text,
      labelBoxBkgColor: p.secondaryFill,
      labelBoxBorderColor: p.nodeBorder,
      labelTextColor: p.text,
      loopTextColor: p.text,
      activationBkgColor: p.accent,
      activationBorderColor: p.accentLight,
      sequenceNumberColor: p.text,
      // State diagram
      clusterBkg: p.tertiaryFill,
      clusterBorder: p.nodeBorder,
      compositeTitleColor: p.text,
      titleColor: p.nodeText,
    },
    themeCSS: [
      `.edgeLabel { color: ${p.text}; background: ${p.labelBg}; }`,
      `.nodeLabel, .cluster-label, .actor-label, .label, .nodeText { color: ${p.text}; }`,
      `.flowchart-link, .edgePath .path { stroke: ${p.line}; }`,
      `.grid path, .grid line, .crosshead path, .crosshead line { stroke: ${p.line}; opacity: 0.4; }`,
      `.mermaid-diagram svg { max-width: 100%; height: auto; }`,
    ].join('\n'),
  };
}
