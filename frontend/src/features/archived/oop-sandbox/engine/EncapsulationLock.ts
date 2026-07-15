import { drawAccessLock, createShakeAnimation } from './lockRenderer';
import { drawViolationLaser, drawModifierBadge, getModifierColor } from './badgeRenderer';
import type { LockConfig, LaserBeam } from '../types/oop-sandbox.types';
import type { AccessModifier } from '../types/oop-sandbox.types';

export {
  drawAccessLock,
  createShakeAnimation,
  drawViolationLaser,
  drawModifierBadge,
  getModifierColor,
  type LockConfig,
  type LaserBeam,
  type AccessModifier,
};

export default {
  drawAccessLock,
  drawViolationLaser,
  createShakeAnimation,
  getModifierColor,
  drawModifierBadge,
};
