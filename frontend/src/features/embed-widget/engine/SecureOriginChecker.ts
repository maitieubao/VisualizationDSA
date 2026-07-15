/**
 * SecureOriginChecker — Whitelist Domain Checker
 *
 * Validates postMessage origins against a configurable whitelist
 * to prevent Cross-Site Scripting (XSS) attacks on embedded widgets.
 */

export class SecureOriginChecker {
  private whitelistedDomains: Set<string>;

  constructor(initialDomains: string[] = [
    'https://visualization-dsa.edu.vn',
    'https://moodle.hust.edu.vn',
    'https://canvas.usth.edu.vn',
  ]) {
    this.whitelistedDomains = new Set(initialDomains);
  }

  /**
   * Checks whether an origin is allowed by the whitelist.
   * If '*' is present, all origins are accepted (public embed mode).
   */
  public isValidOrigin(origin: string): boolean {
    if (this.whitelistedDomains.has('*')) return true;
    return this.whitelistedDomains.has(origin);
  }

  /**
   * Dynamically adds a trusted domain at runtime.
   */
  public addTrustedDomain(domain: string): void {
    this.whitelistedDomains.add(domain);
  }

  /**
   * Removes a domain from the whitelist.
   */
  public removeTrustedDomain(domain: string): void {
    this.whitelistedDomains.delete(domain);
  }

  /**
   * Clears the entire whitelist.
   */
  public clearWhitelist(): void {
    this.whitelistedDomains.clear();
  }

  /**
   * Returns the current number of whitelisted domains.
   */
  public get domainCount(): number {
    return this.whitelistedDomains.size;
  }

  /**
   * Returns a copy of the current whitelist as an array.
   */
  public getWhitelistedDomains(): string[] {
    return Array.from(this.whitelistedDomains);
  }
}
