// @vitest-environment jsdom

// EX-029 (P3): Tách suite SignalR RT-002→011 khỏi exportP2Tests.spec.ts —
// chuyển về đúng feature spec (realtime).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSignalRStore } from '../stores/useSignalRStore';

const hoisted = vi.hoisted(() => {
  const mockStart = vi.fn(async () => {});
  const mockStop = vi.fn(async () => {});
  const mockOn = vi.fn();
  const mockOff = vi.fn();
  const mockInvoke = vi.fn(async () => {});
  const mockConnection = {
    start: mockStart,
    stop: mockStop,
    on: mockOn,
    off: mockOff,
    invoke: mockInvoke,
    state: 'Connected',
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
    onclose: vi.fn(),
  };
  return { mockStart, mockStop, mockOn, mockOff, mockInvoke, mockConnection };
});

vi.mock('@microsoft/signalr', () => {
  return {
    HubConnectionBuilder: class {
      withUrl() { return this; }
      withAutomaticReconnect() { return this; }
      configureLogging() { return this; }
      build() { return hoisted.mockConnection; }
    },
    HubConnectionState: {
      Connected: 'Connected',
      Disconnected: 'Disconnected',
    },
    LogLevel: { Warning: 0 },
  };
});

describe('Realtime SignalR — P2 Tests', () => {
  let store: ReturnType<typeof useSignalRStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useSignalRStore();
    vi.clearAllMocks();
  });

  describe('RT-002 (P2): Badge notification', () => {
    it('unreadNotificationCount should increment when badge is awarded', async () => {
      type BadgeHandler = (notification: { userId: string; username: string; badgeName: string; badgeDescription: string; awardedAt: string }) => void;
      let badgeHandler: BadgeHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'BadgeAwarded') {
          badgeHandler = handler as BadgeHandler;
        }
      });

      await store.connectNotifications('test-token');

      expect(store.unreadNotificationCount).toBe(0);

      if (badgeHandler) {
        (badgeHandler as BadgeHandler)({
          userId: '1',
          username: 'testuser',
          badgeName: 'First Quiz',
          badgeDescription: 'Completed first quiz',
          awardedAt: new Date().toISOString(),
        });
      }

      expect(store.unreadNotificationCount).toBe(1);
    });

    it('unreadNotificationCount should increment for multiple badges', async () => {
      type BadgeHandler = (notification: { userId: string; username: string; badgeName: string; badgeDescription: string; awardedAt: string }) => void;
      let badgeHandler: BadgeHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'BadgeAwarded') {
          badgeHandler = handler as BadgeHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (badgeHandler) {
        (badgeHandler as BadgeHandler)({ userId: '1', username: 'u1', badgeName: 'Badge1', badgeDescription: 'desc1', awardedAt: new Date().toISOString() });
        (badgeHandler as BadgeHandler)({ userId: '2', username: 'u2', badgeName: 'Badge2', badgeDescription: 'desc2', awardedAt: new Date().toISOString() });
        (badgeHandler as BadgeHandler)({ userId: '3', username: 'u3', badgeName: 'Badge3', badgeDescription: 'desc3', awardedAt: new Date().toISOString() });
      }

      expect(store.unreadNotificationCount).toBe(3);
    });

    it('badgeNotifications array should contain received notifications', async () => {
      type BadgeHandler = (notification: { userId: string; username: string; badgeName: string; badgeDescription: string; awardedAt: string }) => void;
      let badgeHandler: BadgeHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'BadgeAwarded') {
          badgeHandler = handler as BadgeHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (badgeHandler) {
        (badgeHandler as BadgeHandler)({
          userId: '1',
          username: 'testuser',
          badgeName: 'Master Coder',
          badgeDescription: 'Solved 100 problems',
          awardedAt: new Date().toISOString(),
        });
      }

      expect(store.badgeNotifications.length).toBe(1);
      expect(store.badgeNotifications[0].badgeName).toBe('Master Coder');
    });
  });

  describe('RT-003 (P2): Level up', () => {
    it('LevelUp event should increment unreadNotificationCount', async () => {
      type LevelUpHandler = (notification: { userId: string; username: string; oldLevel: number; newLevel: number; totalXP: number }) => void;
      let levelUpHandler: LevelUpHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'LevelUp') {
          levelUpHandler = handler as LevelUpHandler;
        }
      });

      await store.connectNotifications('test-token');

      expect(store.unreadNotificationCount).toBe(0);

      if (levelUpHandler) {
        (levelUpHandler as LevelUpHandler)({
          userId: '1',
          username: 'testuser',
          oldLevel: 4,
          newLevel: 5,
          totalXP: 5000,
        });
      }

      expect(store.unreadNotificationCount).toBe(1);
    });

    it('LevelUp event should add to levelUpNotifications array', async () => {
      type LevelUpHandler = (notification: { userId: string; username: string; oldLevel: number; newLevel: number; totalXP: number }) => void;
      let levelUpHandler: LevelUpHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'LevelUp') {
          levelUpHandler = handler as LevelUpHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (levelUpHandler) {
        (levelUpHandler as LevelUpHandler)({
          userId: '1',
          username: 'testuser',
          oldLevel: 9,
          newLevel: 10,
          totalXP: 10000,
        });
      }

      expect(store.levelUpNotifications.length).toBe(1);
      expect(store.levelUpNotifications[0].newLevel).toBe(10);
      expect(store.levelUpNotifications[0].oldLevel).toBe(9);
    });

    it('markNotificationsRead should reset unreadNotificationCount after LevelUp', async () => {
      type LevelUpHandler = (notification: { userId: string; username: string; oldLevel: number; newLevel: number; totalXP: number }) => void;
      let levelUpHandler: LevelUpHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'LevelUp') {
          levelUpHandler = handler as LevelUpHandler;
        }
      });

      await store.connectNotifications('test-token');

      if (levelUpHandler) {
        (levelUpHandler as LevelUpHandler)({ userId: '1', username: 'u', oldLevel: 1, newLevel: 2, totalXP: 100 });
      }

      expect(store.unreadNotificationCount).toBe(1);

      store.markNotificationsRead();
      expect(store.unreadNotificationCount).toBe(0);
    });
  });

  describe('RT-007 (P2): Leave room', () => {
    it('leaveRoom should invoke LeaveRoom on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.leaveRoom('ROOM-XYZ');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('LeaveRoom', 'ROOM-XYZ');
    });

    it('leaveRoom should clear currentRoom state', async () => {
      type RoomHandler = (room: { roomCode: string; quizTitle: string; quizId: string; hostUsername: string; participants: unknown[]; status: string; currentQuestionIndex: number; totalQuestions: number }) => void;
      let roomHandler: RoomHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'RoomCreated') {
          roomHandler = handler as RoomHandler;
        }
      });

      await store.connectQuizRoom('test-token');

      if (roomHandler) {
        (roomHandler as RoomHandler)({ roomCode: 'R1', quizTitle: 'Quiz', quizId: 'q1', hostUsername: 'host', participants: [], status: 'Waiting', currentQuestionIndex: 0, totalQuestions: 10 });
      }

      expect(store.currentRoom).not.toBeNull();

      await store.leaveRoom('R1');

      expect(store.currentRoom).toBeNull();
    });

    it('leaveRoom should do nothing if no connection', async () => {
      await store.leaveRoom('ROOM-XYZ');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('RT-008 (P2): Start quiz', () => {
    it('startQuiz should invoke StartQuiz on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.startQuiz('ROOM-ABC');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('StartQuiz', 'ROOM-ABC');
    });

    it('startQuiz should do nothing if no connection', async () => {
      await store.startQuiz('ROOM-ABC');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('startQuiz should set errorMessage on failure', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => { throw new Error('Quiz already started'); });

      await store.connectQuizRoom('test-token');
      await store.startQuiz('ROOM-ABC');

      expect(store.errorMessage).toBe('Quiz already started');
    });
  });

  describe('RT-009 (P2): Send answer', () => {
    it('submitAnswer should invoke SubmitAnswer with correct params', async () => {
      await store.connectQuizRoom('test-token');
      await store.submitAnswer('ROOM-1', 3, 2);

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('SubmitAnswer', 'ROOM-1', 3, 2);
    });

    it('submitAnswer should do nothing if no connection', async () => {
      await store.submitAnswer('ROOM-1', 0, 1);

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('submitAnswer should set errorMessage on failure', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => { throw new Error('Time expired'); });

      await store.connectQuizRoom('test-token');
      await store.submitAnswer('ROOM-1', 0, 1);

      expect(store.errorMessage).toBe('Time expired');
    });
  });

  describe('RT-010 (P2): Next question', () => {
    it('nextQuestion should invoke NextQuestion on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.nextQuestion('ROOM-2');

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('NextQuestion', 'ROOM-2');
    });

    it('nextQuestion should do nothing if no connection', async () => {
      await store.nextQuestion('ROOM-2');

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('nextQuestion should set errorMessage on failure', async () => {
      hoisted.mockInvoke.mockImplementationOnce(async () => { throw new Error('No more questions'); });

      await store.connectQuizRoom('test-token');
      await store.nextQuestion('ROOM-2');

      expect(store.errorMessage).toBe('No more questions');
    });
  });

  describe('RT-011 (P2): List rooms', () => {
    it('fetchActiveRooms should invoke GetActiveRooms on the connection', async () => {
      await store.connectQuizRoom('test-token');
      await store.fetchActiveRooms();

      expect(hoisted.mockInvoke).toHaveBeenCalledWith('GetActiveRooms');
    });

    it('fetchActiveRooms should do nothing if no connection', async () => {
      await store.fetchActiveRooms();

      expect(hoisted.mockInvoke).not.toHaveBeenCalled();
    });

    it('activeRooms should update when ActiveRooms event fires', async () => {
      type RoomsHandler = (rooms: { roomCode: string; quizTitle: string; quizId: string; hostUsername: string; participants: unknown[]; status: string; currentQuestionIndex: number; totalQuestions: number }[]) => void;
      let roomsHandler: RoomsHandler | null = null;

      hoisted.mockOn.mockImplementation((eventName: string, handler: (...args: unknown[]) => void) => {
        if (eventName === 'ActiveRooms') {
          roomsHandler = handler as RoomsHandler;
        }
      });

      await store.connectQuizRoom('test-token');

      if (roomsHandler) {
        (roomsHandler as RoomsHandler)([
          { roomCode: 'R1', quizTitle: 'Quiz 1', quizId: 'q1', hostUsername: 'host1', participants: [], status: 'Waiting', currentQuestionIndex: 0, totalQuestions: 10 },
          { roomCode: 'R2', quizTitle: 'Quiz 2', quizId: 'q2', hostUsername: 'host2', participants: [], status: 'InProgress', currentQuestionIndex: 3, totalQuestions: 15 },
        ]);
      }

      expect(store.activeRooms.length).toBe(2);
      expect(store.activeRooms[0].roomCode).toBe('R1');
      expect(store.activeRooms[1].roomCode).toBe('R2');
    });
  });
});
