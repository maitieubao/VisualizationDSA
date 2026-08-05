import { executeCodelab, type CodelabWorkerRequest, type CodelabWorkerResponse } from './codelabExecutor';

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<CodelabWorkerRequest>) => void) | null;
  postMessage(message: CodelabWorkerResponse): void;
};

workerScope.onmessage = (event: MessageEvent<CodelabWorkerRequest>) => {
  const { requestId, code, testCases, entryFunction } = event.data;
  const result = executeCodelab(code, testCases, entryFunction);
  workerScope.postMessage({ requestId, ...result });
};
