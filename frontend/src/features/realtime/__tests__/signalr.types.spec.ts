import { describe, it, expect } from 'vitest'
import type {
  LeaderboardUpdate,
  BadgeNotification,
  LevelUpNotification,
  QuizRoomDto,
  QuizRoomParticipant,
  QuizQuestionBroadcast,
  QuizAnswerResult,
  QuizRoomResults,
  QuizRoomStatus,
  SignalRConnectionState
} from '../types/signalr.types'

describe('SignalR Types', () => {
  it('should create LeaderboardUpdate', () => {
    const update: LeaderboardUpdate = {
      username: 'TestUser',
      totalXP: 500,
      currentLevel: 3,
      rank: 1,
      xpGained: 50
    }
    expect(update.username).toBe('TestUser')
    expect(update.totalXP).toBe(500)
    expect(update.xpGained).toBe(50)
  })

  it('should create BadgeNotification', () => {
    const notification: BadgeNotification = {
      userId: 'user-1',
      username: 'Player',
      badgeName: 'First Steps',
      badgeDescription: 'Complete first quiz',
      awardedAt: '2024-01-01T00:00:00Z'
    }
    expect(notification.badgeName).toBe('First Steps')
  })

  it('should create LevelUpNotification', () => {
    const notification: LevelUpNotification = {
      userId: 'user-1',
      username: 'Player',
      oldLevel: 2,
      newLevel: 3,
      totalXP: 900
    }
    expect(notification.newLevel).toBeGreaterThan(notification.oldLevel)
  })

  it('should create QuizRoomDto with participants', () => {
    const participant: QuizRoomParticipant = {
      userId: 'u1',
      username: 'Host',
      score: 0,
      hasAnswered: false,
      isHost: true
    }
    const room: QuizRoomDto = {
      roomCode: 'ABC123',
      quizTitle: 'DSA Quiz',
      quizId: 'quiz-1',
      hostUsername: 'Host',
      participants: [participant],
      status: 'Waiting',
      currentQuestionIndex: 0,
      totalQuestions: 5
    }
    expect(room.roomCode).toHaveLength(6)
    expect(room.participants).toHaveLength(1)
    expect(room.participants[0].isHost).toBe(true)
  })

  it('should create QuizQuestionBroadcast', () => {
    const question: QuizQuestionBroadcast = {
      questionIndex: 0,
      totalQuestions: 10,
      question: 'What is O(n log n)?',
      options: ['Merge Sort', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'],
      timeLimitSeconds: 30
    }
    expect(question.options).toHaveLength(4)
    expect(question.timeLimitSeconds).toBe(30)
  })

  it('should create QuizAnswerResult', () => {
    const result: QuizAnswerResult = {
      userId: 'u1',
      username: 'Player',
      isCorrect: true,
      pointsEarned: 100,
      totalScore: 300,
      correctIndex: 0,
      explanation: 'Merge Sort has O(n log n) time complexity'
    }
    expect(result.isCorrect).toBe(true)
    expect(result.pointsEarned).toBe(100)
  })

  it('should create QuizRoomResults', () => {
    const results: QuizRoomResults = {
      roomCode: 'ABC123',
      quizTitle: 'Final Quiz',
      finalRankings: [
        { userId: 'u1', username: 'Winner', score: 500, hasAnswered: true, isHost: true },
        { userId: 'u2', username: 'Second', score: 300, hasAnswered: true, isHost: false }
      ],
      xpAwarded: 50
    }
    expect(results.finalRankings[0].score).toBeGreaterThan(results.finalRankings[1].score)
  })

  it('should support QuizRoomStatus values', () => {
    const statuses: QuizRoomStatus[] = ['Waiting', 'InProgress', 'ShowingResults', 'Completed']
    expect(statuses).toHaveLength(4)
  })

  it('should support SignalRConnectionState values', () => {
    const states: SignalRConnectionState[] = ['disconnected', 'connecting', 'connected', 'reconnecting', 'error']
    expect(states).toHaveLength(5)
  })
})
