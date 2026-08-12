import { executeCodelab, type CodelabWorkerRequest, type CodelabWorkerResponse } from './codelabExecutor';

// LM-004/CV-103: SANDOX — code sinh viên chạy trong worker KHÔNG được phép truy cập mạng.
// Che (shadow = undefined) toàn bộ kênh ra ngoài trước khi biên dịch code của user:
// gọi `fetch`/`XMLHttpRequest`/`importScripts`/`WebSocket` sẽ văng TypeError → testcase fail
// an toàn thay vì gửi request thật.
const sandboxGlobal = self as unknown as Record<string, unknown>;
sandboxGlobal['fetch'] = undefined;
sandboxGlobal['XMLHttpRequest'] = undefined;
sandboxGlobal['importScripts'] = undefined;
sandboxGlobal['WebSocket'] = undefined;

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<CodelabWorkerRequest>) => void) | null;
  postMessage(message: CodelabWorkerResponse): void;
};

workerScope.onmessage = (event: MessageEvent<CodelabWorkerRequest>) => {
  const { requestId, code, testCases, entryFunction } = event.data;
  const result = executeCodelab(code, testCases, entryFunction);
  workerScope.postMessage({ requestId, ...result });
};
