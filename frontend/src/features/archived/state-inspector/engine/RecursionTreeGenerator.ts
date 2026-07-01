// ============================================================
// RecursionTreeGenerator — Layered Coordinate Calculator
// Binary tree subdivision coordinate math for SVG rendering
// ============================================================

import type { RecursionNode, RecursionNodeCoordinate } from '../types/state-inspector.types';
import { TREE_DEPTH_SPACING_PX, TREE_ROOT_OFFSET_PX } from '../types/state-inspector.types';

export class RecursionTreeGenerator {
  /**
   * Calculate flat coordinate array for SVG rendering of recursion tree.
   * Uses binary subdivision to distribute child nodes evenly.
   * @param root Root node of recursion tree
   * @param canvasWidth Available horizontal space
   * @returns Flat array of node coordinates for SVG rendering
   */
  public static calculateCoordinates(
    root: RecursionNode,
    canvasWidth: number
  ): RecursionNodeCoordinate[] {
    const result: RecursionNodeCoordinate[] = [];

    const traverse = (
      node: RecursionNode,
      x: number,
      width: number,
      parentId: string | null
    ): void => {
      const y = node.depth * TREE_DEPTH_SPACING_PX + TREE_ROOT_OFFSET_PX;

      result.push({
        nodeId: node.nodeId,
        label: node.label,
        x,
        y,
        status: node.status,
        parentId,
        returnValue: node.returnValue,
      });

      if (node.children.length === 0) return;

      const subWidth = width / node.children.length;
      const startX = x - width / 2 + subWidth / 2;

      node.children.forEach((child, index) => {
        const childX = startX + index * subWidth;
        traverse(child, childX, subWidth, node.nodeId);
      });
    };

    traverse(root, canvasWidth / 2, canvasWidth / 2, null);
    return result;
  }

  /**
   * Count total nodes in a recursion tree
   */
  public static countNodes(root: RecursionNode): number {
    let count = 1;
    for (const child of root.children) {
      count += RecursionTreeGenerator.countNodes(child);
    }
    return count;
  }

  /**
   * Get maximum depth of a recursion tree
   */
  public static getMaxDepth(root: RecursionNode): number {
    if (root.children.length === 0) return root.depth;
    return Math.max(
      ...root.children.map((child) => RecursionTreeGenerator.getMaxDepth(child))
    );
  }
}
