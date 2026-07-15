import {
  type UserProgress, type Badge, type LevelConfig, type XPEvent, type EmbedConfig,
  LEVELS, BADGE_DEFINITIONS
} from './xpConfig';

export class XPEngine {
  private userProgress: UserProgress;
  private xpHistory: XPEvent[] = [];
  private onLevelUpCallback?: (newLevel: number) => void;
  private onBadgeEarnedCallback?: (badge: Badge) => void;

  constructor(userId = 'guest', onLevelUp?: (newLevel: number) => void, onBadgeEarned?: (badge: Badge) => void) {
    this.userProgress = { userId, totalXP: 0, currentLevel: 1, xpInCurrentLevel: 0, xpToNextLevel: 100, badges: [], completedModules: [], streakDays: 1 };
    this.onLevelUpCallback = onLevelUp; this.onBadgeEarnedCallback = onBadgeEarned;
  }

  public awardXP(event: Omit<XPEvent, 'timestamp'>): { leveledUp: boolean; newBadges: Badge[] } {
    this.xpHistory.push({ ...event, timestamp: Date.now() });
    this.userProgress.totalXP += event.xpAmount;
    this.userProgress.xpInCurrentLevel += event.xpAmount;
    let leveledUp = false;
    while (this.checkLevelUp()) leveledUp = true;
    return { leveledUp, newBadges: this.checkNewBadges() };
  }

  private checkLevelUp(): boolean {
    const next = LEVELS.find((l) => l.level === this.userProgress.currentLevel + 1);
    if (!next || this.userProgress.xpInCurrentLevel < next.xpRequired) return false;
    this.userProgress.currentLevel++;
    this.userProgress.xpInCurrentLevel = 0;
    this.userProgress.xpToNextLevel = LEVELS.find((l) => l.level === this.userProgress.currentLevel + 1)?.xpRequired || Infinity;
    this.onLevelUpCallback?.(this.userProgress.currentLevel);
    return true;
  }

  private checkNewBadges(): Badge[] {
    const newBadges: Badge[] = [];
    for (const def of BADGE_DEFINITIONS) {
      if (this.userProgress.badges.some((b) => b.id === def.id)) continue;
      if (this.shouldAwardBadge(def.id)) {
        const badge = { ...def, earnedAt: Date.now() };
        this.userProgress.badges.push(badge);
        newBadges.push(badge);
        this.onBadgeEarnedCallback?.(badge);
      }
    }
    return newBadges;
  }

  private shouldAwardBadge(badgeId: string): boolean {
    const checkMod = (m: string) => this.userProgress.completedModules.includes(m);
    switch (badgeId) {
      case 'first-steps': return this.xpHistory.some((e) => e.type === 'QUIZ_COMPLETE');
      case 'sorting-wizard': return checkMod('bubble-sort') && checkMod('quick-sort') && checkMod('merge-sort') && checkMod('heap-sort');
      case 'oop-guru': return checkMod('oop-encapsulation') && checkMod('oop-inheritance');
      case 'solid-master': return this.userProgress.completedModules.filter((m) => m.startsWith('solid-')).length >= 5;
      case 'pattern-hunter': return this.userProgress.completedModules.filter((m) => m.startsWith('pattern-')).length >= 3;
      case 'streak-keeper': return this.userProgress.streakDays >= 7;
      case 'system-architect': return checkMod('load-balancer');
      case 'dsa-champion': return this.userProgress.currentLevel >= 5;
      default: return false;
    }
  }

  public completeModule(moduleId: string): void {
    if (!this.userProgress.completedModules.includes(moduleId)) this.userProgress.completedModules.push(moduleId);
  }

  public getProgress = (): UserProgress => ({ ...this.userProgress });
  public getCurrentLevelInfo = (): LevelConfig => LEVELS.find((l) => l.level === this.userProgress.currentLevel) || LEVELS[LEVELS.length - 1];
  public getXPHistory = (): XPEvent[] => [...this.xpHistory];
  public static getAllBadges = (): Omit<Badge, 'earnedAt'>[] => [...BADGE_DEFINITIONS];
  public static getAllLevels = (): LevelConfig[] => [...LEVELS];

  public static generateEmbedCode(config: EmbedConfig): string {
    const params = new URLSearchParams({ type: config.widgetType, theme: config.theme, autoPlay: config.autoPlay.toString(), controls: config.showControls.toString() });
    return `<iframe src="https://visualization-dsa.example.com/embed?${params.toString()}" width="${config.width}" height="${config.height}" frameborder="0" allowfullscreen style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" title="DSA Visualization"></iframe>`;
  }

  public getLevelProgressPercent(): number {
    const cur = this.getCurrentLevelInfo(), next = LEVELS.find((l) => l.level === this.userProgress.currentLevel + 1);
    return !next ? 100 : Math.min(100, Math.round((this.userProgress.xpInCurrentLevel / (next.xpRequired - cur.xpRequired)) * 100));
  }

  public getStats = () => ({
    totalXP: this.userProgress.totalXP,
    level: this.userProgress.currentLevel,
    badgesEarned: this.userProgress.badges.length,
    modulesCompleted: this.userProgress.completedModules.length,
    quizzesTaken: this.xpHistory.filter((e) => e.type === 'QUIZ_COMPLETE').length,
    currentStreak: this.userProgress.streakDays,
  });
}

export default XPEngine;
