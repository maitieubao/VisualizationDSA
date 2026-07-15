/**
 * ExternalStylesheetsInjector — Trích xuất CSS ngoại vi nhúng kèm SVG
 *
 * Quét toàn bộ document.styleSheets của trang web chủ, gộp thành chuỗi CSS
 * và tiêm vào thẻ <style> của SVG mục tiêu, bảo toàn phong cách Glassmorphism,
 * viền Neon và font JetBrains Mono khi xuất ảnh.
 */

export class ExternalStylesheetsInjector {
  /**
   * Quét toàn bộ document.styleSheets đang có của trang web, gộp thành chuỗi CSS
   */
  public static extractActiveCSSRules(): string {
    let cssTextCombined = '';

    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        if (sheet.cssRules) {
          for (let j = 0; j < sheet.cssRules.length; j++) {
            cssTextCombined += sheet.cssRules[j].cssText + '\n';
          }
        }
      } catch {
        console.debug('Bỏ qua stylesheet CORS ngoại vi:', sheet.href);
      }
    }

    return cssTextCombined;
  }

  /**
   * Tiêm chuỗi CSS vào thẻ <style> của SVG mục tiêu
   */
  public static injectCSSIntoSVG(svgElement: SVGElement): void {
    const cssContent = this.extractActiveCSSRules();

    const styleElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style',
    );
    styleElement.setAttribute('type', 'text/css');
    styleElement.textContent = cssContent;

    svgElement.insertBefore(styleElement, svgElement.firstChild);
  }
}
