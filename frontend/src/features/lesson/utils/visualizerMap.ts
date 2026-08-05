import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';
import { playgroundAlgoDemos } from '../../algo-playground/engine/playgroundAlgoDemos';
import { parseSandboxDemo } from './sandboxConfig';

/**
 * Map sandboxType → component trực quan hóa (dùng khi không có demo playground cụ thể).
 * Các sandbox dựa trên demo (sorting/searching/dsa) được xử lý qua `resolveLessonViz`
 * bằng cách nhúng AlgoPlaygroundWorkspace với demo id tương ứng.
 */
export const visualizerMap: Record<string, Component> = {
  'graph': defineAsyncComponent(() => import('../../../views/graph/GraphView.vue')),
  'oop': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'solid': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'patterns': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
  'system': defineAsyncComponent(() => import('../../../views/docs/DocsView.vue')),
};

/** Demo mặc định theo sandboxType khi sandboxConfig không chỉ định demo.
 *  Chỉ giữ fallback cho loại CÓ demo phù hợp; 'dsa' chung chung → không fallback
 *  (tránh mở demo sai chủ đề, hiển thị empty state thay vào đó). */
const DEFAULT_DEMO_BY_SANDBOX: Record<string, string> = {
  'sorting': 'bubble-sort',
  'searching': 'binary-search',
};

export interface ResolvedLessonViz {
  demoId: string | null;
  component: Component | null;
}

/** Parse sandboxConfig → demo id hợp lệ (chỉ chấp nhận demo tồn tại trong playgroundAlgoDemos). */
export function parseSandboxDemoValidated(sandboxConfig: string): string | null {
  const demo = parseSandboxDemo(sandboxConfig);
  return demo && playgroundAlgoDemos[demo] ? demo : null;
}

/**
 * Quyết định thành phần trực quan hóa cho một bài học:
 * 1. sandboxConfig.demo hợp lệ → AlgoPlaygroundWorkspace (demoId).
 * 2. Demo mặc định theo sandboxType (sorting/searching) → AlgoPlaygroundWorkspace.
 * 3. sandboxType graph/oop/solid/... → component tĩnh tương ứng.
 * 4. Không xác định → empty state (demoId null, component null) — trung thực với bài không có mô phỏng.
 */
export function resolveLessonViz(sandboxType: string, sandboxConfig: string): ResolvedLessonViz {
  const demoFromConfig = parseSandboxDemoValidated(sandboxConfig);
  if (demoFromConfig) return { demoId: demoFromConfig, component: null };

  const fallbackDemo = DEFAULT_DEMO_BY_SANDBOX[sandboxType] ?? null;
  if (fallbackDemo) return { demoId: fallbackDemo, component: null };

  const component = visualizerMap[sandboxType] ?? null;
  if (component) return { demoId: null, component };

  return { demoId: null, component: null };
}
