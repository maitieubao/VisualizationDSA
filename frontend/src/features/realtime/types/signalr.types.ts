export interface LeaderboardUpdate {
  username: string
  totalXP: number
  currentLevel: number
  rank: number
  xpGained: number
}

export interface BadgeNotification {
  userId: string
  username: string
  badgeName: string
  badgeDescription: string
  awardedAt: string
}

export interface LevelUpNotification {
  userId: string
  username: string
  oldLevel: number
  newLevel: number
  totalXP: number
}

export interface QuizRoomDto {
  roomCode: string
  quizTitle: string
  quizId: string
  hostUsername: string
  participants: QuizRoomParticipant[]
  status: QuizRoomStatus
  currentQuestionIndex: number
  totalQuestions: number
}

export interface QuizRoomParticipant {
  userId: string
  username: string
  score: number
  hasAnswered: boolean
  isHost: boolean
}

export interface QuizQuestionBroadcast {
  questionIndex: number
  totalQuestions: number
  question: string
  options: string[]
  timeLimitSeconds: number
}

export interface QuizAnswerResult {
  userId: string
  username: string
  isCorrect: boolean
  pointsEarned: number
  totalScore: number
  correctIndex: number
  explanation: string
}

export interface QuizRoomResults {
  roomCode: string
  quizTitle: string
  finalRankings: QuizRoomParticipant[]
  xpAwarded: number
}

export type QuizRoomStatus = 'Waiting' | 'InProgress' | 'ShowingResults' | 'Completed'

export type SignalRConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
