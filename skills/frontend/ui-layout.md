# 📐 UI Layout Rules

## 🎯 Mục tiêu
Quy tắc bố cục giao diện đảm bảo responsive, dark/light theme hoạt động đúng, và tính nhất quán UI trên toàn bộ Algo Playground.

---

## 📜 Quy tắc sắt

### 1. Spacing system — dùng design tokens
Luôn dùng CSS spacing tokens thay vì hardcoded values:
```css
/* ✅ ĐÚNG */
gap: var(--space-3);     /* 0.75rem */
padding: var(--space-4); /* 1rem */
margin: var(--space-2);  /* 0.5rem */

/* ❌ SAI */
gap: 12px;
padding: 16px;
```

### 2. Border & Radius — dùng design tokens
```css
/* ✅ ĐÚNG */
border-radius: var(--radius-md);   /* 6px */
border: 1px solid var(--color-border-default);
box-shadow: var(--shadow-md);

/* ❌ SAI */
border-radius: 8px;
border: 1px solid rgba(255,255,255,0.08);
```

### 3. Glassmorphic Panel — theo design system
Algo Playground workspace sử dụng kiến trúc glassmorphic:
```css
/* Panel chính */
background: var(--glass-bg);           /* rgba(255,255,255,0.85) light / rgba(30,35,32,0.88) dark */
border: 1px solid var(--glass-border);
backdrop-filter: blur(12px);

/* Panel header */
background: var(--color-bg-surface);
border-bottom: 1px solid var(--color-border-subtle);
```

### 4. Responsive breakpoints
```css
/* Mobile: auto-collapse editor */
@media (max-width: 768px) {
  .editor-panel { /* collapsed by default */ }
}
```
- Editor tự collapse trên `<768px` (đã cài AL-050)
- Drawer VCR có toggle button (AL-051)
- Layout chuyển từ side-by-side sang stacked trên mobile

### 5. Z-index layering
Tuân thủ hệ z-index tokens:
```css
--z-base:    0;    /* canvas content */
--z-raised:  10;   /* floating panels */
--z-overlay: 100;  /* overlays, tooltips */
--z-modal:   1000; /* modals */
--z-toast:   2000; /* notifications */
--z-tooltip: 3000; /* tooltips */
```

### 6. Typography — dùng design tokens
```css
/* ✅ ĐÚNG */
color: var(--color-text-primary);
font-size: var(--text-xs);    /* 11px */
line-height: var(--leading-tight);

/* ❌ SAI */
color: #e2e8f0;
font-size: 11px;
```

### 7. Scrollbar styling
```css
/* ✅ ĐÚNG — dùng token */
::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* ❌ SAI — hardcoded */
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.10);
}
```

### 8. Animation & Transition
```css
/* ✅ ĐÚNG */
transition: var(--transition-fast);    /* all 0.12s ease */
transition: var(--transition-smooth); /* all 0.22s cubic-bezier(0.4, 0, 0.2, 1) */

/* ❌ SAI */
transition: all 0.15s ease;
```

### 9. Canvas background
Canvas PHẢI dùng design token cho nền:
```css
/* ✅ ĐÚNG */
background: var(--canvas-bg);  /* #131614 dark / #ffffff light */

/* ❌ SAI */
background: #0f1215;
background: #131614; /* hardcoded — broken in light mode */
```

### 10. Button styling
```css
/* Primary button */
background: var(--btn-primary-bg);
color: var(--btn-primary-text);
box-shadow: var(--btn-primary-shadow);
&:hover { background: var(--btn-primary-bg-hover); }

/* Ghost button */
background: var(--btn-ghost-bg);
color: var(--btn-ghost-text);
border: 1px solid var(--btn-ghost-border);
```

---

## 🔍 Checklist kiểm tra
```bash
# Không được có hex colors trong component templates
rg "#[0-9a-fA-F]{3,8}" frontend/src/features/algo-playground/components/*.vue

# Không được có hardcoded pixel values cho spacing
rg "(padding|margin|gap):\s*\d+px" frontend/src/features/algo-playground/

# Không được có hardcoded border-radius
rg "border-radius:\s*\d+px" frontend/src/features/algo-playground/
```
