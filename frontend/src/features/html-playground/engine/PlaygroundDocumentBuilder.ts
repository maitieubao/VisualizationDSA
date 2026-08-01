import type { PlaygroundSource } from '../types/playground.types';

export class PlaygroundDocumentBuilder {
  public static buildDocument(source: PlaygroundSource): string {
    const html = source.html ?? '';
    const css = this.escapeCss(source.css ?? '');
    const js = this.escapeJs(source.js ?? '');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Playground Preview</title>
<style>
${css}
</style>
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
