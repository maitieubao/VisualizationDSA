import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSignalRStore } from '../stores/useSignalRStore'
import type {
  LeaderboardUpdate,
  BadgeNotification,
  LevelUpNotification,
  QuizRoomDto,
  QuizQuestionBroadcast,
  QuizAnswerResult,
  QuizRoomResults,
  QuizRoomParticipant
} from '../types/signalr.types'

// Mock @microsoft/signalr
const mockStart = vi.fn().mockResolvedValue(undefined)
const mockStop = vi.fn().mockResolvedValue(undefined)
const mockInvoke = vi.fn().mockResolvedValue(undefined)
const mockOn = vi.fn()
const mockOnReconnecting = vi.fn()
const mockOnReconnected = vi.fn()
const mockOnClose = vi.fn()

const mockConnection = {
  start: mockStart,
  stop: mockStop,
  invoke: mockInvoke,
  on: mockOn,
  onreconnecting: mockOnReconnecting,
  onreconnected: mockOnReconnected,
  onclose: mockOnClose,
  state: 'Connected'
}

vi.mock('@microsoft/signalr', () => {
  class MockBuilder {
    withUrl() { return this }
    withAutomaticReconnect() { return this }
    configureLogging() { return this }
    build() { return mockConnection }
  }
  return {
    HubConnectionBuilder: MockBuilder,
    HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
    LogLevel: { Warning: 3 }
  }
})

