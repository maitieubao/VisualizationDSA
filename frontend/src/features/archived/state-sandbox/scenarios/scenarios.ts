import { CallStackEngine } from '../engine/CallStackEngine';

export function runSampleScenario(scenario: string): void {
  CallStackEngine.reset();
  switch (scenario) {
    case "function-call": {
      CallStackEngine.pushFrame("main", {}, {});
      const frame1 = CallStackEngine.pushFrame("calculate", { a: 10, b: 20 }, {});
      const heap1 = CallStackEngine.allocateHeapNode("Result", 16, { sum: 30 });
      CallStackEngine.createPointer(frame1.id, "result", heap1.id);
      break;
    }
    case "linked-list": {
      CallStackEngine.pushFrame("createList", {}, {});
      const node1 = CallStackEngine.allocateHeapNode("ListNode", 24, { value: 1 });
      CallStackEngine.allocateHeapNode("ListNode", 24, { value: 2 });
      CallStackEngine.allocateHeapNode("ListNode", 24, { value: 3 });
      CallStackEngine.createPointer("frame-1", "head", node1.id);
      break;
    }
    case "complex": {
      CallStackEngine.pushFrame("main", {}, {});
      const funcFrame = CallStackEngine.pushFrame("processData", { data: "input" }, {});
      const buffer = CallStackEngine.allocateHeapNode("Buffer", 256, null);
      const result = CallStackEngine.allocateHeapNode("Result", 32, { processed: true });
      CallStackEngine.createPointer(funcFrame.id, "buffer", buffer.id);
      CallStackEngine.createPointer(funcFrame.id, "output", result.id);
      break;
    }
  }
}
