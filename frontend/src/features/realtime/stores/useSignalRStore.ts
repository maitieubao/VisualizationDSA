import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel
} from '@microsoft/signalr'
import type {
  LeaderboardUpdate,
  BadgeNotification,
  LevelUpNotification,
  QuizRoomDto,
  QuizQuestionBroadcast,
  QuizAnswerResult,
  QuizRoomResults,
  QuizRoomParticipant,
  SignalRConnectionState
} from '../types/signalr.types'
import { useNotificationStore } from '../../notifications/store/useNotificationStore'
import { useToastStore } from '../../../composables/useToast'
import type { NotificationDto } from '../../notifications/services/notificationApi'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055'

// NT-002: seq cố định cho id realtime — tránh trùng id khi 2 event cùng ms.
let realtimeNotificationSeq = 0

/** Chuyển event realtime (badge/level-up) thành NotificationDto đẩy vào store thông báo chung (NT-002). */
function toRealtimeNotificationDto(
  kind: 'badge' | 'levelup',
  payload: BadgeNotification | LevelUpNotification
): NotificationDto {
  realtimeNotificationSeq++
  const now = Date.now()
  if (kind === 'badge') {
    const badge = payload as BadgeNotification
    return {
      id: `realtime-badge-${badge.userId}-${now}-${realtimeNotificationSeq}`,
      content: `Bạn đã nhận được huy hiệu "${badge.badgeName}"`,
      isRead: false,
      linkUrl: '/profile',
      createdAt: badge.awardedAt
    }
  }
  const levelUp = payload as LevelUpNotification
  return {
    id: `realtime-levelup-${levelUp.userId}-${now}-${realtimeNotificationSeq}`,
    content: `Chúc mừng! Bạn đã lên cấp ${levelUp.newLevel}`,
    isRead: false,
    linkUrl: '/profile',
    createdAt: new Date(now).toISOString()
  }
}

