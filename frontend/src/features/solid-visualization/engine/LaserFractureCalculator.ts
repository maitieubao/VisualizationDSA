// ============================================================
// LaserFractureCalculator — SVG Fracture Overlay Math
// Generates zigzag fracture segments along a laser path
// when LSP substitution violation is detected (after 800ms)
// ============================================================

import type {
  CoordinatePoint,
  FractureSegment,
} from '../types/solid-visualization.types';
import {
  FRACTURE_SEGMENT_COUNT_MIN,
  FRACTURE_SEGMENT_COUNT_MAX,
  FRACTURE_OFFSET_RANGE,
} from '../types/solid-visualization.types';

export class LaserFractureCalculator {
  /**
   * Generates zigzag fracture segments along the laser path from A to B.
   * Each segment is offset perpendicular to the main vector to create
   * a cracked glass effect.
   */
  public static generateFractureSegments(
    pointA: CoordinatePoint,
    pointB: CoordinatePoint,
    segmentCount?: number
  ): FractureSegment[] {
    const count =
      segmentCount ??
      this.randomInt(FRACTURE_SEGMENT_COUNT_MIN, FRACTURE_SEGMENT_COUNT_MAX);

    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    const theta = Math.atan2(dy, dx);
    const segments: FractureSegment[] = [];

    for (let i = 0; i < count; i++) {
      const t1 = i / count;
      const t2 = (i + 1) / count;

      const baseX1 = pointA.x + dx * t1;
      const baseY1 = pointA.y + dy * t1;
      const baseX2 = pointA.x + dx * t2;
      const baseY2 = pointA.y + dy * t2;

      const offset1 =
        i === 0
          ? 0
          : this.randomFloat(-FRACTURE_OFFSET_RANGE, FRACTURE_OFFSET_RANGE);
      const offset2 =
        i === count - 1
          ? 0
          : this.randomFloat(-FRACTURE_OFFSET_RANGE, FRACTURE_OFFSET_RANGE);

      segments.push({
        x1: baseX1 + offset1 * Math.sin(theta),
        y1: baseY1 + offset1 * (-Math.cos(theta)),
        x2: baseX2 + offset2 * Math.sin(theta),
        y2: baseY2 + offset2 * (-Math.cos(theta)),
      });
    }

    return segments;
  }

  /**
   * Calculates the angle (in radians) of the vector from A to B.
   */
  public static calculateAngle(
    pointA: CoordinatePoint,
    pointB: CoordinatePoint
  ): number {
    return Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
  }

  /**
   * Calculates the distance between two points.
   */
  public static calculateDistance(
    pointA: CoordinatePoint,
    pointB: CoordinatePoint
  ): number {
    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
