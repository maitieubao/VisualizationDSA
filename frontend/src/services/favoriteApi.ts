import { api } from './apiClient';

/** F6 (FR-3.10) — Yêu thích mô phỏng: contract FavoritesController. */
export interface FavoriteDto {
  simulationKey: string;
  inputJson: string | null;
  createdAt: string;
}

export const favoriteApi = {
  getFavorites: () => api.get<FavoriteDto[]>('/favorites'),
  addFavorite: (simulationKey: string, inputJson?: string) =>
    api.post<{ message: string; favorite: FavoriteDto }>('/favorites', {
      simulationKey,
      inputJson: inputJson ?? null,
    }),
  removeFavorite: (simulationKey: string) =>
    api.delete<{ message: string }>(`/favorites/${encodeURIComponent(simulationKey)}`),
};
