import type { useSortingAnimation } from '../composables/useSortingAnimation';

export type SortingAnimationInstance = ReturnType<typeof useSortingAnimation>;

// SV-001: holder để test ép useSharedSortingAnimation trả về đúng instance gắn pinia hiện tại
// (không phụ thuộc singleton _sharedInstance module-scope của composable — hết order-coupling).
export const sortingSharedOverride: { instance: SortingAnimationInstance | null } = {
  instance: null,
};
