







export class ExternalStylesheetsInjector {
  


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
