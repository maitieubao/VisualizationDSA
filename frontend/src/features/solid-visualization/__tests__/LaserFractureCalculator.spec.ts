import { describe, it, expect } from 'vitest';
import { LaserFractureCalculator } from '../engine/LaserFractureCalculator';
import type { CoordinatePoint } from '../types/solid-visualization.types';
import {
  FRACTURE_SEGMENT_COUNT_MIN,
  FRACTURE_SEGMENT_COUNT_MAX,
  FRACTURE_OFFSET_RANGE,
} from '../types/solid-visualization.types';

describe('LaserFractureCalculator', () => {
  const pointA: CoordinatePoint = { x: 50, y: 100 };
  const pointB: CoordinatePoint = { x: 450, y: 100 };

  describe('generateFractureSegments', () => {
    it('should generate segments between min and max count when no count specified', () => {
      const segments = LaserFractureCalculator.generateFractureSegments(pointA, pointB);
      expect(segments.length).toBeGreaterThanOrEqual(FRACTURE_SEGMENT_COUNT_MIN);
      expect(segments.length).toBeLessThanOrEqual(FRACTURE_SEGMENT_COUNT_MAX);
    });

    it('should generate exactly the specified number of segments', () => {
      const segments = LaserFractureCalculator.generateFractureSegments(pointA, pointB, 12);
      expect(segments).toHaveLength(12);
    });

    it('should generate segments starting near point A', () => {
      const segments = LaserFractureCalculator.generateFractureSegments(pointA, pointB, 10);
      const first = segments[0];
      expect(first.x1).toBeCloseTo(pointA.x, 0);
      expect(first.y1).toBeCloseTo(pointA.y, 0);
    });

    it('should generate segments ending near point B', () => {
      const segments = LaserFractureCalculator.generateFractureSegments(pointA, pointB, 10);
      const last = segments[segments.length - 1];
      expect(last.x2).toBeCloseTo(pointB.x, 0);
      expect(last.y2).toBeCloseTo(pointB.y, 0);
    });

    it('should generate segments with zigzag offset within FRACTURE_OFFSET_RANGE', () => {
      const segments = LaserFractureCalculator.generateFractureSegments(
        { x: 0, y: 0 },
        { x: 400, y: 0 },
        10
      );

      for (const seg of segments) {
        expect(Math.abs(seg.y1)).toBeLessThanOrEqual(FRACTURE_OFFSET_RANGE + 1);
        expect(Math.abs(seg.y2)).toBeLessThanOrEqual(FRACTURE_OFFSET_RANGE + 1);
      }
    });

    it('should handle vertical laser path', () => {
      const vertA: CoordinatePoint = { x: 200, y: 50 };
      const vertB: CoordinatePoint = { x: 200, y: 350 };
      const segments = LaserFractureCalculator.generateFractureSegments(vertA, vertB, 5);
      expect(segments).toHaveLength(5);
    });

    it('should handle diagonal laser path', () => {
      const diagA: CoordinatePoint = { x: 0, y: 0 };
      const diagB: CoordinatePoint = { x: 300, y: 300 };
      const segments = LaserFractureCalculator.generateFractureSegments(diagA, diagB, 8);
      expect(segments).toHaveLength(8);
    });

    it('should generate connected segments (end of segment i connects to start of segment i+1)', () => {
      const segments = LaserFractureCalculator.generateFractureSegments(
        pointA,
        pointB,
        5
      );

      for (let i = 0; i < segments.length - 1; i++) {
        const distX = Math.abs(segments[i].x2 - segments[i + 1].x1);
        const distY = Math.abs(segments[i].y2 - segments[i + 1].y1);
        expect(distX).toBeLessThan(FRACTURE_OFFSET_RANGE * 3);
        expect(distY).toBeLessThan(FRACTURE_OFFSET_RANGE * 3);
      }
    });

    it('should handle zero-length laser (same point)', () => {
      const samePoint: CoordinatePoint = { x: 100, y: 100 };
      const segments = LaserFractureCalculator.generateFractureSegments(samePoint, samePoint, 3);
      expect(segments).toHaveLength(3);
    });
  });

  describe('calculateAngle', () => {
    it('should return 0 for horizontal right direction', () => {
      const angle = LaserFractureCalculator.calculateAngle(
        { x: 0, y: 0 },
        { x: 100, y: 0 }
      );
      expect(angle).toBeCloseTo(0);
    });

    it('should return PI/2 for downward direction', () => {
      const angle = LaserFractureCalculator.calculateAngle(
        { x: 0, y: 0 },
        { x: 0, y: 100 }
      );
      expect(angle).toBeCloseTo(Math.PI / 2);
    });

    it('should return PI for horizontal left direction', () => {
      const angle = LaserFractureCalculator.calculateAngle(
        { x: 100, y: 0 },
        { x: 0, y: 0 }
      );
      expect(angle).toBeCloseTo(Math.PI);
    });

    it('should return -PI/2 for upward direction', () => {
      const angle = LaserFractureCalculator.calculateAngle(
        { x: 0, y: 100 },
        { x: 0, y: 0 }
      );
      expect(angle).toBeCloseTo(-Math.PI / 2);
    });

    it('should return PI/4 for 45-degree diagonal', () => {
      const angle = LaserFractureCalculator.calculateAngle(
        { x: 0, y: 0 },
        { x: 100, y: 100 }
      );
      expect(angle).toBeCloseTo(Math.PI / 4);
    });
  });

  describe('calculateDistance', () => {
    it('should return 0 for same point', () => {
      const dist = LaserFractureCalculator.calculateDistance(
        { x: 50, y: 50 },
        { x: 50, y: 50 }
      );
      expect(dist).toBe(0);
    });

    it('should return correct horizontal distance', () => {
      const dist = LaserFractureCalculator.calculateDistance(
        { x: 0, y: 0 },
        { x: 300, y: 0 }
      );
      expect(dist).toBe(300);
    });

    it('should return correct vertical distance', () => {
      const dist = LaserFractureCalculator.calculateDistance(
        { x: 0, y: 0 },
        { x: 0, y: 400 }
      );
      expect(dist).toBe(400);
    });

    it('should return correct diagonal distance (3-4-5 triangle)', () => {
      const dist = LaserFractureCalculator.calculateDistance(
        { x: 0, y: 0 },
        { x: 300, y: 400 }
      );
      expect(dist).toBe(500);
    });
  });

  describe('constants', () => {
    it('should have correct fracture segment count range', () => {
      expect(FRACTURE_SEGMENT_COUNT_MIN).toBe(10);
      expect(FRACTURE_SEGMENT_COUNT_MAX).toBe(15);
    });

    it('should have correct fracture offset range', () => {
      expect(FRACTURE_OFFSET_RANGE).toBe(12);
    });
  });
});
