/**
 * LspGlassCracker - Hiệu ứng rạn nứt kính khi vi phạm LSP (Liskov Substitution Principle)
 *
 * Sprint 7: SOLID Principles Visualizer
 * - Tạo mạng lưới các vết rạn nứt kính từ tâm vụ nổ
 * - Animation vỡ kính tự nhiên với thuật toán ziczac ngẫu nhiên
 * - Hiệu ứng phát sáng Neon cho vết nứt
 */

export interface GlassCrackSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  depth: number; // Độ sâu của vết nứt (0 = chính, 1 = nhánh, 2 = nhánh con)
  opacity: number;
}

export interface CrackExplosion {
  centerX: number;
  centerY: number;
  radius: number;
  segments: GlassCrackSegment[];
  timestamp: number;
}

export class LspGlassCracker {
  private static readonly MAIN_BRANCHES = 8;
  private static readonly SEGMENTS_PER_BRANCH = 4;
  private static readonly JITTER_ANGLE = 0.4; // Độ biến thiên góc ziczac

  /**
   * Tạo mạng lưới các vết rạn nứt kính từ tâm vụ nổ (Generate Crack Paths)
   * Thuật toán tạo vết nứt tự nhiên với biến thiên ngẫu nhiên
   */
  public static generateCracks(
    centerX: number,
    centerY: number,
    radius: number
  ): GlassCrackSegment[] {
    const cracks: GlassCrackSegment[] = [];

    // Tạo các nhánh chính tỏa ra từ tâm
    for (let i = 0; i < this.MAIN_BRANCHES; i++) {
      // Tính góc quay radian phân bổ đều 360 độ
      const baseAngle = (i * 2 * Math.PI) / this.MAIN_BRANCHES;
      const randomOffset = (Math.random() - 0.5) * 0.2;
      const angle = baseAngle + randomOffset;

      let currentX = centerX;
      let currentY = centerY;

      const stepLength = radius / this.SEGMENTS_PER_BRANCH;

      // Tạo các đoạn nứt ziczac cho mỗi nhánh
      for (let j = 0; j < this.SEGMENTS_PER_BRANCH; j++) {
        // Tạo biến thiên ziczac ngẫu nhiên cho vết nứt chân thực
        const jitterAngle = angle + (Math.random() - 0.5) * this.JITTER_ANGLE;
        const nextX = currentX + Math.cos(jitterAngle) * stepLength;
        const nextY = currentY + Math.sin(jitterAngle) * stepLength;

        // Độ sâu và opacity giảm dần từ tâm ra
        const depth = j;
        const opacity = 1 - (j / this.SEGMENTS_PER_BRANCH) * 0.5;

        cracks.push({
          startX: currentX,
          startY: currentY,
          endX: nextX,
          endY: nextY,
          depth,
          opacity,
        });

        // Thêm nhánh phụ ngẫu nhiên (sub-branches)
        if (j > 0 && Math.random() > 0.5) {
          const subBranchAngle = jitterAngle + (Math.random() - 0.5) * 1.5;
          const subLength = stepLength * 0.6;
          const subEndX = nextX + Math.cos(subBranchAngle) * subLength;
          const subEndY = nextY + Math.sin(subBranchAngle) * subLength;

          cracks.push({
            startX: nextX,
            startY: nextY,
            endX: subEndX,
            endY: subEndY,
            depth: depth + 1,
            opacity: opacity * 0.7,
          });
        }

        currentX = nextX;
        currentY = nextY;
      }
    }

    return cracks;
  }

  /**
   * Vẽ các vết nứt lên Canvas context
   */
  public static drawCracks(
    ctx: CanvasRenderingContext2D,
    segments: GlassCrackSegment[],
    glowColor: string = '#ef4444'
  ): void {
    ctx.save();

    segments.forEach((segment) => {
      // Glow effect cho vết nứt
      ctx.shadowBlur = 15 - segment.depth * 3;
      ctx.shadowColor = glowColor;

      // Vẽ đường nứt chính
      ctx.beginPath();
      ctx.moveTo(segment.startX, segment.startY);
      ctx.lineTo(segment.endX, segment.endY);

      // Stroke style với độ dày và opacity theo depth
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = Math.max(1, 3 - segment.depth * 0.8);
      ctx.globalAlpha = segment.opacity;
      ctx.stroke();

      // Thêm highlight trắng ở giữa vết nứt
      ctx.beginPath();
      ctx.moveTo(segment.startX, segment.startY);
      ctx.lineTo(segment.endX, segment.endY);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.5, 1.5 - segment.depth * 0.4);
      ctx.globalAlpha = segment.opacity * 0.8;
      ctx.stroke();
    });

    ctx.restore();
  }

  /**
   * Tạo animation vỡ kính dần dần
   */
  public static animateCracks(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    duration: number = 500,
    onComplete?: () => void
  ): void {
    const segments = this.generateCracks(centerX, centerY, radius);
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Chỉ vẽ một phần các vết nứt theo progress
      const visibleCount = Math.floor(segments.length * progress);
      const visibleSegments = segments.slice(0, visibleCount);

      // Xóa và vẽ lại
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Vẽ nền glassmorphic
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Vẽ các vết nứt
      this.drawCracks(ctx, visibleSegments, '#ef4444');

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation hoàn tất - tiếp tục giữ vết nứt
        this.drawCracks(ctx, segments, '#ef4444');
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Kiểm tra xem một điểm có nằm trên vùng vỡ kính không
   */
  public static isPointInCrackZone(
    pointX: number,
    pointY: number,
    centerX: number,
    centerY: number,
    radius: number
  ): boolean {
    const distance = Math.hypot(pointX - centerX, pointY - centerY);
    return distance <= radius;
  }
}

export default LspGlassCracker;
