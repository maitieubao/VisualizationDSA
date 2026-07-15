import type { PlaybackFrame } from '../types/timeline-playback.types';

export const demoBubbleSortFrames: PlaybackFrame[] = [
  {
    stepIndex: 0,
    canvasStateSnapshot: { array: [64, 34, 25, 12, 22, 11, 90], highlights: [{ index: 0, color: '#06B6D4' }] },
    lineNumber: 1,
    description: 'Khởi tạo mảng [64, 34, 25, 12, 22, 11, 90]',
  },
  {
    stepIndex: 1,
    canvasStateSnapshot: { array: [64, 34, 25, 12, 22, 11, 90], highlights: [{ index: 0, color: '#F59E0B' }, { index: 1, color: '#F59E0B' }] },
    lineNumber: 3,
    description: 'So sánh arr[0]=64 với arr[1]=34',
  },
  {
    stepIndex: 2,
    canvasStateSnapshot: { array: [34, 64, 25, 12, 22, 11, 90], highlights: [{ index: 0, color: '#10B981' }, { index: 1, color: '#10B981' }] },
    lineNumber: 4,
    description: 'Hoán vị 64 ↔ 34',
  },
  {
    stepIndex: 3,
    canvasStateSnapshot: { array: [34, 64, 25, 12, 22, 11, 90], highlights: [{ index: 1, color: '#F59E0B' }, { index: 2, color: '#F59E0B' }] },
    lineNumber: 3,
    description: 'So sánh arr[1]=64 với arr[2]=25',
  },
  {
    stepIndex: 4,
    canvasStateSnapshot: { array: [34, 25, 64, 12, 22, 11, 90], highlights: [{ index: 1, color: '#10B981' }, { index: 2, color: '#10B981' }] },
    lineNumber: 4,
    description: 'Hoán vị 64 ↔ 25',
  },
  {
    stepIndex: 5,
    canvasStateSnapshot: { array: [34, 25, 64, 12, 22, 11, 90], highlights: [{ index: 2, color: '#F59E0B' }, { index: 3, color: '#F59E0B' }] },
    lineNumber: 3,
    description: 'So sánh arr[2]=64 với arr[3]=12',
  },
  {
    stepIndex: 6,
    canvasStateSnapshot: { array: [34, 25, 12, 64, 22, 11, 90], highlights: [{ index: 2, color: '#10B981' }, { index: 3, color: '#10B981' }] },
    lineNumber: 4,
    description: 'Hoán vị 64 ↔ 12',
  },
  {
    stepIndex: 7,
    canvasStateSnapshot: { array: [34, 25, 12, 64, 22, 11, 90], highlights: [{ index: 3, color: '#F59E0B' }, { index: 4, color: '#F59E0B' }] },
    lineNumber: 3,
    description: 'So sánh arr[3]=64 với arr[4]=22',
  },
  {
    stepIndex: 8,
    canvasStateSnapshot: { array: [34, 25, 12, 22, 64, 11, 90], highlights: [{ index: 3, color: '#10B981' }, { index: 4, color: '#10B981' }] },
    lineNumber: 4,
    description: 'Hoán vị 64 ↔ 22',
  },
  {
    stepIndex: 9,
    canvasStateSnapshot: { array: [34, 25, 12, 22, 64, 11, 90], highlights: [{ index: 4, color: '#F59E0B' }, { index: 5, color: '#F59E0B' }] },
    lineNumber: 3,
    description: 'So sánh arr[4]=64 với arr[5]=11',
  },
  {
    stepIndex: 10,
    canvasStateSnapshot: { array: [34, 25, 12, 22, 11, 64, 90], highlights: [{ index: 4, color: '#10B981' }, { index: 5, color: '#10B981' }] },
    lineNumber: 4,
    description: 'Hoán vị 64 ↔ 11',
  },
  {
    stepIndex: 11,
    canvasStateSnapshot: { array: [34, 25, 12, 22, 11, 64, 90], highlights: [{ index: 5, color: '#F59E0B' }, { index: 6, color: '#F59E0B' }] },
    lineNumber: 3,
    description: 'So sánh arr[5]=64 với arr[6]=90 — không hoán vị, kết thúc vòng lặp 1',
  },
];
