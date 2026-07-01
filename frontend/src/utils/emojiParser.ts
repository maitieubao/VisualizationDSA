export const SVG_PATHS: Record<string, string> = {
  // ── Status ──
  'check': '<path d="M20 6L9 17l-5-5" stroke-width="2.5"/>',
  'x-mark': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',

  // ── SOLID Principle Icons ──
  'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'plug': '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a6 6 0 0 1-12 0V8z"/>',
  'puzzle': '<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18-.894-.527-.967 1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>',
  'scissors': '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  'shuffle': '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',

  // ── OOP Pillar Icons ──
  'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor" fill-opacity="0.15"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'dna': '<path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M17 6l-2.5 2.5"/><path d="M14 8l-1 1"/><path d="M7 18l2.5-2.5"/><path d="M3.5 14.5l.5-.5"/><path d="M20 9l.5-.5"/><path d="M6.5 12.5l1-1"/><path d="M16.5 10.5l1-1"/><path d="M10 16l1.5-1.5"/>',
  'masks': '<path d="M17.5 2.5c-1.75 0-3.5.75-5.5 2.25-2-1.5-3.75-2.25-5.5-2.25C3.5 2.5 1 5.5 1 8.75c0 4.75 5 9.25 11 14 6-4.75 11-9.25 11-14 0-3.25-2.5-6.25-5.5-6.25Z" fill="currentColor" fill-opacity="0.1"/><path d="M8.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor"/><path d="M15.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor"/><path d="M9 13s1.5 2 3 2 3-2 3-2"/>',
  'drafting-compass': '<circle cx="12" cy="5" r="2"/><path d="m3 21 8.02-14.26"/><path d="m12.99 6.74 1.93 3.44"/><path d="M19 12c-3.87 4-10.13 4-14 0"/><path d="m21 21-2.16-3.84"/>',

  // ── Common UI Icons ──
  'lightbulb': '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" fill="currentColor" fill-opacity="0.12"/>',
  'package': '<path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.12"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor" fill-opacity="0.15"/>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fill-opacity="0.15"/>',
  'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="currentColor" fill-opacity="0.12"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'cog': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  'party-popper': '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v.01c.09.6-.032 1.2-.377 1.712l-.148.208a1.5 1.5 0 0 1-2.078.36l-.208-.148A2.894 2.894 0 0 0 13.234 7.5h-.01c-1.099-.09-2.099.6-2.399 1.7L5.8 11.3"/>',
  'bird': '<path d="M16 7h0.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>',
  'bird-off': '<path d="M16 7h0.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><line x1="2" y1="2" x2="22" y2="22"/>',
  'message-circle': '<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>',
  'hourglass': '<path d="M5 2h14v2c0 2-1.2 4.14-3 5.5L12 12l4 2.5c1.8 1.36 3 3.5 3 5.5v2H5v-2c0-2 1.2-4.14 3-5.5L12 12 8 9.5C6.2 8.14 5 6 5 4V2z"/><path d="M12 2v6"/><path d="M12 16v6"/>',
  'pointer': '<path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 16"/>',

  // ── Data / DB ──
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',

  // ── Specific ──
  'eagle': '<path d="M16 7h0.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>',
  'penguin': '<circle cx="12" cy="8" r="5"/><path d="M12 13v9"/><path d="M9 18h6"/><path d="M8 21h8"/><circle cx="10" cy="7" r="0.5" fill="currentColor"/><circle cx="14" cy="7" r="0.5" fill="currentColor"/>',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'bot': '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
  'car': '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  
  // Custom for UI text formatting mapping
  'key': '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  'gamepad': '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>',
  'plane': '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21.5 4c0 0-2-.5-3.5 1.5L14.5 9 6.3 7.2C5.9 7.1 5.5 7.3 5.4 7.7L4 10l6 4-3 3-3.2-.8c-.4-.1-.8.2-.9.6L2.5 19l4.5-1 1-4.5.8.4c.4.1.7.5.6.9l-.8 3.2 3 3 4-6 2.3-1.4c.4-.1.6.3.5.7l-1.8 8.2c-.1.4.1.8.5.9l1.5.2 2-2.5-3.5-3.5z"/>'
};

export const EMOJI_TO_ICON: Record<string, string> = {
  '🎯': 'target',
  '💡': 'lightbulb',
  '📦': 'package',
  '💾': 'database',
  '🔒': 'lock',
  '📧': 'mail',
  '⚡': 'zap',
  '🔌': 'plug',
  '🛠️': 'wrench',
  '❌': 'x-circle',
  '✅': 'check-circle',
  '✨': 'sparkles',
  '🚀': 'rocket',
  '🧩': 'puzzle',
  '🦅': 'eagle',
  '🐧': 'penguin',
  '🔥': 'flame',
  '🎉': 'party-popper',
  '✂️': 'scissors',
  '💬': 'message-circle',
  '🧑': 'user',
  '🤖': 'bot',
  '🔀': 'shuffle',
  '🚗': 'car',
  '⚙️': 'cog',
  '🛡️': 'shield',
  '🎭': 'masks',
  '🎮': 'gamepad',
  '🐦': 'bird',
  '✈️': 'plane',
  '📐': 'drafting-compass',
  '☕': 'book', // Placeholder for book/coffee
  '📝': 'book',
  '🔧': 'wrench',
  '👁️': 'eye',
  '🔑': 'key',
  '🧬': 'dna',
  '🏰': 'shield',
  '⏳': 'hourglass'
};

export function parseEmojiToSvg(text: string): string {
  if (!text) return text;
  
  let result = text;
  for (const [emoji, iconName] of Object.entries(EMOJI_TO_ICON)) {
    const path = SVG_PATHS[iconName];
    if (path) {
      const svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:2px;margin-left:2px;" class="svg-inline-icon icon-${iconName}">${path}</svg>`;
      // Replace all occurrences of the emoji
      result = result.split(emoji).join(svgHtml);
    }
  }
  return result;
}
