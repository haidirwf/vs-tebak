// stores/battleStore.ts — Zustand Battle State
'use client'
import { create } from 'zustand'
import { Battle, Question, Profile } from '@/types'

interface BattleStore {
    battle: Battle | null
    questions: Question[]
    currentQuestionIndex: number
    timeLeft: number
    player1Score: number
    player2Score: number
    answers: Record<number, number> // question index → answer index
    opponent: Profile | null
    isFinished: boolean

    setBattle: (battle: Battle | null) => void
    setQuestions: (questions: Question[]) => void
    setOpponent: (opponent: Profile | null) => void
    setTimeLeft: (time: number) => void
    nextQuestion: () => void
    submitAnswer: (answerIndex: number) => void
    updateScore: (player: 'player1' | 'player2', score: number) => void
    finishBattle: () => void
    resetBattle: () => void
}

export const useBattleStore = create<BattleStore>((set, get) => ({
    battle: null,
    questions: [],
    currentQuestionIndex: 0,
    timeLeft: 15,
    player1Score: 0,
    player2Score: 0,
    answers: {},
    opponent: null,
    isFinished: false,

    setBattle: (battle) => set({ battle }),
    setQuestions: (questions) => set({ questions, currentQuestionIndex: 0 }),
    setOpponent: (opponent) => set({ opponent }),
    setTimeLeft: (timeLeft) => set({ timeLeft }),

    nextQuestion: () => {
        const { currentQuestionIndex, questions } = get()
        if (currentQuestionIndex < questions.length - 1) {
            set({ currentQuestionIndex: currentQuestionIndex + 1, timeLeft: 15 })
        } else {
            set({ isFinished: true })
        }
    },

    submitAnswer: (answerIndex: number) => {
        const { currentQuestionIndex, questions, answers, player1Score } = get()
        const question = questions[currentQuestionIndex]
        if (!question) return

        const newAnswers = { ...answers, [currentQuestionIndex]: answerIndex }
        const isCorrect = answerIndex === question.correct_option
        const timeBonus = Math.floor(get().timeLeft * 0.5)

        set({
            answers: newAnswers,
            player1Score: isCorrect ? player1Score + 10 + timeBonus : player1Score,
        })
    },

    updateScore: (player, score) => {
        if (player === 'player1') set({ player1Score: score })
        else set({ player2Score: score })
    },

    finishBattle: () => set({ isFinished: true }),

    resetBattle: () => set({
        battle: null,
        questions: [],
        currentQuestionIndex: 0,
        timeLeft: 15,
        player1Score: 0,
        player2Score: 0,
        answers: {},
        opponent: null,
        isFinished: false,
    }),
}))
