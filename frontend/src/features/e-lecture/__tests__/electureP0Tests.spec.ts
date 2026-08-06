import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '../store/useNotificationStore';
import { useLectureStore } from '../store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { NotificationDto } from '../services/notificationApi';
import type { LectureScript } from '../types/lecture.types';
import type { AlgorithmResult } from '../../animation-engine/types/animation.types';

const mockGetNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

vi.mock('../services/notificationApi', () => ({
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
  markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
  markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
}));

vi.mock('../../auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    accessToken: 'mock-token',
  }),
}));

function createMockNotifications(): NotificationDto[] {
  return [
    { id: 'n1', content: 'Chào mừng bạn!', isRead: false, linkUrl: '/welcome', createdAt: '2026-08-01T10:00:00Z' },
    { id: 'n2', content: 'Bài mới đã có', isRead: false, linkUrl: '/courses', createdAt: '2026-08-02T10:00:00Z' },
    { id: 'n3', content: 'Đã đọc rồi', isRead: true, linkUrl: '', createdAt: '2026-08-03T10:00:00Z' },
  ];
}

function createMockLecture(): LectureScript {
  return {
    lectureId: 'lec-001',
    algorithmId: 'bubble-sort',
    title: 'Bubble Sort Lecture',
    slides: [
      { slideId: 1, type: 'theory', content: '<h2>Slide 1: Giới thiệu</h2><p>Nội dung lý thuyết</p>', action: { command: 'RESET_CANVAS', targetFrame: 0 } },
      { slideId: 2, type: 'guided-animation', content: '<h2>Slide 2: Minh họa</h2><p>Bắt đầu chạy animation</p>', action: { command: 'PLAY_UNTIL', targetFrame: 3 } },
      { slideId: 3, type: 'interactive-check', content: '<h2>Slide 3: Kiểm tra</h2><p>Interactive check</p>', action: { command: 'PAUSE', targetFrame: 3 } },
      { slideId: 4, type: 'theory', content: '<h2>Slide 4: Kết luận</h2><p>Tổng kết</p>', action: { command: 'PAUSE', targetFrame: 3 } },
    ],
  };
}

function createMockAnimResult(): AlgorithmResult {
  return {
    algorithmId: 'bubble-sort',
    pseudoCode: ['line1', 'line2'],
    frames: Array.from({ length: 10 }, (_, i) => ({
      stepId: i + 1,
      activeLine: 0,
      explanation: `Step ${i + 1}`,
      dataState: [5, 3, 8],
      highlights: { compare: [], swap: [], sorted: [] },
    })),
  };
}

describe('EL-001 (P0): NotificationBell — Badge số chưa đọc', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('unreadCount trả về đúng số notification chưa đọc', () => {
    const store = useNotificationStore();
    store.notifications = createMockNotifications();

    expect(store.unreadCount).toBe(2);
  });

  it('hasUnread = true khi có notification chưa đọc', () => {
    const store = useNotificationStore();
    store.notifications = createMockNotifications();

    expect(store.hasUnread).toBe(true);
  });

  it('unreadCount = 0 khi tất cả đã đọc', () => {
    const store = useNotificationStore();
    store.notifications = [
      { id: 'n1', content: 'Đã đọc', isRead: true, linkUrl: '', createdAt: '2026-08-01T10:00:00Z' },
    ];

    expect(store.unreadCount).toBe(0);
    expect(store.hasUnread).toBe(false);
  });
});

describe('EL-002 (P0): NotificationBell — Mở dropdown', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('toggleDropdown mở dropdown và load notifications', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());

    const store = useNotificationStore();
    store.notifications = [];

    await store.loadNotifications();
    expect(store.notifications.length).toBe(3);
    expect(mockGetNotifications).toHaveBeenCalledWith('mock-token');
  });
});

describe('EL-003 (P0): NotificationBell — Mark all read', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('readAll đánh dấu tất cả đã đọc', async () => {
    mockMarkAllAsRead.mockResolvedValue(undefined);

    const store = useNotificationStore();
    store.notifications = createMockNotifications();

    expect(store.unreadCount).toBe(2);

    await store.readAll();

    expect(store.unreadCount).toBe(0);
    expect(store.notifications.every(n => n.isRead)).toBe(true);
    expect(mockMarkAllAsRead).toHaveBeenCalledWith('mock-token');
  });

  it('readNotification đánh dấu 1 notification đã đọc', async () => {
    mockMarkAsRead.mockResolvedValue(undefined);

    const store = useNotificationStore();
    store.notifications = createMockNotifications();

    await store.readNotification('n1');

    const n1 = store.notifications.find(n => n.id === 'n1');
    expect(n1?.isRead).toBe(true);
    expect(store.unreadCount).toBe(1);
    expect(mockMarkAsRead).toHaveBeenCalledWith('n1', 'mock-token');
  });
});

describe('EL-006 (P0): Lecture navigation — next/prev/goToSlide', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nextSlide chuyển slide tiếp theo', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.currentSlideIndex).toBe(0);

    const promise = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await promise;

    expect(store.currentSlideIndex).toBe(1);
  });

  it('prevSlide quay lại slide trước', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    const p1 = store.nextSlide();
    vi.advanceTimersByTime(10000);
    await p1;

    expect(store.currentSlideIndex).toBe(1);

    await store.prevSlide();
    expect(store.currentSlideIndex).toBe(0);
  });

  it('goToSlide nhảy đến slide cụ thể', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    await store.goToSlide(2);
    expect(store.currentSlideIndex).toBe(2);
    expect(store.activeSlide?.slideId).toBe(3);
  });

  it('goToSlide từ chối index ngoài phạm vi', async () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    await store.goToSlide(-1);
    expect(store.currentSlideIndex).toBe(0);

    await store.goToSlide(100);
    expect(store.currentSlideIndex).toBe(0);
  });
});

describe('EL-008 (P0): Slide content — HTML + badge type', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('activeSlide trả về nội dung HTML đúng', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.activeSlide?.content).toContain('<h2>Slide 1: Giới thiệu</h2>');
  });

  it('slide type hiển thị đúng badge', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.activeSlide?.type).toBe('theory');
  });

  it('slideProgress hiển thị đúng format', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.slideProgress).toBe('1 / 4');
  });
});

describe('EL-012 (P0): Thoát — exitLecture', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exitLecture reset state và unlock interaction', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    expect(store.isActive).toBe(true);
    expect(animStore.interactionLocked).toBe(true);

    store.exitLecture();

    expect(store.isActive).toBe(false);
    expect(store.currentLecture).toBeNull();
    expect(store.currentSlideIndex).toBe(0);
    expect(animStore.interactionLocked).toBe(false);
  });

  it('exitLecture dừng waiting animation', () => {
    const store = useLectureStore();
    const animStore = useAnimationStore();
    animStore.loadResult(createMockAnimResult());
    store.startLecture(createMockLecture());

    store.isWaitingForAnimation = true;
    store.exitLecture();

    expect(store.isWaitingForAnimation).toBe(false);
  });
});
