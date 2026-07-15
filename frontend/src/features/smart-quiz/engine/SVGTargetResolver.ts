/**
 * SVG Target Resolver — resolves clicked SVG elements to data-node-id values
 * using Event Delegation from the parent <svg> element.
 *
 * Provides static methods for:
 * - Resolving which interactive node was clicked
 * - Evaluating student selections against correct answers
 */
export class SVGTargetResolver {
  /**
   * Resolves the data-node-id from a click event on an SVG element.
   * Walks up the DOM tree using closest() to find the nearest interactive parent.
   */
  public static resolveSelectedNodeId(event: MouseEvent): string | null {
    const target = event.target as SVGElement;
    if (!target) return null;

    const interactiveParent = target.closest('[data-node-id]');
    if (!interactiveParent) return null;

    return interactiveParent.getAttribute('data-node-id');
  }

  /**
   * Evaluates student-selected IDs against the correct answer set.
   * Returns detailed breakdown of missing and extra selections.
   */
  public static evaluateAnswers(
    selectedIds: string[],
    correctIds: string[]
  ): { isCorrect: boolean; missingIds: string[]; extraIds: string[] } {
    const correctSet = new Set(correctIds);
    const selectedSet = new Set(selectedIds);

    const missingIds = correctIds.filter(id => !selectedSet.has(id));
    const extraIds = selectedIds.filter(id => !correctSet.has(id));

    const isCorrect = missingIds.length === 0 && extraIds.length === 0;

    return {
      isCorrect,
      missingIds,
      extraIds,
    };
  }
}