export const useSignalRStore = defineStore('signalr', () => {
  
  const leaderboardConnection = ref<HubConnection | null>(null)
  const notificationConnection = ref<HubConnection | null>(null)
  const quizRoomConnection = ref<HubConnection | null>(null)

  const leaderboardState = ref<SignalRConnectionState>('disconnected')
  const notificationState = ref<SignalRConnectionState>('disconnected')
  const quizRoomState = ref<SignalRConnectionState>('disconnected')

  
  const leaderboardUpdates = ref<LeaderboardUpdate[]>([])

  
  const badgeNotifications = ref<BadgeNotification[]>([])
  const levelUpNotifications = ref<LevelUpNotification[]>([])
  const unreadNotificationCount = ref(0)

  
  const currentRoom = ref<QuizRoomDto | null>(null)
  const currentQuestion = ref<QuizQuestionBroadcast | null>(null)
  const answerResults = ref<QuizAnswerResult[]>([])
  const quizResults = ref<QuizRoomResults | null>(null)
  const activeRooms = ref<QuizRoomDto[]>([])
  const errorMessage = ref<string | null>(null)

  
  const isLeaderboardConnected = computed(() => leaderboardState.value === 'connected')
  const isNotificationConnected = computed(() => notificationState.value === 'connected')
  const isQuizRoomConnected = computed(() => quizRoomState.value === 'connected')

  
  async function connectLeaderboard(): Promise<void> {
    if (leaderboardConnection.value?.state === HubConnectionState.Connected) return

    leaderboardState.value = 'connecting'
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/leaderboard`)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('LeaderboardUpdated', (update: LeaderboardUpdate) => {
      leaderboardUpdates.value.unshift(update)
      if (leaderboardUpdates.value.length > 50) {
        leaderboardUpdates.value = leaderboardUpdates.value.slice(0, 50)
      }
    })

    connection.onreconnecting(() => { leaderboardState.value = 'reconnecting' })
    connection.onreconnected(() => { leaderboardState.value = 'connected' })
    connection.onclose(() => { leaderboardState.value = 'disconnected' })

    try {
      await connection.start()
      leaderboardConnection.value = connection
      leaderboardState.value = 'connected'
    } catch (err: unknown) {
      leaderboardState.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Không thể kết nối bảng xếp hạng thời gian thực.'
    }
  }

  async function disconnectLeaderboard(): Promise<void> {
    if (leaderboardConnection.value) {
      await leaderboardConnection.value.stop()
      leaderboardConnection.value = null
      leaderboardState.value = 'disconnected'
    }
  }

  
  /** Nguồn realtime duy nhất đẩy thông báo vào store chung (NT-002) — toast + list + badge. */
  function pushRealtimeNotification(kind: 'badge' | 'levelup', payload: BadgeNotification | LevelUpNotification): void {
    try {
      const notificationStore = useNotificationStore()
      notificationStore.prependNotification(toRealtimeNotificationDto(kind, payload))
      if (kind === 'badge') {
        const badge = payload as BadgeNotification
        useToastStore().success(`Huy hiệu "${badge.badgeName}" đã được trao tặng!`, 'Nhận huy hiệu mới')
      } else {
        const levelUp = payload as LevelUpNotification
        useToastStore().info(`Bạn đã lên cấp ${levelUp.newLevel}!`, 'Cấp độ mới')
      }
    } catch {
      // Pinia chưa active (test edge) — realtime vẫn ghi nhận ở mảng legacy, bỏ qua đẩy store.
    }
  }

  async function connectNotifications(token: string): Promise<void> {
    if (notificationConnection.value?.state === HubConnectionState.Connected) return

    notificationState.value = 'connecting'
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/notifications`, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('BadgeAwarded', (notification: BadgeNotification) => {
      badgeNotifications.value.unshift(notification)
      if (badgeNotifications.value.length > 50) {
        badgeNotifications.value = badgeNotifications.value.slice(0, 50)
      }
      unreadNotificationCount.value++
      // NT-002: đẩy thẳng vào store thông báo chung + toast — badge/list tự cập nhật
      // mà không cần poll/refresh; unread dùng chung nguồn useNotificationStore.
      pushRealtimeNotification('badge', notification)
    })

    connection.on('LevelUp', (notification: LevelUpNotification) => {
      levelUpNotifications.value.unshift(notification)
      if (levelUpNotifications.value.length > 50) {
        levelUpNotifications.value = levelUpNotifications.value.slice(0, 50)
      }
      unreadNotificationCount.value++
      // NT-002: như BadgeAwarded — level-up cũng phải hiện trong list thông báo.
      pushRealtimeNotification('levelup', notification)
    })

    connection.onreconnecting(() => { notificationState.value = 'reconnecting' })
    connection.onreconnected(() => { notificationState.value = 'connected' })
    connection.onclose(() => { notificationState.value = 'disconnected' })

    try {
      await connection.start()
      notificationConnection.value = connection
      notificationState.value = 'connected'
    } catch (err: unknown) {
      notificationState.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Không thể kết nối thông báo thời gian thực.'
    }
  }

  async function disconnectNotifications(): Promise<void> {
    if (notificationConnection.value) {
      await notificationConnection.value.stop()
      notificationConnection.value = null
      notificationState.value = 'disconnected'
    }
  }

  function markNotificationsRead(): void {
    unreadNotificationCount.value = 0
  }

  
  async function connectQuizRoom(token: string): Promise<void> {
    if (quizRoomConnection.value?.state === HubConnectionState.Connected) return

    quizRoomState.value = 'connecting'
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/quiz-room`, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('RoomCreated', (room: QuizRoomDto) => {
      currentRoom.value = room
      errorMessage.value = null
    })

    connection.on('ParticipantJoined', (room: QuizRoomDto) => {
      currentRoom.value = room
      errorMessage.value = null
    })

    connection.on('ParticipantLeft', (room: QuizRoomDto) => {
      currentRoom.value = room
    })

    connection.on('JoinFailed', (message: string) => {
      errorMessage.value = message
    })

    connection.on('StartFailed', (message: string) => {
      errorMessage.value = message
    })

    connection.on('QuizStarted', (room: QuizRoomDto) => {
      currentRoom.value = room
      answerResults.value = []
      quizResults.value = null
      errorMessage.value = null
    })

    connection.on('NewQuestion', (question: QuizQuestionBroadcast) => {
      currentQuestion.value = question
      answerResults.value = []
    })

    connection.on('AnswerResult', (result: QuizAnswerResult) => {
      answerResults.value.push(result)
    })

    connection.on('ScoreUpdate', (participants: QuizRoomParticipant[]) => {
      if (currentRoom.value) {
        currentRoom.value = { ...currentRoom.value, participants }
      }
    })

    connection.on('QuizCompleted', (results: QuizRoomResults) => {
      quizResults.value = results
      currentQuestion.value = null
    })

    connection.on('ActiveRooms', (rooms: QuizRoomDto[]) => {
      activeRooms.value = rooms
    })

    connection.onreconnecting(() => { quizRoomState.value = 'reconnecting' })
    connection.onreconnected(() => { quizRoomState.value = 'connected' })
    connection.onclose(() => { quizRoomState.value = 'disconnected' })

    try {
      await connection.start()
      quizRoomConnection.value = connection
      quizRoomState.value = 'connected'
      errorMessage.value = null
    } catch (err: unknown) {
      quizRoomState.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Không thể kết nối phòng quiz.'
    }
  }

  async function disconnectQuizRoom(): Promise<void> {
    if (quizRoomConnection.value) {
      await quizRoomConnection.value.stop()
      quizRoomConnection.value = null
      quizRoomState.value = 'disconnected'
      currentRoom.value = null
      currentQuestion.value = null
      answerResults.value = []
      quizResults.value = null
      errorMessage.value = null
    }
  }

  async function createRoom(quizId: string): Promise<void> {
    if (!quizRoomConnection.value) return
    try {
      await quizRoomConnection.value.invoke('CreateRoom', quizId)
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Không thể tạo phòng.'
    }
  }

  async function joinRoom(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    try {
      await quizRoomConnection.value.invoke('JoinRoom', roomCode)
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : `Không thể tham gia phòng ${roomCode}.`
    }
  }

  async function leaveRoom(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    try {
      await quizRoomConnection.value.invoke('LeaveRoom', roomCode)
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : `Không thể rời phòng ${roomCode}.`
    }
    currentRoom.value = null
    currentQuestion.value = null
    answerResults.value = []
    quizResults.value = null
    errorMessage.value = null
  }

  async function startQuiz(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    try {
      await quizRoomConnection.value.invoke('StartQuiz', roomCode)
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Không thể bắt đầu quiz.'
    }
  }

  async function submitAnswer(roomCode: string, questionIndex: number, answerIndex: number): Promise<void> {
    if (!quizRoomConnection.value) return
    try {
      await quizRoomConnection.value.invoke('SubmitAnswer', roomCode, questionIndex, answerIndex)
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Không thể gửi câu trả lời.'
    }
  }

  async function nextQuestion(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    try {
      await quizRoomConnection.value.invoke('NextQuestion', roomCode)
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Không thể chuyển câu hỏi.'
    }
  }

  async function fetchActiveRooms(): Promise<void> {
    if (!quizRoomConnection.value) return
    try {
      await quizRoomConnection.value.invoke('GetActiveRooms')
    } catch (err: unknown) {
      errorMessage.value = err instanceof Error ? err.message : 'Không thể tải danh sách phòng.'
    }
  }

  
  async function disconnectAll(): Promise<void> {
    await Promise.all([
      disconnectLeaderboard(),
      disconnectNotifications(),
      disconnectQuizRoom()
    ])
  }

  return {
    
    leaderboardState,
    notificationState,
    quizRoomState,
    leaderboardUpdates,
    badgeNotifications,
    levelUpNotifications,
    unreadNotificationCount,
    currentRoom,
    currentQuestion,
    answerResults,
    quizResults,
    activeRooms,
    errorMessage,

    
    isLeaderboardConnected,
    isNotificationConnected,
    isQuizRoomConnected,

    
    connectLeaderboard,
    disconnectLeaderboard,

    
    connectNotifications,
    disconnectNotifications,
    markNotificationsRead,

    
    connectQuizRoom,
    disconnectQuizRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    startQuiz,
    submitAnswer,
    nextQuestion,
    fetchActiveRooms,

    
    disconnectAll
  }
})
