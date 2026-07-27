import type { FrameDTO } from '../types/animation.types';

export class BubbleSortRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  
  // Neon Colors
  private COLOR_NORMAL = 'hsl(210, 70%, 55%)';
  private COLOR_COMPARE = 'hsl(45, 100%, 60%)';
  private COLOR_SWAP = 'hsl(330, 100%, 62%)';
  private COLOR_SORTED = 'hsl(150, 80%, 50%)';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Double buffering
    this.offscreenCanvas = document.createElement('canvas');
    const offCtx = this.offscreenCanvas.getContext('2d');
    if (!offCtx) throw new Error('Could not get offscreen 2D context');
    this.offscreenCtx = offCtx;
  }

  public resize(cssWidth: number, cssHeight: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.width = cssWidth;
    this.height = cssHeight;
    
    this.canvas.width = cssWidth * dpr;
    this.canvas.height = cssHeight * dpr;
    this.offscreenCanvas.width = cssWidth * dpr;
    this.offscreenCanvas.height = cssHeight * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.offscreenCtx.scale(dpr, dpr);
  }

  public render(frame: FrameDTO, progress: number = 1.0): void {
    const ctx = this.offscreenCtx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    if (!frame || !frame.dataState) return;
    
    const data = frame.dataState;
    const maxVal = Math.max(...data, 1);
    
    const padding = 40;
    const availableWidth = this.width - padding * 2;
    const barWidth = Math.min(40, availableWidth / data.length - 10);
    const spacing = (availableWidth - data.length * barWidth) / (data.length - 1 || 1);
    
    // Y variables
    const groundY = this.height - padding;
    const maxHeight = this.height - padding * 2;
    
    // Parabolic swap config
    const swapJumpHeight = 60;
    
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < data.length; i++) {
      const val = data[i];
      let color = this.COLOR_NORMAL;
      let scale = 1.0;
      let x = padding + i * (barWidth + spacing);
      let y = groundY;
      
      const isCompare = frame.highlights?.compare?.includes(i);
      const isSwap = frame.highlights?.swap?.includes(i);
      const isSorted = frame.highlights?.sorted?.includes(i);
      
      if (isSorted) {
        color = this.COLOR_SORTED;
      } else if (isSwap) {
        color = this.COLOR_SWAP;
        // Parabolic Interpolation
        if (progress < 1.0) {
          // Determine direction: if we are swapping with something to our right or left
          // Actually, BubbleSort swaps i and i+1
          // We can find the other swap index
          const otherIdx = frame.highlights.swap.find(idx => idx !== i) ?? i;
          const targetX = padding + otherIdx * (barWidth + spacing);
          // Interpolate X
          // If this is the larger element going right, targetX is > x
          // But wait, the FrameDTO state ALREADY has the elements swapped!
          // So if progress < 1.0, we need to animate FROM the previous position TO this position.
          // That means at progress=0, it should be at targetX. At progress=1, it is at x.
          x = targetX + (x - targetX) * progress;
          // Interpolate Y (Parabola)
          y = groundY - 4 * swapJumpHeight * progress * (1 - progress);
        }
      } else if (isCompare) {
        color = this.COLOR_COMPARE;
        scale = 1.03;
      }
      
      const barH = (val / maxVal) * maxHeight;
      
      // Draw Glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      
      ctx.fillStyle = color;
      // Apply scale from bottom center
      ctx.save();
      ctx.translate(x + barWidth / 2, y);
      ctx.scale(scale, scale);
      
      // Draw Bar
      // Use rounded rect if supported
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2, -barH, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillRect(-barWidth / 2, -barH, barWidth, barH);
      }
      
      // Draw text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(val.toString(), 0, -barH - 8);
      
      ctx.restore();
    }
    
    // Blit to main canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.width, this.height);
  }
}
