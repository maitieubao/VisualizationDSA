/**
 * Type definitions for Export & Share Pipeline
 */

export interface WorkspaceState {
  algorithmId: string;
  layoutNodes: LayoutNode[];
  currentStepIndex: number;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

export type ExportFormat = 'png-3x' | 'svg-vector';

export type ExportScaleFactor = 1 | 2 | 3 | 4;

export interface ShareLinkPayload {
  compressedState: string;
  title: string;
}

export interface ShareLinkResponse {
  shareId: string;
}

export const EXPORT_MIN_SCALE = 1;
export const EXPORT_MAX_SCALE = 4;
export const EXPORT_DEFAULT_SCALE = 3;

export const MAX_COMPRESSED_STATE_LENGTH = 20_000;

export const SHARE_BASE_URL = 'https://visualization-dsa.edu.vn';

export const EXPORT_FORMAT_OPTIONS: { id: ExportFormat; label: string; description: string }[] = [
  {
    id: 'png-3x',
    label: 'HIGH-RES PNG 3X',
    description: 'Retina Sharp 300 DPI — Ảnh sắc nét phục vụ in ấn, slide báo cáo',
  },
  {
    id: 'svg-vector',
    label: 'SVG VECTOR',
    description: 'Vector thuần khiết — Phóng to vô hạn trên Figma/Illustrator',
  },
];
