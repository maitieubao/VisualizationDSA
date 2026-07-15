export const sampleScripts: Record<string, string> = {
  'Simple Function Call': `CALL main
PUSH frame-1 x 42
PUSH frame-1 y "hello"
ALLOC node1 16 Node
LINK frame-1.ptr -> node1
RETURN node1
POP frame-1`,

  'Linked List Creation': `CALL createList
ALLOC head 12 ListNode
PUSH frame-1 head head
ALLOC node2 12 ListNode
LINK head.next -> node2
ALLOC node3 12 ListNode
LINK node2.next -> node3
RETURN head
POP frame-1`,

  'Memory Management': `CALL allocateMemory
ALLOC buffer1 256 Buffer
ALLOC buffer2 128 Buffer
LINK frame-1.b1 -> buffer1
LINK frame-1.b2 -> buffer2
FREE buffer1
RETURN buffer2
POP frame-1`,
};

export function getSampleScripts(): Record<string, string> {
  return sampleScripts;
}
