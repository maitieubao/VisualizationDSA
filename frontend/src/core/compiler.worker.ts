import { CompilerStepExecutor, toFriendlyCompileError, type CompileOptions, type PlaybackFrame } from './CompilerStepExecutor';

interface CompileWorkerRequest {
  requestId: number;
  sourceCode: string;
  initialArray: number[];
  options?: CompileOptions;
}

interface CompileWorkerResponse {
  requestId: number;
  ok: boolean;
  frames?: PlaybackFrame[];
  error?: string;
}

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<CompileWorkerRequest>) => void) | null;
  postMessage(message: CompileWorkerResponse): void;
};

workerScope.onmessage = (event: MessageEvent<CompileWorkerRequest>) => {
  const { requestId, sourceCode, initialArray, options } = event.data;
  try {
    const frames = CompilerStepExecutor.compileAlgorithm(sourceCode, initialArray, options);
    workerScope.postMessage({ requestId, ok: true, frames });
  } catch (err: unknown) {
    const message = toFriendlyCompileError(err instanceof Error ? err.message : String(err));
    workerScope.postMessage({ requestId, ok: false, error: message });
  }
};
