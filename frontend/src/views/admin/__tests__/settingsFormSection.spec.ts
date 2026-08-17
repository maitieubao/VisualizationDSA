// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import SettingsFormSection from '../components/SettingsFormSection.vue';

const { getSettings, updateSettings } = vi.hoisted(() => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
}));

vi.mock('../../../services/settingsApi', () => ({
  settingsApi: { getSettings, updateSettings },
}));

describe('SettingsFormSection — cấu hình hệ thống (F7/FR-6.2)', () => {
  beforeEach(() => {
    getSettings.mockReset();
    updateSettings.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('render danh sách settings từ API', async () => {
    getSettings.mockResolvedValue([
      { key: 'AllowRegistration', value: 'true', description: 'Cho phép đăng ký' },
      { key: 'MaintenanceMode', value: 'false', description: 'Bảo trì' },
    ]);
    const wrapper = mount(SettingsFormSection, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const inputs = wrapper.findAll('input[type="text"]');
    expect(inputs.length).toBe(2);
    expect((inputs[0].element as HTMLInputElement).value).toBe('true');
    expect((inputs[1].element as HTMLInputElement).value).toBe('false');
    expect(wrapper.text()).toContain('AllowRegistration');
    expect(wrapper.text()).toContain('MaintenanceMode');
  });

  it('sửa giá trị rồi bấm Lưu → gọi updateSettings với mảng key/value', async () => {
    getSettings.mockResolvedValue([{ key: 'Theme', value: 'light' }]);
    updateSettings.mockResolvedValue({ message: 'ok', settings: [{ key: 'Theme', value: 'dark' }] });
    const wrapper = mount(SettingsFormSection, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const input = wrapper.find('input[type="text"]');
    await input.setValue('dark');

    const saveButton = wrapper.findAll('button').find((b) => b.text().includes('Lưu cấu hình'));
    await saveButton!.trigger('click');
    await flushPromises();

    expect(updateSettings).toHaveBeenCalledWith([{ key: 'Theme', value: 'dark' }]);
    expect(wrapper.text()).toContain('Đã lưu cấu hình thành công');
  });
});
