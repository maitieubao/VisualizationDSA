import type { FrameDTO } from '../../types/algorithm.types';

export interface BoxArrayColors {
  default: string;
  border: string;
  compare: string;
  found: string;
  dimmed: string;
  text: string;
  dimmedText: string;
  muted: string;
  low: string;
  high: string;
}

export const BOX_SIZE = 50;
export const GAP = 12; // Increased gap to leave space for visual brackets and labels
export const MARGIN = 40;
export const POINTER_AREA = 50;

export interface AnimatedState {
  low: number;
  lowOpacity: number;
  high: number;
  highOpacity: number;
  mid: number;
  midOpacity: number;
  opacities: number[];
  crosses: number[];
}

export function drawBoxArray(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameDTO,
  colors: BoxArrayColors,
  anim?: AnimatedState
): void {
  const n = frame.dataState.length;
  
  // Dynamic boxSize & gap calculation to fit canvas width w
  const maxTotalW = w - MARGIN * 2;
  const defaultBoxSize = 50;
  const defaultGap = 12;
  
  let boxSize = defaultBoxSize;
  let gap = defaultGap;
  
  const totalNeededWithDefault = n * boxSize + (n - 1) * gap;
  if (totalNeededWithDefault > maxTotalW) {
    boxSize = maxTotalW / (n + 0.24 * (n - 1));
    boxSize = Math.max(16, Math.min(50, boxSize));
    gap = Math.max(2, boxSize * 0.24);
  }

  // Custom spacing & centering
  const totalW = n * boxSize + (n - 1) * gap;
  const startX = Math.max(MARGIN, (w - totalW) / 2);
  
  // Baseline Y center (pushed down slightly to give top clearance)
  const y = (h - boxSize) / 2 + 15;

  // Extract variables (animated or fallback to static)
  const low = anim ? anim.low : frame.highlights.low;
  const lowOpacity = anim ? anim.lowOpacity : (frame.highlights.low != null ? 1.0 : 0.0);
  
  const high = anim ? anim.high : frame.highlights.high;
  const highOpacity = anim ? anim.highOpacity : (frame.highlights.high != null ? 1.0 : 0.0);
  
  const mid = anim ? anim.mid : frame.highlights.mid;
  const midOpacity = anim ? anim.midOpacity : (frame.highlights.mid != null ? 1.0 : 0.0);

  const target = frame.highlights.target;
  const foundIdx = frame.highlights.found;

  // 1. Draw Target Capsule on Top Center
  if (target !== undefined && target !== null) {
    ctx.save();
    const labelText = `Target: ${target}`;
    ctx.font = 'bold 13px sans-serif';
    const textWidth = ctx.measureText(labelText).width;
    const iconW = 12;
    const gapSize = 8;
    const paddingX = 14;
    const capW = paddingX * 2 + iconW + gapSize + textWidth;
    const capH = 28;
    const capX = (w - capW) / 2;
    const capY = 16;

    // Capsule background
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(capX, capY, capW, capH, 14);
    ctx.fill();
    ctx.stroke();

    // Center coordinates for target icon
    const cx = capX + paddingX + iconW / 2;
    const cy = capY + capH / 2;

    // Draw Vector Target Bullseye in Cyan (#38bdf8)
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    
    // Outer concentric circle (radius 5)
    ctx.beginPath();
    ctx.arc(cx, cy, 5.0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner dot (radius 1.5)
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Four short tick marks pointing inward from radius 7.5 to 5.0
    ctx.beginPath();
    // Top tick
    ctx.moveTo(cx, cy - 7.5);
    ctx.lineTo(cx, cy - 5.0);
    // Bottom tick
    ctx.moveTo(cx, cy + 7.5);
    ctx.lineTo(cx, cy + 5.0);
    // Left tick
    ctx.moveTo(cx - 7.5, cy);
    ctx.lineTo(cx - 5.0, cy);
    // Right tick
    ctx.moveTo(cx + 7.5, cy);
    ctx.lineTo(cx + 5.0, cy);
    ctx.stroke();

    // Capsule text
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, cx + iconW / 2 + gapSize, cy);
    ctx.restore();
  }

  // 2. Draw Active Range Bracket (Line with hooks - raised higher to y - 58 to prevent overlaps)
  // Hide active search range bracket when target has been found or search has concluded
  const isSearchFinished = foundIdx !== null || frame.explanation.includes('Không tìm thấy');
  if (!isSearchFinished && low !== null && low !== undefined && high !== null && high !== undefined && low <= high) {
    ctx.save();
    const xLow = startX + low * (boxSize + gap);
    const xHigh = startX + high * (boxSize + gap) + boxSize;
    
    // Draw horizontal bracket above the boxes
    const bracketY = y - 58;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = Math.min(lowOpacity, highOpacity);
    
    ctx.beginPath();
    // Left hook
    ctx.moveTo(xLow, bracketY + 6);
    ctx.lineTo(xLow, bracketY);
    // Main line
    ctx.lineTo(xHigh, bracketY);
    // Right hook
    ctx.lineTo(xHigh, bracketY + 6);
    ctx.stroke();

    // Range description text
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('ACTIVE SEARCH RANGE', (xLow + xHigh) / 2, bracketY - 4);
    ctx.restore();
  }

  // 3. Draw Array Elements
  for (let i = 0; i < n; i++) {
    ctx.save();
    const isDimmed = frame.highlights.dimmed.includes(i);
    const isCompare = frame.highlights.compare.includes(i);
    const isFound = foundIdx === i;
    const isMid = mid !== null && mid !== undefined && Math.round(mid) === i;

    const x = startX + i * (boxSize + gap);
    const elemOpacity = anim ? anim.opacities[i] : (isDimmed ? 0.25 : 1.0);
    const crossVal = anim ? anim.crosses[i] : (isDimmed ? 1.0 : 0.0);

    // Scale properties
    let curBoxSize = boxSize;
    let boxX = x;
    let boxY = y;
    
    if (isMid && midOpacity > 0.01) {
      const scaleFactor = 1.0 + 0.15 * midOpacity;
      curBoxSize = boxSize * scaleFactor;
      boxX = x - (curBoxSize - boxSize) / 2;
      boxY = y - (curBoxSize - boxSize) / 2;
    }

    ctx.globalAlpha = elemOpacity;

    // Set colors
    ctx.fillStyle = isFound ? '#10b981' : isMid ? 'rgba(234, 179, 8, 0.12)' : isDimmed ? colors.dimmed : 'rgba(6, 182, 212, 0.05)';
    ctx.strokeStyle = isFound ? '#10b981' : isMid ? '#eab308' : isDimmed ? 'rgba(255, 255, 255, 0.04)' : 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = isFound ? 2.5 : isMid ? 2.2 : isCompare ? 2.0 : 1;

    // Draw Box
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, curBoxSize, curBoxSize, Math.max(3, boxSize * 0.15));
    ctx.fill();
    ctx.stroke();

    // Draw Text Value (Auto-hide if too narrow)
    if (boxSize >= 15) {
      ctx.fillStyle = isFound ? '#10b981' : isMid ? '#eab308' : isDimmed ? '#64748b' : '#38bdf8';
      ctx.font = `bold ${Math.min(15, curBoxSize * 0.45)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(frame.dataState[i]), boxX + curBoxSize / 2, boxY + curBoxSize / 2);
    }

    // Draw Index Label underneath (Auto-hide or format dynamically based on boxSize)
    if (boxSize >= 20) {
      ctx.fillStyle = isDimmed ? 'rgba(100, 116, 139, 0.3)' : '#64748b';
      ctx.font = `${Math.min(10, boxSize * 0.35)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const indexLabel = boxSize >= 36 ? `A[${i}]` : `${i}`;
      ctx.fillText(indexLabel, boxX + curBoxSize / 2, boxY + curBoxSize + 6);
    }

    // Draw Cross mark over Dimmed / Eliminated elements (with anim support)
    if (crossVal > 0.01) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.2;
      const pad = Math.max(2, boxSize * 0.12);
      
      // Line 1
      ctx.beginPath();
      ctx.moveTo(boxX + pad, boxY + pad);
      ctx.lineTo(boxX + pad + (curBoxSize - 2 * pad) * crossVal, boxY + pad + (curBoxSize - 2 * pad) * crossVal);
      ctx.stroke();

      // Line 2
      ctx.beginPath();
      ctx.moveTo(boxX + curBoxSize - pad, boxY + pad);
      ctx.lineTo(boxX + curBoxSize - pad - (curBoxSize - 2 * pad) * crossVal, boxY + pad + (curBoxSize - 2 * pad) * crossVal);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 4. Draw low pointer (always at the bottom, pointing up ▲ - pushed down to ptrY + 20 to clear box index A[i])
  if (low !== null && low !== undefined && lowOpacity > 0.01) {
    ctx.save();
    ctx.globalAlpha = lowOpacity;
    const px = startX + low * (boxSize + gap) + boxSize / 2;
    const ptrY = y + boxSize + 20;

    ctx.fillStyle = '#3b82f6';
    // Arrow pointing up ▲
    ctx.beginPath();
    ctx.moveTo(px, ptrY);
    ctx.lineTo(px - 5, ptrY + 6);
    ctx.lineTo(px + 5, ptrY + 6);
    ctx.fill();
    
    ctx.font = `bold ${Math.min(9.5, boxSize * 0.35)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(boxSize >= 30 ? 'Low' : 'L', px, ptrY + 8);
    ctx.restore();
  }

  // 5. Draw high & mid pointers at the top (pointing down ▼)
  // We check if mid and high point to the same index to consolidate their labels
  const hasHigh = high !== null && high !== undefined && highOpacity > 0.01;
  const hasMid = mid !== null && mid !== undefined && midOpacity > 0.01;

  if (hasHigh || hasMid) {
    ctx.save();
    
    // Check if they are at the same/close index (collision check)
    const isSameIndex = hasHigh && hasMid && Math.abs(mid - high) < 0.1;

    if (isSameIndex) {
      // Draw consolidated pointer at the top
      const px = startX + mid * (boxSize + gap) + boxSize / 2;
      const ptrY = y - 6;
      ctx.globalAlpha = Math.max(midOpacity, highOpacity);

      // Arrow pointing down ▼
      ctx.fillStyle = '#eab308'; // Use gold for the dominant scanning pointer
      ctx.beginPath();
      ctx.moveTo(px, ptrY);
      ctx.lineTo(px - 5, ptrY - 6);
      ctx.lineTo(px + 5, ptrY - 6);
      ctx.fill();

      // Combined label
      ctx.font = `bold ${Math.min(9.5, boxSize * 0.35)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(boxSize >= 30 ? 'MID & High' : 'M&H', px, ptrY - 8);
    } else {
      // Draw High pointer (top, pointing down ▼)
      if (hasHigh) {
        ctx.save();
        ctx.globalAlpha = highOpacity;
        const px = startX + high * (boxSize + gap) + boxSize / 2;
        const ptrY = y - 6;

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(px, ptrY);
        ctx.lineTo(px - 5, ptrY - 6);
        ctx.lineTo(px + 5, ptrY - 6);
        ctx.fill();

        ctx.font = `bold ${Math.min(9.5, boxSize * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(boxSize >= 30 ? 'High' : 'H', px, ptrY - 8);
        ctx.restore();
      }

      // Draw MID pointer (top, pointing down ▼)
      if (hasMid) {
        ctx.save();
        ctx.globalAlpha = midOpacity;
        const px = startX + mid * (boxSize + gap) + boxSize / 2;
        const ptrY = y - 6;

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(px, ptrY);
        ctx.lineTo(px - 5, ptrY - 6);
        ctx.lineTo(px + 5, ptrY - 6);
        ctx.fill();

        ctx.font = `bold ${Math.min(9.5, boxSize * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(boxSize >= 30 ? 'MID' : 'M', px, ptrY - 8);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // 6. Draw comparison decision bubble above MID element (raised to ptrY - 38 so it never collides)
  if (hasMid && foundIdx !== Math.round(mid)) {
    ctx.save();
    ctx.globalAlpha = midOpacity;
    const px = startX + mid * (boxSize + gap) + boxSize / 2;
    const midTopY = y - 4;
    const targetVal = target;
    const midVal = frame.dataState[Math.round(mid)];

    if (targetVal !== undefined && targetVal !== null && midVal !== undefined) {
      let decisionText = '';
      if (midVal < targetVal) {
        decisionText = `${midVal} < ${targetVal}`;
      } else if (midVal > targetVal) {
        decisionText = `${midVal} > ${targetVal}`;
      }

      if (decisionText && boxSize >= 28) {
        ctx.font = 'bold 9.5px sans-serif';
        const bubbleW = ctx.measureText(decisionText).width + 12;
        const bubbleH = 18;
        const bubbleX = px - bubbleW / 2;
        const bubbleY = midTopY - 38;

        // Draw bubble background
        ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(decisionText, px, bubbleY + bubbleH / 2);
      }
    }
    ctx.restore();
  }

  // 7. Draw FOUND / NOT FOUND massive feedback capsules
  if (foundIdx !== null && foundIdx !== undefined) {
    ctx.save();
    const fx = startX + foundIdx * (boxSize + gap) + boxSize / 2;
    const fy = y - 42; // Positioned directly above the found element for tight visual layout

    ctx.font = 'bold 11px sans-serif';
    const bText = boxSize >= 30 ? 'FOUND' : 'OK';
    const textWidth = ctx.measureText(bText).width;
    const iconW = 12;
    const gapSize = 6;
    const paddingX = 8;
    const bW = paddingX * 2 + textWidth + gapSize + iconW;
    const bH = 20;
    const bx = fx - bW / 2;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, fy, bW, bH, 5);
    ctx.fill();
    ctx.stroke();

    // Draw text "FOUND"
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(bText, bx + paddingX, fy + bH / 2);

    // Draw solid green circle with white checkmark
    const cx = bx + paddingX + textWidth + gapSize + iconW / 2;
    const cy = fy + bH / 2;
    
    // Solid green circle (#10b981)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // White checkmark (#ffffff)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy);
    ctx.lineTo(cx - 1, cy + 2);
    ctx.lineTo(cx + 3, cy - 2);
    ctx.stroke();

    ctx.restore();
  } else if (frame.explanation.includes('Không tìm thấy')) {
    // NOT FOUND banner in the center
    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    const nfText = boxSize >= 30 ? 'NOT FOUND' : 'FAIL';
    const textWidth = ctx.measureText(nfText).width;
    const iconW = 12;
    const gapSize = 6;
    const paddingX = 10;
    const nfW = paddingX * 2 + textWidth + gapSize + iconW;
    const nfH = 24;
    const nfX = (w - nfW) / 2;
    const nfY = y - 42; // Positioned dynamically in center

    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(nfX, nfY, nfW, nfH, 6);
    ctx.fill();
    ctx.stroke();

    // Draw text "NOT FOUND"
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(nfText, nfX + paddingX, nfY + nfH / 2);

    // Draw solid red circle with white cross
    const cx = nfX + paddingX + textWidth + gapSize + iconW / 2;
    const cy = nfY + nfH / 2;

    // Solid red circle (#ef4444)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // White cross (#ffffff)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 2.5, cy - 2.5);
    ctx.lineTo(cx + 2.5, cy + 2.5);
    ctx.moveTo(cx + 2.5, cy - 2.5);
    ctx.lineTo(cx - 2.5, cy + 2.5);
    ctx.stroke();

    ctx.restore();
  }
}
