import {
  EXPORT_MIN_SCALE,
  EXPORT_MAX_SCALE,
  EXPORT_DEFAULT_SCALE,
} from '../types/export-share.types';

// EX-009: Font JetBrains Mono không nhúng được vào ảnh SVG đơn lẻ
// (webfont của app không tải trong document ảnh độc lập), nên dùng
// chuỗi font hệ thống sát với preview để tránh lệch fidelity.
const MONO_FONT_FALLBACK_RULE =
  'svg text, svg tspan { font-family: "JetBrains Mono", ui-monospace, "Cascadia Code", "Consolas", "Courier New", monospace; }';

export class SVGToCanvasExporter {
  public static extractSVGDataURI(svgElement: SVGElement): string {
    const clone = this.buildStyledClone(svgElement);
    const svgString = new XMLSerializer().serializeToString(clone);

    // EX-022: TextEncoder + btoa thay cho unescape(encodeURIComponent(...)) đã deprecated.
    const bytes = new TextEncoder().encode(svgString);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return 'data:image/svg+xml;base64,' + btoa(binary);
  }

  public static clampScale(scale: number): number {
    return Math.max(EXPORT_MIN_SCALE, Math.min(EXPORT_MAX_SCALE, scale));
  }

  public static async exportToPNG(
    svgElement: SVGElement,
    scale: number = EXPORT_DEFAULT_SCALE,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    const clampedScale = this.clampScale(scale);

    const svgSvg = svgElement as unknown as SVGSVGElement;
    const svgWidth =
      svgSvg.viewBox?.baseVal?.width || svgElement.clientWidth || 800;
    const svgHeight =
      svgSvg.viewBox?.baseVal?.height || svgElement.clientHeight || 500;

    // Bước tiến thật (không phải timer giả): 30 = đóng gói CSS, 50 = mã hóa SVG.
    onProgress?.(30);
    const dataUri = this.extractSVGDataURI(svgElement);
    onProgress?.(50);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // EX-005: toàn bộ khối drawImage/toDataURL bọc try/catch → reject
        // để promise không bao giờ treo (trước đây isExporting kẹt vĩnh viễn).
        try {
          const canvas = document.createElement('canvas');
          canvas.width = svgWidth * clampedScale;
          canvas.height = svgHeight * clampedScale;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Không thể khởi tạo môi trường vẽ Canvas 2D.');
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          onProgress?.(75);

          const dataUrl = canvas.toDataURL('image/png');
          onProgress?.(90);

          img.onload = null;
          img.onerror = null;

          resolve(dataUrl);
        } catch (err) {
          img.onload = null;
          img.onerror = null;
          reject(
            err instanceof Error
              ? err
              : new Error('Lỗi hạ tầng kết xuất ảnh PNG không xác định.'),
          );
        }
      };
      img.onerror = () => {
        img.onload = null;
        img.onerror = null;
        reject(new Error('Lỗi tải cấu trúc ảnh SVG ảo.'));
      };
      img.src = dataUri;
    });
  }

  public static exportToSVGString(svgElement: SVGElement): string {
    const clone = this.buildStyledClone(svgElement);
    return new XMLSerializer().serializeToString(clone);
  }

  // EX-022: Helper dùng chung cho cả extractSVGDataURI và exportToSVGString —
  // clone SVG + chèn <style> chứa CSS scoped của component workspace.
  private static buildStyledClone(svgElement: SVGElement): SVGElement {
    const clone = svgElement.cloneNode(true) as SVGElement;

    const styleElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style',
    );
    const scopedCss = this.collectWorkspaceCss(svgElement);
    styleElement.textContent = scopedCss
      ? `${scopedCss}\n${MONO_FONT_FALLBACK_RULE}`
      : MONO_FONT_FALLBACK_RULE;
    clone.insertBefore(styleElement, clone.firstChild);

    return clone;
  }

  // EX-008: Chỉ giữ lại các rule CSS scoped của workspace ([data-v-...] trên
  // cây SVG) thay vì nhét toàn bộ cssRules của app — payload nhẹ hơn và
  // không có rule toàn cục đè lên style trong ảnh xuất.
  private static collectScopeSelectors(svgElement: SVGElement): string[] {
    const selectors: string[] = [];
    let node: Element | null = svgElement;
    while (node) {
      for (const attr of Array.from(node.attributes)) {
        if (attr.name.startsWith('data-v-')) {
          selectors.push(`[${attr.name}]`);
        }
      }
      node = node.parentElement;
    }
    return selectors;
  }

  private static collectWorkspaceCss(svgElement: SVGElement): string {
    const scopeSelectors = this.collectScopeSelectors(svgElement);
    if (scopeSelectors.length === 0) return '';

    const styleRuleClass =
      typeof CSSStyleRule !== 'undefined' ? CSSStyleRule : null;

    const cssLines: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRule[];
      try {
        rules = Array.from(sheet.cssRules);
      } catch {
        continue;
      }
      for (const rule of rules) {
        if (!styleRuleClass || !(rule instanceof styleRuleClass)) continue;
        if (!scopeSelectors.some((sel) => rule.cssText.includes(sel))) {
          continue;
        }
        cssLines.push(this.sanitizeCssText(rule.cssText));
      }
    }
    return cssLines.join('\n');
  }

  // EX-008: Bỏ @import và url() tương đối — không thể nạp trong ảnh SVG đứng lặng,
  // url tuyệt đối (http/data/#) giữ nguyên.
  private static sanitizeCssText(cssText: string): string {
    if (cssText.trimStart().startsWith('@import')) return '';
    return cssText.replace(
      /url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi,
      (match, quote, rawTarget: string) => {
        const target = rawTarget.trim();
        if (/^(https?:|data:|#|\/)/i.test(target)) return match;
        return 'none';
      },
    );
  }
}
