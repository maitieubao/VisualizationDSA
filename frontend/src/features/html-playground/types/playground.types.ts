export type PlaygroundLanguage = 'html' | 'css' | 'javascript';

export interface PlaygroundSource {
  html: string;
  css: string;
  js: string;
}

export interface PlaygroundTab {
  readonly id: PlaygroundLanguage;
  readonly label: string;
}

/** Lỗi runtime trong iframe preview được chuyển lên parent qua error bridge (HT-003). */
export interface PlaygroundRuntimeError {
  readonly message: string;
  readonly source: string;
  readonly line: number;
  readonly col: number;
}

export const PLAYGROUND_TABS: readonly PlaygroundTab[] = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JS' },
] as const;

export const DEFAULT_PLAYGROUND_SOURCE: PlaygroundSource = {
  html: '<h1 class="title">Hello VisualizationDSA 👋</h1>\n<button id="click-btn">Click me!</button>',
  css: 'body {\n  font-family: system-ui, sans-serif;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  margin: 0;\n  background: #0f172a;\n  color: #e2e8f0;\n}\n\n.title {\n  color: #818cf8;\n  font-size: 2rem;\n}\n\nbutton {\n  margin-top: 1rem;\n  padding: 0.5rem 1.25rem;\n  border: none;\n  border-radius: 0.5rem;\n  background: #6366f1;\n  color: #fff;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #4f46e5;\n}',
  js: 'const btn = document.getElementById("click-btn");\nlet count = 0;\n\nbtn.addEventListener("click", () => {\n  count += 1;\n  document.querySelector(".title").textContent = `Clicked ${count} times!`;\n});',
};
