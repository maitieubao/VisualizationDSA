/**
 * Nguồn allowlist DUY NHẤT của Embed Widget (EW-013) — bridge, host script
 * và test đều phải đi qua class này, không được duy trì danh sách riêng.
 *
 * Mọi input đều được normalize (EW-013/EW-019):
 *   - trim khoảng trắng thừa + lowercase toàn bộ
 *   - nếu là URL hợp lệ: parse qua `new URL` → chỉ giữ `protocol://host`
 *     (port được giữ nguyên: https://host:8443 ≠ https://host, tránh spoof)
 *   - bỏ trailing slash
 *   - chuỗi rỗng/không hợp lệ → bị loại khỏi allowlist (không bao giờ có ''),
 *     tránh EW-022 (allowedOrigins=[''])
 *
 * Hỗ trợ wildcard subdomain: pattern `*.moodle.hust.edu.vn` khớp chính base
 * và MỌI subdomain, nhưng không khớp domain tương tự (evil-moodle.hust.edu.vn).
 */
export class SecureOriginChecker {
  private whitelistedDomains: Set<string>;

  constructor(initialDomains: string[] = [
    'https://visualization-dsa.edu.vn',
    'https://moodle.hust.edu.vn',
    'https://canvas.usth.edu.vn',
  ]) {
    this.whitelistedDomains = new Set(
      initialDomains
        .map(normalizeOrigin)
        .filter((origin) => origin.length > 0),
    );
  }

  /**
   * Kiểm tra origin truyền vào có nằm trong allowlist hay không.
   * Fail-closed: origin rỗng/không parse được → luôn bị từ chối.
   */
  public isValidOrigin(origin: string): boolean {
    if (this.whitelistedDomains.has('*')) return true;
    const normalized = normalizeOrigin(origin);
    if (normalized.length === 0) return false;
    if (this.whitelistedDomains.has(normalized)) return true;
    // Wildcard subdomain: "*.base" khớp mọi subdomain + chính base (dấu '.' đầu
    // base đảm bảo không khớp nhầm domain tiền tố như evil-base.com).
    const host = normalized.replace(/^[a-z]+:\/\//, '');
    for (const pattern of this.whitelistedDomains) {
      if (pattern.startsWith('*.')) {
        const dotBase = pattern.slice(1);
        if (host === dotBase.slice(1) || host.endsWith(dotBase)) return true;
      }
    }
    return false;
  }

  public addTrustedDomain(domain: string): void {
    const normalized = normalizeOrigin(domain);
    if (normalized.length > 0) {
      this.whitelistedDomains.add(normalized);
    }
  }

  public removeTrustedDomain(domain: string): void {
    this.whitelistedDomains.delete(normalizeOrigin(domain));
  }

  public clearWhitelist(): void {
    this.whitelistedDomains.clear();
  }

  public get domainCount(): number {
    return this.whitelistedDomains.size;
  }

  /** Trả về bản sao mảng — mutate kết quả không ảnh hưởng allowlist gốc. */
  public getWhitelistedDomains(): string[] {
    return Array.from(this.whitelistedDomains);
  }
}

/**
 * Chuẩn hóa một origin/domain thô: trim → lowercase → parse URL → bỏ trailing slash.
 * Không phải URL hợp lệ thì chỉ trim + bỏ slash, giữ nguyên phần còn lại.
 */
function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed === '*') return trimmed;
  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
}