describe('useSignalRStore', () => {
  let store: ReturnType<typeof useSignalRStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSignalRStore()
    vi.clearAllMocks()
    mockConnection.state = 'Connected'
  })

  describe('Initial State', () => {
    it('should have disconnected states', () => {
      expect(store.leaderboardState).toBe('disconnected')
      expect(store.notificationState).toBe('disconnected')
      expect(store.quizRoomState).toBe('disconnected')
    })

    it('should have empty data arrays', () => {
      expect(store.leaderboardUpdates).toEqual([])
      expect(store.badgeNotifications).toEqual([])
      expect(store.levelUpNotifications).toEqual([])
      expect(store.answerResults).toEqual([])
      expect(store.activeRooms).toEqual([])
    })

    it('should have null room state', () => {
      expect(store.currentRoom).toBeNull()
      expect(store.currentQuestion).toBeNull()
      expect(store.quizResults).toBeNull()
      expect(store.errorMessage).toBeNull()
    })

    it('should have zero unread count', () => {
      expect(store.unreadNotificationCount).toBe(0)
    })

    it('should have false computed states', () => {
      expect(store.isLeaderboardConnected).toBe(false)
      expect(store.isNotificationConnected).toBe(false)
      expect(store.isQuizRoomConnected).toBe(false)
    })
  })

  describe('Leaderboard Connection', () => {
    it('should connect to leaderboard hub', async () => {
      await store.connectLeaderboard()

      expect(store.leaderboardState).toBe('connected')
      expect(store.isLeaderboardConnected).toBe(true)
      expect(mockStart).toHaveBeenCalledOnce()
    })

    it('should register LeaderboardUpdated handler', async () => {
      await store.connectLeaderboard()

      const onCalls = mockOn.mock.calls
      const leaderboardHandler = onCalls.find((c: string[]) => c[0] === 'LeaderboardUpdated')
      expect(leaderboardHandler).toBeDefined()
    })

    it('should handle leaderboard update', async () => {
      await store.connectLeaderboard()

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'LeaderboardUpdated')![1]
      const update: LeaderboardUpdate = {
        username: 'TestUser',
        totalXP: 500,
        currentLevel: 3,
        rank: 1,
        xpGained: 50
      }
      handler(update)

      expect(store.leaderboardUpdates).toHaveLength(1)
      expect(store.leaderboardUpdates[0].username).toBe('TestUser')
    })

    it('should limit leaderboard updates to 50', async () => {
      await store.connectLeaderboard()

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'LeaderboardUpdated')![1]
      for (let i = 0; i < 55; i++) {
        handler({ username: `User${i}`, totalXP: i, currentLevel: 1, rank: i, xpGained: 10 })
      }

      expect(store.leaderboardUpdates).toHaveLength(50)
      expect(store.leaderboardUpdates[0].username).toBe('User54')
    })

    it('should disconnect from leaderboard hub', async () => {
      await store.connectLeaderboard()
      await store.disconnectLeaderboard()

      expect(store.leaderboardState).toBe('disconnected')
      expect(mockStop).toHaveBeenCalledOnce()
    })

    it('should handle connection error', async () => {
      mockStart.mockRejectedValueOnce(new Error('Connection failed'))
      await store.connectLeaderboard()

      expect(store.leaderboardState).toBe('error')
    })
  })

  describe('Notification Connection', () => {
    it('should connect to notification hub with token', async () => {
      await store.connectNotifications('test-jwt-token')

      expect(store.notificationState).toBe('connected')
      expect(store.isNotificationConnected).toBe(true)
    })

    it('should handle badge notification', async () => {
      await store.connectNotifications('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'BadgeAwarded')![1]
      const notification: BadgeNotification = {
        userId: 'user-1',
        username: 'Player1',
        badgeName: 'First Quiz',
        badgeDescription: 'Complete your first quiz',
        awardedAt: new Date().toISOString()
      }
      handler(notification)

      expect(store.badgeNotifications).toHaveLength(1)
      expect(store.badgeNotifications[0].badgeName).toBe('First Quiz')
      expect(store.unreadNotificationCount).toBe(1)
    })

    it('should handle level up notification', async () => {
      await store.connectNotifications('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'LevelUp')![1]
      const notification: LevelUpNotification = {
        userId: 'user-1',
        username: 'Player1',
        oldLevel: 2,
        newLevel: 3,
        totalXP: 900
      }
      handler(notification)

      expect(store.levelUpNotifications).toHaveLength(1)
      expect(store.levelUpNotifications[0].newLevel).toBe(3)
      expect(store.unreadNotificationCount).toBe(1)
    })

    it('should mark notifications as read', async () => {
      await store.connectNotifications('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'BadgeAwarded')![1]
      handler({ userId: '1', username: 'u', badgeName: 'b', badgeDescription: 'd', awardedAt: '' })
      handler({ userId: '1', username: 'u', badgeName: 'b2', badgeDescription: 'd2', awardedAt: '' })

      expect(store.unreadNotificationCount).toBe(2)
      store.markNotificationsRead()
      expect(store.unreadNotificationCount).toBe(0)
    })

    it('should disconnect notifications', async () => {
      await store.connectNotifications('token')
      await store.disconnectNotifications()

      expect(store.notificationState).toBe('disconnected')
    })
  })

  describe('Quiz Room Connection', () => {
    it('should connect to quiz room hub', async () => {
      await store.connectQuizRoom('token')

      expect(store.quizRoomState).toBe('connected')
      expect(store.isQuizRoomConnected).toBe(true)
    })

    it('should handle RoomCreated', async () => {
      await store.connectQuizRoom('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'RoomCreated')![1]
      const room: QuizRoomDto = {
        roomCode: 'ABC123',
        quizTitle: 'Test Quiz',
        quizId: 'quiz-1',
        hostUsername: 'Host',
        participants: [{ userId: 'u1', username: 'Host', score: 0, hasAnswered: false, isHost: true }],
        status: 'Waiting',
        currentQuestionIndex: 0,
        totalQuestions: 5
      }
      handler(room)

      expect(store.currentRoom).toEqual(room)
      expect(store.errorMessage).toBeNull()
    })

    it('should handle ParticipantJoined', async () => {
      await store.connectQuizRoom('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'ParticipantJoined')![1]
      const room: QuizRoomDto = {
        roomCode: 'ABC123',
        quizTitle: 'Quiz',
        quizId: 'q1',
        hostUsername: 'Host',
        participants: [
          { userId: 'u1', username: 'Host', score: 0, hasAnswered: false, isHost: true },
          { userId: 'u2', username: 'Player2', score: 0, hasAnswered: false, isHost: false }
        ],
        status: 'Waiting',
        currentQuestionIndex: 0,
        totalQuestions: 3
      }
      handler(room)

      expect(store.currentRoom!.participants).toHaveLength(2)
    })

    it('should handle JoinFailed', async () => {
      await store.connectQuizRoom('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'JoinFailed')![1]
      handler('Room is full')

      expect(store.errorMessage).toBe('Room is full')
    })

    it('should handle NewQuestion', async () => {
      await store.connectQuizRoom('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'NewQuestion')![1]
      const question: QuizQuestionBroadcast = {
        questionIndex: 0,
        totalQuestions: 5,
        question: 'What is O(1)?',
        options: ['Constant', 'Linear', 'Quadratic', 'Logarithmic'],
        timeLimitSeconds: 30
      }
      handler(question)

      expect(store.currentQuestion).toEqual(question)
      expect(store.answerResults).toEqual([])
    })

    it('should handle AnswerResult', async () => {
      await store.connectQuizRoom('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'AnswerResult')![1]
      const result: QuizAnswerResult = {
        userId: 'u1',
        username: 'Player',
        isCorrect: true,
        pointsEarned: 100,
        totalScore: 100,
        correctIndex: 0,
        explanation: 'O(1) means constant time'
      }
      handler(result)

      expect(store.answerResults).toHaveLength(1)
      expect(store.answerResults[0].isCorrect).toBe(true)
    })

    it('should handle ScoreUpdate', async () => {
      await store.connectQuizRoom('token')

      // Set initial room
      const roomHandler = mockOn.mock.calls.find((c: string[]) => c[0] === 'RoomCreated')![1]
      roomHandler({
        roomCode: 'ABC',
        quizTitle: 'Q',
        quizId: 'q1',
        hostUsername: 'H',
        participants: [{ userId: 'u1', username: 'H', score: 0, hasAnswered: false, isHost: true }],
        status: 'InProgress',
        currentQuestionIndex: 0,
        totalQuestions: 3
      })

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'ScoreUpdate')![1]
      const updated: QuizRoomParticipant[] = [
        { userId: 'u1', username: 'H', score: 100, hasAnswered: true, isHost: true }
      ]
      handler(updated)

      expect(store.currentRoom!.participants[0].score).toBe(100)
    })

    it('should handle QuizCompleted', async () => {
      await store.connectQuizRoom('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'QuizCompleted')![1]
      const results: QuizRoomResults = {
        roomCode: 'ABC',
        quizTitle: 'Test',
        finalRankings: [
          { userId: 'u1', username: 'Winner', score: 300, hasAnswered: true, isHost: true },
          { userId: 'u2', username: 'Loser', score: 100, hasAnswered: true, isHost: false }
        ],
        xpAwarded: 50
      }
      handler(results)

      expect(store.quizResults).toEqual(results)
      expect(store.currentQuestion).toBeNull()
    })

    it('should handle ActiveRooms', async () => {
      await store.connectQuizRoom('token')

      const handler = mockOn.mock.calls.find((c: string[]) => c[0] === 'ActiveRooms')![1]
      const rooms: QuizRoomDto[] = [
        {
          roomCode: 'ABC',
          quizTitle: 'Quiz 1',
          quizId: 'q1',
          hostUsername: 'Host1',
          participants: [],
          status: 'Waiting',
          currentQuestionIndex: 0,
          totalQuestions: 5
        }
      ]
      handler(rooms)

      expect(store.activeRooms).toHaveLength(1)
    })
  })

  describe('Quiz Room Actions', () => {
    beforeEach(async () => {
      await store.connectQuizRoom('token')
    })

    it('should invoke CreateRoom', async () => {
      await store.createRoom('quiz-1')
      expect(mockInvoke).toHaveBeenCalledWith('CreateRoom', 'quiz-1')
    })

    it('should invoke JoinRoom', async () => {
      await store.joinRoom('ABC123')
      expect(mockInvoke).toHaveBeenCalledWith('JoinRoom', 'ABC123')
    })

    it('should invoke LeaveRoom and clear state', async () => {
      await store.leaveRoom('ABC123')
      expect(mockInvoke).toHaveBeenCalledWith('LeaveRoom', 'ABC123')
      expect(store.currentRoom).toBeNull()
      expect(store.currentQuestion).toBeNull()
    })

    it('should invoke StartQuiz', async () => {
      await store.startQuiz('ABC123')
      expect(mockInvoke).toHaveBeenCalledWith('StartQuiz', 'ABC123')
    })

    it('should invoke SubmitAnswer', async () => {
      await store.submitAnswer('ABC123', 0, 2)
      expect(mockInvoke).toHaveBeenCalledWith('SubmitAnswer', 'ABC123', 0, 2)
    })

    it('should invoke NextQuestion', async () => {
      await store.nextQuestion('ABC123')
      expect(mockInvoke).toHaveBeenCalledWith('NextQuestion', 'ABC123')
    })

    it('should invoke GetActiveRooms', async () => {
      await store.fetchActiveRooms()
      expect(mockInvoke).toHaveBeenCalledWith('GetActiveRooms')
    })
  })

  describe('Disconnect', () => {
    it('should disconnect quiz room and clear state', async () => {
      await store.connectQuizRoom('token')

      // Set some state
      const roomHandler = mockOn.mock.calls.find((c: string[]) => c[0] === 'RoomCreated')![1]
      roomHandler({
        roomCode: 'ABC', quizTitle: 'Q', quizId: 'q1', hostUsername: 'H',
        participants: [], status: 'Waiting', currentQuestionIndex: 0, totalQuestions: 3
      })

      await store.disconnectQuizRoom()

      expect(store.quizRoomState).toBe('disconnected')
      expect(store.currentRoom).toBeNull()
      expect(store.currentQuestion).toBeNull()
      expect(store.answerResults).toEqual([])
      expect(store.quizResults).toBeNull()
    })

    it('should disconnect all connections', async () => {
      await store.connectLeaderboard()
      await store.connectNotifications('token')
      await store.connectQuizRoom('token')

      await store.disconnectAll()

      expect(store.leaderboardState).toBe('disconnected')
      expect(store.notificationState).toBe('disconnected')
      expect(store.quizRoomState).toBe('disconnected')
    })
  })

  describe('No-op when not connected', () => {
    it('should not invoke when quiz room not connected', async () => {
      await store.createRoom('q1')
      await store.joinRoom('ABC')
      await store.leaveRoom('ABC')
      await store.startQuiz('ABC')
      await store.submitAnswer('ABC', 0, 1)
      await store.nextQuestion('ABC')
      await store.fetchActiveRooms()

      expect(mockInvoke).not.toHaveBeenCalled()
    })
  })
})
