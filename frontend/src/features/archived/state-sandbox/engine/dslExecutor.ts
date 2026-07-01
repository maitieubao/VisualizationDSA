import type { DSLCommand, StackFrame, HeapObject, Pointer, DSLAnimationFrame } from '../types/state-sandbox.types';

export function executeDSLCommand(
  command: DSLCommand,
  frameIndex: number,
  ctx: {
    stackFrames: Map<string, StackFrame>;
    heapObjects: Map<string, HeapObject>;
    pointers: Map<string, Pointer>;
    callStackDepth: number;
  }
): DSLAnimationFrame {
  let desc = '';
  const args = command.args;
  switch (command.type) {
    case 'CALL': {
      const name = args[0] || 'anonymous', params: Record<string, any> = {};
      for (let i = 1; i < args.length; i += 2) { if (args[i + 1]) params[args[i]] = args[i + 1]; }
      ctx.callStackDepth++;
      const id = `frame-${ctx.callStackDepth}`;
      ctx.stackFrames.set(id, { id, functionName: name, parameters: params, localVars: {}, depth: ctx.callStackDepth });
      desc = `Gọi hàm ${name} với ${Object.keys(params).length} tham số`;
      break;
    }
    case 'ALLOC': {
      const id = args[0], size = parseInt(args[1]) || 12, type = args[2] || 'object';
      if (!id) throw new Error('ALLOC requires nodeId');
      ctx.heapObjects.set(id, { id, type, size, data: null, references: 0 });
      desc = `Cấp phát ${type} kích thước ${size} bytes trên Heap`;
      break;
    }
    case 'PUSH': {
      const id = args[0] || `frame-${ctx.callStackDepth}`, name = args[1], val = args[2];
      const frame = ctx.stackFrames.get(id);
      if (frame && name) { frame.localVars[name] = val; desc = `Push ${name} = ${val} vào stack frame ${frame.functionName}`; }
      break;
    }
    case 'POP': {
      const id = args[0] || `frame-${ctx.callStackDepth}`;
      if (ctx.stackFrames.has(id)) {
        const frame = ctx.stackFrames.get(id)!;
        desc = `Pop stack frame ${frame.functionName}`;
        ctx.stackFrames.delete(id);
        if (ctx.callStackDepth > 0) ctx.callStackDepth--;
      }
      break;
    }
    case 'LINK': {
      const match = args.join(' ').match(/(\w+)\.?(\w+)?\s*->\s*(\w+)/);
      if (match) {
        const frameId = match[1], varName = match[2] || 'ptr', heapId = match[3];
        const ptrId = `ptr-${frameId}-${varName}`;
        ctx.pointers.set(ptrId, { id: ptrId, fromStackFrameId: frameId, toHeapObjectId: heapId, fromVarName: varName, targetId: heapId });
        const heapObj = ctx.heapObjects.get(heapId);
        if (heapObj) heapObj.references++;
        desc = `Tạo pointer từ ${frameId}.${varName} -> ${heapId}`;
      }
      break;
    }
    case 'FREE': {
      const id = args[0];
      if (id && ctx.heapObjects.has(id)) {
        ctx.heapObjects.delete(id);
        for (const [ptrId, ptr] of ctx.pointers) { if (ptr.toHeapObjectId === id) ctx.pointers.delete(ptrId); }
        desc = `Giải phóng bộ nhớ ${id}`;
      }
      break;
    }
    case 'RETURN': {
      const val = args[0]; desc = `Return ${val || 'void'}`;
      if (ctx.callStackDepth > 0) {
        const id = `frame-${ctx.callStackDepth}`;
        if (ctx.stackFrames.has(id)) { ctx.stackFrames.delete(id); ctx.callStackDepth--; }
      }
      break;
    }
    default: desc = `Unknown command: ${command.type}`;
  }
  return {
    frameIndex, command, description: desc,
    stackFrames: Array.from(ctx.stackFrames.values()),
    heapObjects: Array.from(ctx.heapObjects.values()),
    pointers: Array.from(ctx.pointers.values())
  };
}
