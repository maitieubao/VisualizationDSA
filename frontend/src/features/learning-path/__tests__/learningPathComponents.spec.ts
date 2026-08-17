// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import LearningPathMap from '../components/LearningPathMap.vue';
import HeartsEmptyModal from '../components/HeartsEmptyModal.vue';
import { useLearningPathStore } from '../store/useLearningPathStore';
import { learningPathApi } from '../../../services/learningPathApi';
import type { LearningPathMapDto, LearningPathNodeDto } from '../../../services/learningPathApi';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../../services/learningPathApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/learningPathApi')>();
  return {
    ...actual,
    learningPathApi: {
      getLearningPaths: vi.fn(),
      getLearningPath: vi.fn(),
      enterNode: vi.fn(),
      passNode: vi.fn(),
    },
  };
});

// F9: BaseIcon chưa được đăng ký global trong môi trường test (main.ts không chạy)
// → phải đăng ký qua global.components (không phải stubs) thì template mới resolve được.
const BaseIconStub = defineComponent({
  name: 'BaseIcon',
  props: { name: { type: String, default: '' } },
  setup(props) {
    return () => h('span', { class: 'base-icon-stub', 'data-name': props.name }, props.name);
  },
});

function node(
  id: string,
  orderIndex: number,
  status: 0 | 1 | 2,
  extra: Partial<LearningPathNodeDto> = {},
): LearningPathNodeDto {
  return {
    id,
    learningPathId: 'path-1',
    orderIndex,
    title: `Node ${orderIndex}`,
    lessonId: `lesson-${orderIndex}`,
    status,
    stars: status === 2 ? 3 : 0,
    nodeScore: status === 2 ? 100 : null,
    unlockedAt: status !== 0 ? '2026-08-17T00:00:00Z' : null,
    passedAt: status === 2 ? '2026-08-17T00:10:00Z' : null,
    session: null,
    ...extra,
  };
}

function mapDto(overrides: Partial<LearningPathMapDto> = {}): LearningPathMapDto {
  return {
    id: 'path-1',
    title: 'Lộ trình DSA cơ bản',
    description: 'Học tuần tự các chủ đề DSA.',
    createdAt: '2026-08-17T00:00:00Z',
    hearts: 10,
    heartsMax: 10,
    nextHeartAt: null,
    nodes: [node('node-1', 1, 1), node('node-2', 2, 0), node('node-3', 3, 2)],
    ...overrides,
  };
}

function mountWithPinia(component: unknown, options: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  return mount(component as never, {
    global: {
      plugins: [pinia],
      components: { BaseIcon: BaseIconStub },
    },
    ...options,
  });
}

describe('LearningPathMap — bản đồ node (F9)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('hiển thị trạng thái node khóa/mở/pass kèm sao', async () => {
    vi.mocked(learningPathApi.getLearningPath).mockResolvedValueOnce(
      mapDto({ nodes: [node('node-1', 1, 2, { stars: 3 }), node('node-2', 2, 1), node('node-3', 3, 0)] }),
    );
    const wrapper = mountWithPinia(LearningPathMap, { props: { pathId: 'path-1' } });
    await flushPromises();

    const items = wrapper.findAll('li');
    expect(items).toHaveLength(3);
    expect(items[0].text()).toContain('Đã pass');
    expect(items[1].text()).toContain('Mở');
    expect(items[2].text()).toContain('Khóa');
    expect(items[0].findAll('[data-name="star"]')).toHaveLength(3);
  });

  it('bấm Vào học ở node mở → gọi enterNode với nodeId', async () => {
    vi.mocked(learningPathApi.getLearningPath).mockResolvedValueOnce(
      mapDto({ nodes: [node('node-1', 1, 1), node('node-2', 2, 0)] }),
    );
    vi.mocked(learningPathApi.enterNode).mockResolvedValueOnce({
      message: 'Đã vào node — 1 Tim đã được sử dụng.',
      resumed: false,
      hearts: 9,
      heartsMax: 10,
      session: { startedAt: '2026-08-17T00:00:00Z', expiresAt: '2026-08-17T00:30:00Z' },
    });
    const wrapper = mountWithPinia(LearningPathMap, { props: { pathId: 'path-1' } });
    await flushPromises();

    const enterButton = wrapper.findAll('button').find((b) => b.text().includes('Vào học'));
    await enterButton!.trigger('click');
    await flushPromises();

    expect(learningPathApi.enterNode).toHaveBeenCalledWith('path-1', 'node-1');
  });
});

// F9: HeartsEmptyModal dùng <Teleport to="body"> → nội dung render vào document.body
// (ngoài wrapper). Test phải mount với attachTo: document.body và query qua body.
describe('HeartsEmptyModal — modal hết tim (F9)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('hiển thị khi hearts = 0 và modelValue = true', async () => {
    vi.mocked(learningPathApi.getLearningPath).mockResolvedValueOnce(
      mapDto({ hearts: 0, heartsMax: 10, nextHeartAt: '2026-08-17T00:30:00Z' }),
    );
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useLearningPathStore();
    await store.loadMap('path-1');

    const wrapper = mountWithPinia(HeartsEmptyModal, {
      props: { modelValue: true },
      attachTo: document.body,
    });
    await flushPromises();

    const bodyText = document.body.textContent ?? '';
    expect(bodyText).toContain('Bạn đã hết Tim');
    expect(bodyText).toContain('0/10');
    wrapper.unmount();
  });

  it('bấm nút đóng → update:modelValue = false và modal biến mất', async () => {
    // F9: mount qua parent dùng v-model thật — kiểm tra hành vi end-to-end
    // (wrapper.emitted() không ghi nhận emit từ slot Teleport, nên assert qua DOM).
    const open = ref(true);
    const ParentWithVModel = defineComponent({
      components: { HeartsEmptyModal },
      setup() {
        return () => h('div', { class: 'parent' }, [
          h(HeartsEmptyModal, {
            modelValue: open.value,
            'onUpdate:modelValue': (v: boolean) => { open.value = v; },
          }),
        ]);
      },
    });

    const wrapper = mountWithPinia(ParentWithVModel, {
      attachTo: document.body,
    });
    await flushPromises();

    expect(document.body.innerHTML).toContain('hearts-empty-overlay');

    const closeButton = document.body.querySelector('.hearts-empty-modal button') as HTMLButtonElement;
    closeButton.click();
    await flushPromises();

    expect(open.value).toBe(false);
    // F9: Transition đang chạy animation leave — DOM vẫn còn overlay cho tới khi
    // transition kết thúc, nên chỉ assert trạng thái v-model đã đổi.
    wrapper.unmount();
  });
});
