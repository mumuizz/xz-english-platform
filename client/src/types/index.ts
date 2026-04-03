export interface Article {
  id: number
  title: string
  titleZh: string
  content: string
  contentZh?: string
  source: string
  date: string
  level: 'beginner' | 'intermediate' | 'advanced'
  tags: string
}

export interface ListeningMaterial {
  id: number
  title: string
  titleZh: string
  audioUrl: string
  transcript?: string
  transcriptZh?: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  type: 'news' | 'dialogue' | 'lecture' | 'story'
  tags: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  answer: string
  explanation: string
}

export interface DictationSegment {
  id: string
  prompt: string
  answer: string
}

export interface WrongQuestion {
  materialTitle: string
  questionId: string
  question: string
  selectedAnswer: string
  correctAnswer: string
  explanation: string
}

export interface StudyRecord {
  materialTitle: string
  quizScore: string
  dictationScore: string
  createdAt: string
}

export interface CandidateWord {
  word: string
  sentence: string
}

export interface FavoriteSentence {
  articleId: number
  articleTitle: string
  sentence: string
}

export interface WordRecord {
  id: number
  word: string
  phonetic?: string
  meanings?: string
  examples?: string
  backgroundImage?: string
  level: number
  nextReview: string
  tags?: string
}

export interface ParsedWord extends Omit<WordRecord, 'meanings' | 'examples' | 'tags'> {
  meanings: { pos: string; definitions: string[] }[]
  examples: { en: string; zh: string; speaker?: string }[]
  tags: string[]
}

export interface VocabLibraryItem {
  code: string
  name: string
  description: string
  count: number
}

export interface VocabStats {
  total: number
  due: number
  highFrequency: number
}

export type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'
