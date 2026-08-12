import { describe, it, expect, beforeEach } from 'vitest';
import { SecureOriginChecker } from '../engine/SecureOriginChecker';

describe('SecureOriginChecker', () => {
  let checker: SecureOriginChecker;

  beforeEach(() => {
    checker = new SecureOriginChecker();
  });

  describe('default whitelist', () => {
    it('should accept default whitelisted domain visualization-dsa.edu.vn', () => {
      expect(checker.isValidOrigin('https://visualization-dsa.edu.vn')).toBe(true);
    });

    it('should accept default whitelisted domain moodle.hust.edu.vn', () => {
      expect(checker.isValidOrigin('https://moodle.hust.edu.vn')).toBe(true);
    });

    it('should accept default whitelisted domain canvas.usth.edu.vn', () => {
      expect(checker.isValidOrigin('https://canvas.usth.edu.vn')).toBe(true);
    });

    it('should reject domains not in whitelist', () => {
      expect(checker.isValidOrigin('https://malicious-hacker.com')).toBe(false);
    });

    it('should reject empty origin string', () => {
      expect(checker.isValidOrigin('')).toBe(false);
    });

    it('should have 3 default domains', () => {
      expect(checker.domainCount).toBe(3);
    });
  });

  describe('wildcard mode', () => {
    it('should accept any origin when wildcard is in whitelist', () => {
      const wildcardChecker = new SecureOriginChecker(['*']);
      expect(wildcardChecker.isValidOrigin('https://random-blog.com')).toBe(true);
      expect(wildcardChecker.isValidOrigin('https://wordpress.org')).toBe(true);
      expect(wildcardChecker.isValidOrigin('')).toBe(true);
    });
  });

  describe('addTrustedDomain', () => {
    it('should dynamically add a trusted domain', () => {
      expect(checker.isValidOrigin('https://newschool.edu.vn')).toBe(false);

      checker.addTrustedDomain('https://newschool.edu.vn');
      expect(checker.isValidOrigin('https://newschool.edu.vn')).toBe(true);
      expect(checker.domainCount).toBe(4);
    });

    it('should not duplicate existing domains', () => {
      checker.addTrustedDomain('https://moodle.hust.edu.vn');
      expect(checker.domainCount).toBe(3);
    });
  });

  describe('removeTrustedDomain', () => {
    it('should remove a domain from the whitelist', () => {
      checker.removeTrustedDomain('https://moodle.hust.edu.vn');
      expect(checker.isValidOrigin('https://moodle.hust.edu.vn')).toBe(false);
      expect(checker.domainCount).toBe(2);
    });

    it('should handle removing non-existent domain gracefully', () => {
      checker.removeTrustedDomain('https://nonexistent.com');
      expect(checker.domainCount).toBe(3);
    });
  });

  describe('clearWhitelist', () => {
    it('should clear all domains from whitelist', () => {
      checker.clearWhitelist();
      expect(checker.domainCount).toBe(0);
      expect(checker.isValidOrigin('https://visualization-dsa.edu.vn')).toBe(false);
    });
  });

  describe('getWhitelistedDomains', () => {
    it('should return copy of whitelist as array', () => {
      const domains = checker.getWhitelistedDomains();
      expect(domains).toHaveLength(3);
      expect(domains).toContain('https://visualization-dsa.edu.vn');
      expect(domains).toContain('https://moodle.hust.edu.vn');
      expect(domains).toContain('https://canvas.usth.edu.vn');
    });

    it('EW-031: mutating the returned array must not affect the checker', () => {
      const domains = checker.getWhitelistedDomains();
      domains.push('https://evil-injected.com');
      domains.splice(0, 1);

      expect(checker.domainCount).toBe(3);
      expect(checker.isValidOrigin('https://evil-injected.com')).toBe(false);
      expect(checker.isValidOrigin('https://visualization-dsa.edu.vn')).toBe(true);
    });
  });

  describe('EW-019 (P2): origin spoof edge cases — fail-closed', () => {
    it('should reject non-default port spoof (:8443)', () => {
      expect(checker.isValidOrigin('https://moodle.hust.edu.vn:8443')).toBe(false);
    });

    it('should reject http:// downgrade of a https whitelisted domain', () => {
      expect(checker.isValidOrigin('http://moodle.hust.edu.vn')).toBe(false);
      expect(checker.isValidOrigin('http://visualization-dsa.edu.vn')).toBe(false);
    });

    it('should reject evil subdomain prefix (evil-moodle.hust.edu.vn)', () => {
      expect(checker.isValidOrigin('https://evil-moodle.hust.edu.vn')).toBe(false);
    });

    it('should reject evil base suffix (moodle.hust.edu.vn.evil.com)', () => {
      expect(checker.isValidOrigin('https://moodle.hust.edu.vn.evil.com')).toBe(false);
    });

    it('should reject completely unrelated domain', () => {
      expect(checker.isValidOrigin('https://moodle.hust.edu.vn2')).toBe(false);
    });

    it('should normalize trailing slash away (same origin)', () => {
      expect(checker.isValidOrigin('https://moodle.hust.edu.vn/')).toBe(true);
      expect(checker.isValidOrigin('https://moodle.hust.edu.vn///')).toBe(true);
    });

    it('should normalize whitespace and case (trim + lowercase)', () => {
      expect(checker.isValidOrigin('  HTTPS://MOODLE.HUST.EDU.VN  ')).toBe(true);
    });

    it('should normalize input when adding a trusted domain', () => {
      checker.addTrustedDomain('  https://NEWSCHOOL.EDU.VN/  ');
      expect(checker.isValidOrigin('https://newschool.edu.vn')).toBe(true);
      expect(checker.domainCount).toBe(4);
    });
  });

  describe('EW-013 (P2): wildcard subdomain pattern', () => {
    it('should accept any subdomain of *.lms.usth.edu.vn', () => {
      const wildcardChecker = new SecureOriginChecker(['https://moodle.hust.edu.vn', '*.lms.usth.edu.vn']);
      expect(wildcardChecker.isValidOrigin('https://coursera.lms.usth.edu.vn')).toBe(true);
      expect(wildcardChecker.isValidOrigin('https://a.b.lms.usth.edu.vn')).toBe(true);
    });

    it('should NOT match evil prefix / suffix with wildcard pattern', () => {
      const wildcardChecker = new SecureOriginChecker(['*.lms.usth.edu.vn']);
      expect(wildcardChecker.isValidOrigin('https://evil-lms.usth.edu.vn')).toBe(false);
      expect(wildcardChecker.isValidOrigin('https://lms.usth.edu.vn.attacker.com')).toBe(false);
      expect(wildcardChecker.isValidOrigin('https://lms.usth.edu.vn.evil.com')).toBe(false);
    });

    it('should accept the base domain itself for *.lms.usth.edu.vn', () => {
      const wildcardChecker = new SecureOriginChecker(['*.lms.usth.edu.vn']);
      expect(wildcardChecker.isValidOrigin('https://lms.usth.edu.vn')).toBe(true);
    });
  });

  describe('custom initialization', () => {
    it('should initialize with custom domains', () => {
      const custom = new SecureOriginChecker(['https://school-a.com', 'https://school-b.com']);
      expect(custom.domainCount).toBe(2);
      expect(custom.isValidOrigin('https://school-a.com')).toBe(true);
      expect(custom.isValidOrigin('https://school-b.com')).toBe(true);
      expect(custom.isValidOrigin('https://visualization-dsa.edu.vn')).toBe(false);
    });

    it('should initialize with empty array', () => {
      const empty = new SecureOriginChecker([]);
      expect(empty.domainCount).toBe(0);
      expect(empty.isValidOrigin('https://any.com')).toBe(false);
    });
  });
});
