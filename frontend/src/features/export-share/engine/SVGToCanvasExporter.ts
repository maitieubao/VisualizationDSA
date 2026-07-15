/**
 * SVGToCanvasExporter — Chuyển đổi SVG sang PNG 3x sắc mịn Retina
 *
 * Nhúng kèm toàn bộ stylesheet CSS ngoại vi vào SVG clone,
 * vẽ lên Canvas ẩn nhân tỉ lệ Scale phóng đại, xuất Base64 PNG
 * chất lượng in ấn sắc nét Retina.
 */

import {
  EXPORT_MIN_SCALE,
  EXPORT_MAX_SCALE,
  EXPORT_DEFAULT_SCALE,
} from '../types/export-share.types';

export class SVGToCanvasExporter {
  /**
   * Nhúng style ngoại vi và trích xuất chuỗi Base64 SVG DataURI
   */
  public static extractSVGDataURI(svgElement: SVGElement): string {
    const clone = svgElement.cloneNode(true) as SVGElement;

    const styleElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style',
    );
    styleElement.textContent = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');
    clone.insertBefore(styleElement, clone.firstChild);

    const svgString = new XMLSerializer().serializeToString(clone);
    const unicodeString = unescape(encodeURIComponent(svgString));
    return 'data:image/svg+xml;base64,' + btoa(unicodeString);
  }

  /**
   * Clamp scale factor trong giới hạn an toàn [MIN_SCALE, MAX_SCALE]
   */
  public static clampScale(scale: number): number {
    return Math.max(EXPORT_MIN_SCALE, Math.min(EXPORT_MAX_SCALE, scale));
  }

  /**
   * Chuyển đổi SVG sang PNG Base64 với độ phóng đại scale sắc mịn
   */
  public static async exportToPNG(
    svgElement: SVGElement,
    scale: number = EXPORT_DEFAULT_SCALE,
  ): Promise<string> {
    const clampedScale = this.clampScale(scale);
    const dataUri = this.extractSVGDataURI(svgElement);

    const svgSvg = svgElement as unknown as SVGSVGElement;
    const svgWidth =
      svgSvg.viewBox?.baseVal?.width || svgElement.clientWidth || 800;
    const svgHeight =
      svgSvg.viewBox?.baseVal?.height || svgElement.clientHeight || 500;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svgWidth * clampedScale;
        canvas.height = svgHeight * clampedScale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(
            new Error('Không thể khởi tạo môi trường vẽ Canvas 2D.'),
          );
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');

        // GC cleanup
        img.onload = null;
        img.onerror = null;

        resolve(dataUrl);
      };
      img.onerror = () => {
        img.onload = null;
        img.onerror = null;
        reject(new Error('Lỗi tải cấu trúc ảnh SVG ảo.'));
      };
      img.src = dataUri;
    });
  }

  /**
   * Trích xuất chuỗi SVG XML thuần khiết cho tải xuống dạng Vector
   */
  public static exportToSVGString(svgElement: SVGElement): string {
    const clone = svgElement.cloneNode(true) as SVGElement;

    const styleElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'style',
    );
    styleElement.textContent = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');
    clone.insertBefore(styleElement, clone.firstChild);

    return new XMLSerializer().serializeToString(clone);
  }
}
