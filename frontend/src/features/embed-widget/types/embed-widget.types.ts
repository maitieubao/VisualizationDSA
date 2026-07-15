/**
 * Type definitions for the Interactive Embed Widget (Phase 2).
 * Defines postMessage protocol schema, embed configuration, and theme types.
 */

export type EmbedTheme = 'dark' | 'light' | 'glass';

export type EmbedMessageSource = 'VISUALIZATION_DSA_WIDGET' | 'VISUALIZATION_DSA_HOST';

export type EmbedMessageAction =
  | 'WIDGET_READY'
  | 'STEP_FORWARD'
  | 'STEP_BACKWARD'
  | 'RESET'
  | 'QUIZ_COMPLETED'
  | 'HEIGHT_CHANGED';

export interface EmbedMessagePayload {
  stepIndex?: number;
  height?: number;
  quizScore?: number;
  totalQuizQuestions?: number;
}

export interface EmbedMessage {
  source: EmbedMessageSource;
  action: EmbedMessageAction;
  payload: EmbedMessagePayload | null;
}

export interface EmbedConfig {
  selectedTheme: EmbedTheme;
  showVcrControls: boolean;
  showWatchVariables: boolean;
  isInteractive: boolean;
  widgetWidth: number;
  widgetHeight: number;
  selectedAlgorithm: string;
}

export const EMBED_MIN_HEIGHT = 300;
export const EMBED_MAX_HEIGHT = 1200;
export const EMBED_RESIZE_DEBOUNCE_MS = 100;
export const EMBED_BASE_URL = 'https://visualization-dsa.edu.vn/embed';

export const EMBED_ALGORITHM_OPTIONS: { id: string; label: string }[] = [
  { id: 'bubble-sort', label: 'Bubble Sort' },
  { id: 'selection-sort', label: 'Selection Sort' },
  { id: 'insertion-sort', label: 'Insertion Sort' },
  { id: 'quicksort-recursion', label: 'QuickSort (Recursion)' },
  { id: 'merge-sort', label: 'Merge Sort' },
  { id: 'heap-sort', label: 'Heap Sort' },
  { id: 'binary-search', label: 'Binary Search' },
  { id: 'bst-insert', label: 'BST Insert' },
  { id: 'stack-operations', label: 'Stack Operations' },
  { id: 'queue-operations', label: 'Queue Operations' },
];
