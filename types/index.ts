// types/index.ts — Skillungo TypeScript Types

export type AvatarClass = 'warrior' | 'mage' | 'archer' | 'healer'
export type ModuleCategory = 'coding' | 'design' | 'productivity' | 'business'
export type ModuleDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed'
export type BattleStatus = 'waiting' | 'active' | 'finished'
export type QuestType = 'complete_module' | 'win_battle' | 'maintain_streak' | 'earn_xp'
export type BadgeConditionType = 'level' | 'streak' | 'battles_won' | 'modules_completed'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  school_name: string | null
  city: string | null
  avatar_class: AvatarClass
  level: number
  xp: number
  xp_to_next_level: number
  streak_count: number
  last_active: string | null
  created_at: string
}

export interface Module {
  id: string
  slug: string
  title: string
  description: string | null
  category: ModuleCategory
  difficulty: ModuleDifficulty
  xp_reward: number
  duration_minutes: number | null
  thumbnail_url: string | null
  content: LessonStep[] | null
  is_published: boolean
  created_at: string
}

export interface LessonStep {
  id: string
  title: string
  type: 'text' | 'video' | 'quiz'
  content: string
  questions?: Question[]
}

export interface UserModule {
  id: string
  user_id: string
  module_id: string
  status: ModuleStatus
  progress_percent: number
  completed_at: string | null
  xp_granted_at?: string | null
}

export interface Question {
  id: string
  module_id?: string
  category?: string
  question_text: string
  options: string[]
  correct_option: number
  difficulty: string
  explanation: string | null
}

export interface Battle {
  id: string
  room_code: string
  player1_id: string | null
  player2_id: string | null
  player1_ready: boolean
  player2_ready: boolean
  status: BattleStatus
  player1_score: number
  player2_score: number
  winner_id: string | null
  category: string | null
  created_at: string
}

export interface DailyQuest {
  id: string
  title: string
  description: string | null
  quest_type: QuestType
  target_value: number
  xp_reward: number
  date: string
}

export interface UserDailyQuest {
  id: string
  user_id: string
  quest_id: string
  current_value: number
  is_completed: boolean
  date: string
  daily_quests?: DailyQuest
}

export interface Badge {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  condition_type: BadgeConditionType
  condition_value: number
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badges?: Badge
}

export interface XPLog {
  id: string
  user_id: string
  xp_amount: number
  reason: string | null
  created_at: string
}

// Game state types
export interface LevelInfo {
  level: number
  currentXp: number
  xpToNext: number
  totalXp: number
}

// Battle realtime payload
export interface BattleRealtimePayload {
  type: 'answer' | 'score_update' | 'game_end' | 'player_joined'
  player_id: string
  question_index?: number
  answer_index?: number
  score?: number
  timestamp?: number
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number
  id: string
  username: string
  full_name: string | null
  school_name: string | null
  city: string | null
  avatar_class: AvatarClass
  level: number
  xp: number
  streak_count: number
}
