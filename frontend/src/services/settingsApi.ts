import { api } from './apiClient';

/** F7 (FR-6.2) — Cấu hình hệ thống: contract SettingsController. */
export interface SystemSettingDto {
  key: string;
  value: string;
}

export const settingsApi = {
  getSettings: () => api.get<SystemSettingDto[]>('/admin/settings'),
  updateSettings: (settings: SystemSettingDto[]) =>
    api.put<{ message: string; settings: SystemSettingDto[] }>('/admin/settings', settings),
};
