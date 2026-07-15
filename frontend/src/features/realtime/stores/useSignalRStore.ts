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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055'

export const useSignalRStore = defineStore('signalr', () => {
  // Connection state
  const leaderboardConnection = ref<HubConnection | null>(null)
  const notificationConnection = ref<HubConnection | null>(null)
  const quizRoomConnection = ref<HubConnection | null>(null)

  const leaderboardState = ref<SignalRConnectionState>('disconnected')
  const notificationState = ref<SignalRConnectionState>('disconnected')
  const quizRoomState = ref<SignalRConnectionState>('disconnected')

  // Leaderboard data
  const leaderboardUpdates = ref<LeaderboardUpdate[]>([])

  // Notification data
  const badgeNotifications = ref<BadgeNotification[]>([])
  const levelUpNotifications = ref<LevelUpNotification[]>([])
  const unreadNotificationCount = ref(0)

  // Quiz Room data
  const currentRoom = ref<QuizRoomDto | null>(null)
  const currentQuestion = ref<QuizQuestionBroadcast | null>(null)
  const answerResults = ref<QuizAnswerResult[]>([])
  const quizResults = ref<QuizRoomResults | null>(null)
  const activeRooms = ref<QuizRoomDto[]>([])
  const errorMessage = ref<string | null>(null)

  // Computed
  const isLeaderboardConnected = computed(() => leaderboardState.value === 'connected')
  const isNotificationConnected = computed(() => notificationState.value === 'connected')
  const isQuizRoomConnected = computed(() => quizRoomState.value === 'connected')

  // Leaderboard Hub
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
    } catch {
      leaderboardState.value = 'error'
    }
  }

  async function disconnectLeaderboard(): Promise<void> {
    if (leaderboardConnection.value) {
      await leaderboardConnection.value.stop()
      leaderboardConnection.value = null
      leaderboardState.value = 'disconnected'
    }
  }

  // Notification Hub
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
      unreadNotificationCount.value++
    })

    connection.on('LevelUp', (notification: LevelUpNotification) => {
      levelUpNotifications.value.unshift(notification)
      unreadNotificationCount.value++
    })

    connection.onreconnecting(() => { notificationState.value = 'reconnecting' })
    connection.onreconnected(() => { notificationState.value = 'connected' })
    connection.onclose(() => { notificationState.value = 'disconnected' })

    try {
      await connection.start()
      notificationConnection.value = connection
      notificationState.value = 'connected'
    } catch {
      notificationState.value = 'error'
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

  // Quiz Room Hub
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
    } catch {
      quizRoomState.value = 'error'
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
    }
  }

  async function createRoom(quizId: string): Promise<void> {
    if (!quizRoomConnection.value) return
    await quizRoomConnection.value.invoke('CreateRoom', quizId)
  }

  async function joinRoom(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    await quizRoomConnection.value.invoke('JoinRoom', roomCode)
  }

  async function leaveRoom(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    await quizRoomConnection.value.invoke('LeaveRoom', roomCode)
    currentRoom.value = null
    currentQuestion.value = null
  }

  async function startQuiz(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    await quizRoomConnection.value.invoke('StartQuiz', roomCode)
  }

  async function submitAnswer(roomCode: string, questionIndex: number, answerIndex: number): Promise<void> {
    if (!quizRoomConnection.value) return
    await quizRoomConnection.value.invoke('SubmitAnswer', roomCode, questionIndex, answerIndex)
  }

  async function nextQuestion(roomCode: string): Promise<void> {
    if (!quizRoomConnection.value) return
    await quizRoomConnection.value.invoke('NextQuestion', roomCode)
  }

  async function fetchActiveRooms(): Promise<void> {
    if (!quizRoomConnection.value) return
    await quizRoomConnection.value.invoke('GetActiveRooms')
  }

  // Disconnect all
  async function disconnectAll(): Promise<void> {
    await Promise.all([
      disconnectLeaderboard(),
      disconnectNotifications(),
      disconnectQuizRoom()
    ])
  }

  return {
    // State
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

    // Computed
    isLeaderboardConnected,
    isNotificationConnected,
    isQuizRoomConnected,

    // Leaderboard
    connectLeaderboard,
    disconnectLeaderboard,

    // Notifications
    connectNotifications,
    disconnectNotifications,
    markNotificationsRead,

    // Quiz Room
    connectQuizRoom,
    disconnectQuizRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    startQuiz,
    submitAnswer,
    nextQuestion,
    fetchActiveRooms,

    // Global
    disconnectAll
  }
})
