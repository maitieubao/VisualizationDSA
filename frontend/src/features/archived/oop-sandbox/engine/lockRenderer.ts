import type { AccessModifier, LockConfig } from '../types/oop-sandbox.types';
import { getModifierColor } from './badgeRenderer';

export function createShakeAnimation(baseX: number, baseY: number, intensity: number = 4) {
  return {
    x: baseX + (Math.random() - 0.5) * intensity,
    y: baseY + (Math.random() - 0.5) * intensity,
  };
}

export function drawAccessLock(ctx: CanvasRenderingContext2D, config: LockConfig): void {
  const { x, y, size, modifier, isViolated } = config;
  const colors = getModifierColor(modifier);

  ctx.save();
  ctx.shadowBlur = isViolated ? 20 : 15;
  ctx.shadowColor = colors.primary;

  const bodyWidth = size * 0.8;
  const bodyHeight = size * 0.6;
  const bodyX = x - bodyWidth / 2;
  const bodyY = y - bodyHeight / 2 + size * 0.15;

  const gradient = ctx.createLinearGradient(bodyX, bodyY, bodyX, bodyY + bodyHeight);
  if (modifier === "PRIVATE") {
    gradient.addColorStop(0, isViolated ? "#ef4444" : "#7f1d1d");
    gradient.addColorStop(1, isViolated ? "#dc2626" : "#991b1b");
  } else if (modifier === "PROTECTED") {
    gradient.addColorStop(0, "#eab308");
    gradient.addColorStop(1, "#a16207");
  } else {
    gradient.addColorStop(0, "#22c55e");
    gradient.addColorStop(1, "#15803d");
  }

  const shakeX = isViolated ? (Math.random() - 0.5) * 4 : 0;
  const shakeY = isViolated ? (Math.random() - 0.5) * 4 : 0;

  ctx.beginPath();
  ctx.arc(x + shakeX, bodyY - size * 0.25 + shakeY, size * 0.25, Math.PI, 0);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = size * 0.1;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(bodyX + shakeX, bodyY + shakeY, bodyWidth, bodyHeight, size * 0.1);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = isViolated ? "#fecaca" : "#ffffff";
  ctx.lineWidth = isViolated ? 3 : 2;
  ctx.stroke();

  const rootStyle = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement) : null;
  const keyholeBg = rootStyle?.getPropertyValue('--color-bg-active').trim() || '#1e293b';

  ctx.beginPath();
  ctx.arc(x + shakeX, bodyY + bodyHeight * 0.35 + shakeY, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = isViolated ? "#fecaca" : keyholeBg;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - size * 0.03 + shakeX, bodyY + bodyHeight * 0.4 + shakeY);
  ctx.lineTo(x + size * 0.03 + shakeX, bodyY + bodyHeight * 0.4 + shakeY);
  ctx.lineTo(x + shakeX, bodyY + bodyHeight * 0.6 + shakeY);
  ctx.closePath();
  ctx.fillStyle = isViolated ? "#fecaca" : keyholeBg;
  ctx.fill();

  if (isViolated) {
    ctx.font = `bold ${size * 0.25}px monospace`;
    ctx.fillStyle = "#ef4444";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ef4444";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("🔒 PRIVATE!", x, bodyY - size * 0.4);
  }

  ctx.restore();
}
