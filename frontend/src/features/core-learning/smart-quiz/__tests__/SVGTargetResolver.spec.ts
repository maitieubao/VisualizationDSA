// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { SVGTargetResolver } from '../engine/SVGTargetResolver';

describe('SVGTargetResolver', () => {
  describe('resolveSelectedNodeId', () => {
    it('should return node id from element with data-node-id', () => {
      const element = document.createElement('rect');
      element.setAttribute('data-node-id', 'node-bar-3');
      document.body.appendChild(element);

      const event = { target: element } as unknown as MouseEvent;
      const result = SVGTargetResolver.resolveSelectedNodeId(event);
      expect(result).toBe('node-bar-3');

      document.body.removeChild(element);
    });

    it('should walk up DOM tree to find nearest interactive parent', () => {
      const parent = document.createElement('g');
      parent.setAttribute('data-node-id', 'node-bar-5');
      const child = document.createElement('rect');
      parent.appendChild(child);
      document.body.appendChild(parent);

      const event = { target: child } as unknown as MouseEvent;
      const result = SVGTargetResolver.resolveSelectedNodeId(event);
      expect(result).toBe('node-bar-5');

      document.body.removeChild(parent);
    });

    it('should return null when no interactive parent found', () => {
      const element = document.createElement('rect');
      document.body.appendChild(element);

      const event = { target: element } as unknown as MouseEvent;
      const result = SVGTargetResolver.resolveSelectedNodeId(event);
      expect(result).toBeNull();

      document.body.removeChild(element);
    });

    it('should return null when event target is null', () => {
      const event = { target: null } as unknown as MouseEvent;
      const result = SVGTargetResolver.resolveSelectedNodeId(event);
      expect(result).toBeNull();
    });
  });

  describe('evaluateAnswers', () => {
    it('should return correct when selections exactly match correct answers', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        ['node-bar-2', 'node-bar-5'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(true);
      expect(result.missingIds).toEqual([]);
      expect(result.extraIds).toEqual([]);
    });

    it('should return correct regardless of order', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        ['node-bar-5', 'node-bar-2'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should identify missing answers', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        ['node-bar-2'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.missingIds).toEqual(['node-bar-5']);
      expect(result.extraIds).toEqual([]);
    });

    it('should identify extra (wrong) answers', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        ['node-bar-2', 'node-bar-8'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.missingIds).toEqual(['node-bar-5']);
      expect(result.extraIds).toEqual(['node-bar-8']);
    });

    it('should handle completely wrong answers', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        ['node-bar-8', 'node-bar-9'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.missingIds).toEqual(['node-bar-2', 'node-bar-5']);
      expect(result.extraIds).toEqual(['node-bar-8', 'node-bar-9']);
    });

    it('should handle empty selected answers', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        [],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.missingIds).toEqual(['node-bar-2', 'node-bar-5']);
    });

    it('should handle empty correct answers', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        ['node-bar-2'],
        []
      );
      expect(result.isCorrect).toBe(false);
      expect(result.extraIds).toEqual(['node-bar-2']);
    });

    it('should handle single answer questions', () => {
      const result = SVGTargetResolver.evaluateAnswers(
        ['line-9'],
        ['line-9']
      );
      expect(result.isCorrect).toBe(true);
      expect(result.missingIds).toEqual([]);
      expect(result.extraIds).toEqual([]);
    });
  });
});
