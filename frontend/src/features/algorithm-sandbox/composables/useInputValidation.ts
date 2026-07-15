import { ref } from "vue";
import { CustomInputParser } from "../engine/CustomInputParser";

export function useInputValidation() {
  const arrayInputText = ref<string>("45, 12, 85, 32, 9, 60");
  const parsedArray = ref<number[]>([]);
  const arrayError = ref<string | null>(null);

  const graphInputText = ref<string>("A-B:10, B-C:20, A-C:50");
  const parsedGraphNodes = ref<Array<{ id: string }>>([]);
  const parsedGraphEdges = ref<
    Array<{ sourceId: string; targetId: string; weight: number }>
  >([]);
  const graphError = ref<string | null>(null);

  const validateArray = () => {
    try {
      arrayError.value = null;
      const parsed = CustomInputParser.parseNumberArray(
        arrayInputText.value
      );
      if (parsed.length > 15) {
        throw new Error("Mảng quá dài! Giới hạn tối đa là 15 phần tử.");
      }
      parsedArray.value = parsed;
    } catch (err: unknown) {
      arrayError.value = err instanceof Error ? err.message : String(err);
      parsedArray.value = [];
    }
  };

  const validateGraph = () => {
    try {
      graphError.value = null;
      const graph = CustomInputParser.parseAdjacencyList(graphInputText.value);
      parsedGraphNodes.value = graph.nodes;
      parsedGraphEdges.value = graph.edges;
    } catch (err: unknown) {
      graphError.value = err instanceof Error ? err.message : String(err);
      parsedGraphNodes.value = [];
      parsedGraphEdges.value = [];
    }
  };

  return {
    arrayInputText,
    parsedArray,
    arrayError,
    graphInputText,
    parsedGraphNodes,
    parsedGraphEdges,
    graphError,
    validateArray,
    validateGraph,
  };
}
