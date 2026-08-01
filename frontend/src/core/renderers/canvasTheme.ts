

export const CANVAS_COLORS = {
  
  default: '#38BDF8', 
  compare: '#FBBF24', 
  swap:    '#FB7185', 
  sorted:  '#34D399', 
  text:    '#F1F5F9', 
  muted:   '#64748B', 

  
  bgDark:  '#080c14',
  gridDark: 'rgba(6, 182, 212, 0.03)',
};

export const CANVAS_LAYOUT = {
  margin: 30,
  marginBottom: 100, 
  paddingTop: 45,
  borderRadius: 6,
};





export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
