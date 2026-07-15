import type { AccessModifier, LaserBeam } from '../types/oop-sandbox.types';

export function getModifierColor(modifier: AccessModifier) {
  switch (modifier) {
    case "PRIVATE":
      return { primary: "#ef4444", glow: "rgba(239, 68, 68, 0.6)", bg: "rgba(239, 68, 68, 0.15)" };
    case "PROTECTED":
      return { primary: "#eab308", glow: "rgba(234, 179, 8, 0.6)", bg: "rgba(234, 179, 8, 0.15)" };
    case "PUBLIC":
      return { primary: "#22c55e", glow: "rgba(34, 197, 94, 0.6)", bg: "rgba(34, 197, 94, 0.15)" };
    default:
      return { primary: "#64748b", glow: "rgba(100, 116, 139, 0.6)", bg: "rgba(100, 116, 139, 0.15)" };
  }
}

export function drawViolationLaser(ctx: CanvasRenderingContext2D, beam: LaserBeam): void {
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = beam.color;

  ctx.beginPath();
  ctx.moveTo(beam.x1, beam.y1);
  ctx.lineTo(beam.x2, beam.y2);
  ctx.strokeStyle = beam.color;
  ctx.lineWidth = beam.width;
  ctx.globalAlpha = beam.opacity;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(beam.x1, beam.y1);
  ctx.lineTo(beam.x2, beam.y2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = beam.width * 0.5;
  ctx.globalAlpha = beam.opacity * 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(beam.x2, beam.y2, beam.width * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = beam.color;
  ctx.globalAlpha = beam.opacity * 2;
  ctx.fill();

  ctx.restore();
}

export function drawModifierBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  modifier: AccessModifier,
  width: number = 60,
  height: number = 20,
): void {
  const colors = getModifierColor(modifier);
  ctx.save();

  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, 4);
  ctx.fillStyle = colors.bg;
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.shadowBlur = 8;
  ctx.shadowColor = colors.glow;
  ctx.stroke();

  ctx.font = `bold 10px sans-serif`;
  ctx.fillStyle = colors.primary;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(modifier.toLowerCase(), x, y);

  ctx.restore();
}
