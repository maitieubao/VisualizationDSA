/** Parse sandboxConfig JSON ({"demo":"binary-search"}) → demo id, trả null nếu không có/hỏng. */
export function parseSandboxDemo(sandboxConfig: string): string | null {
  if (!sandboxConfig) return null;
  try {
    const parsed = JSON.parse(sandboxConfig) as { demo?: unknown };
    return typeof parsed.demo === 'string' && parsed.demo.length > 0 ? parsed.demo : null;
  } catch {
    return null;
  }
}
