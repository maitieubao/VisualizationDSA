






export class SecureOriginChecker {
  private whitelistedDomains: Set<string>;

  constructor(initialDomains: string[] = [
    'https://visualization-dsa.edu.vn',
    'https://moodle.hust.edu.vn',
    'https://canvas.usth.edu.vn',
  ]) {
    this.whitelistedDomains = new Set(initialDomains);
  }

  



  public isValidOrigin(origin: string): boolean {
    if (this.whitelistedDomains.has('*')) return true;
    return this.whitelistedDomains.has(origin);
  }

  


  public addTrustedDomain(domain: string): void {
    this.whitelistedDomains.add(domain);
  }

  


  public removeTrustedDomain(domain: string): void {
    this.whitelistedDomains.delete(domain);
  }

  


  public clearWhitelist(): void {
    this.whitelistedDomains.clear();
  }

  


  public get domainCount(): number {
    return this.whitelistedDomains.size;
  }

  


  public getWhitelistedDomains(): string[] {
    return Array.from(this.whitelistedDomains);
  }
}
