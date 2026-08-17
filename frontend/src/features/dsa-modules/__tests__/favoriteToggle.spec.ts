// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import FavoriteToggle from '../components/FavoriteToggle.vue';

const { getFavorites, addFavorite, removeFavorite } = vi.hoisted(() => ({
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

vi.mock('../../../services/favoriteApi', () => ({
  favoriteApi: { getFavorites, addFavorite, removeFavorite },
}));

describe('FavoriteToggle — nút yêu thích mô phỏng (F6/FR-3.10)', () => {
  beforeEach(() => {
    getFavorites.mockReset();
    addFavorite.mockReset();
    removeFavorite.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mount: hiển thị trạng thái đã yêu thích nếu simulationKey có trong danh sách', async () => {
    getFavorites.mockResolvedValue([{ simulationKey: 'bubble-sort', inputJson: null, createdAt: 'now' }]);
    const wrapper = mount(FavoriteToggle, {
      props: { simulationKey: 'bubble-sort' },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Đã yêu thích');
    expect(wrapper.attributes('aria-pressed')).toBe('true');
  });

  it('toggle thêm yêu thích: gọi POST với simulationKey', async () => {
    getFavorites.mockResolvedValue([]);
    addFavorite.mockResolvedValue({ message: 'ok', favorite: { simulationKey: 'bubble-sort', inputJson: null, createdAt: 'now' } });
    const wrapper = mount(FavoriteToggle, {
      props: { simulationKey: 'bubble-sort', inputJson: '{"input":"5,3,8"}' },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Yêu thích');

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(addFavorite).toHaveBeenCalledWith('bubble-sort', '{"input":"5,3,8"}');
    expect(wrapper.text()).toContain('Đã yêu thích');
  });

  it('toggle bỏ yêu thích: gọi DELETE với simulationKey', async () => {
    getFavorites.mockResolvedValue([{ simulationKey: 'dfs', inputJson: null, createdAt: 'now' }]);
    removeFavorite.mockResolvedValue({ message: 'ok' });
    const wrapper = mount(FavoriteToggle, {
      props: { simulationKey: 'dfs' },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(removeFavorite).toHaveBeenCalledWith('dfs');
    expect(wrapper.text()).toContain('Yêu thích');
  });
});
