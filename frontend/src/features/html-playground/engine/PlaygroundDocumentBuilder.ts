import type { PlaygroundSource } from '../types/playground.types';

export class PlaygroundDocumentBuilder {
  /**
   * Error bridge (HT-003): bắt lỗi runtime/syntax của code người dùng ngay trong
   * iframe rồi postMessage lên parent để Workspace hiển thị panel lỗi.
   * - window 'error' event: bắt cả lỗi script lẫn lỗi tải tài nguyên.
   * - window 'unhandledrejection': bắt Promise reject không được xử lý.
   */
  private static readonly ERROR_BRIDGE_JS = `(function () {
  function postError(message, source, line, col) {
    try {
      parent.postMessage({ type: 'playground-error', message: String(message), source: source || '', line: line || 0, col: col || 0 }, '*');
    } catch (_ignore) {
      // iframe đã bị gỡ khỏi DOM — bỏ qua
    }
  }
  window.addEventListener('error', function (event) {
    postError(event.message || 'Lỗi không xác định', event.filename || '', event.lineno || 0, event.colno || 0);
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    var message = reason && typeof reason.message === 'string' ? reason.message : String(reason || 'Promise rejected');
    postError(message, '', 0, 0);
  });
})();`;

  public static buildDocument(source: PlaygroundSource): string {
    const html = source.html ?? '';
    const css = this.escapeCss(source.css ?? '');
    const js = this.escapeJs(source.js ?? '');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="about:blank">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src * data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'">
<title>Playground Preview</title>
<style>
${css}
</style>
<script>
${this.ERROR_BRIDGE_JS}
</script>
</head>
<body>
${html}
<script>
${js}
</script>
</body>
</html>`;
  }

  private static escapeJs(js: string): string {
    return js.replace(/</g, '\\u003c');
  }

  private static escapeCss(css: string): string {
    return css.replace(/<\//g, '\\3c/');
  }
}
