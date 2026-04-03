import { useState, useMemo } from 'react'
import type { Article, CandidateWord, FavoriteSentence } from '../../types'
import api from '../../utils/api'

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'among', 'because', 'before', 'being', 'between', 'could', 'during',
  'every', 'first', 'found', 'from', 'have', 'into', 'itself', 'later', 'many', 'might', 'more', 'most',
  'other', 'people', 'should', 'their', 'there', 'these', 'they', 'through', 'under', 'using', 'while',
  'with', 'would', 'which', 'where', 'those', 'than', 'when', 'what', 'this', 'that'
])

const splitSentences = (content: string) =>
  content.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean)

const extractCandidateWords = (article: Article): CandidateWord[] => {
  const sentenceList = splitSentences(article.content)
  const seen = new Set<string>()
  const candidates: CandidateWord[] = []

  for (const sentence of sentenceList) {
    const words = sentence.match(/[A-Za-z][A-Za-z'-]{4,}/g) || []
    for (const rawWord of words) {
      const normalized = rawWord.toLowerCase()
      if (STOP_WORDS.has(normalized) || seen.has(normalized)) continue
      seen.add(normalized)
      candidates.push({ word: normalized, sentence })
      if (candidates.length >= 12) return candidates
    }
  }
  return candidates
}

interface ArticleModalProps {
  article: Article
  favoriteSentences: FavoriteSentence[]
  onClose: () => void
  onToggleFavorite: (sentence: string) => void
  retellDraft: string
  onRetellChange: (value: string) => void
}

export default function ArticleModal({ article, favoriteSentences, onClose, onToggleFavorite, retellDraft, onRetellChange }: ArticleModalProps) {
  const [addingWords, setAddingWords] = useState<Record<string, boolean>>({})
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({})

  const candidateWords = useMemo(() => extractCandidateWords(article), [article])
  const currentSentences = useMemo(() => splitSentences(article.content).slice(0, 8), [article])
  const retellWordCount = retellDraft.trim() ? retellDraft.trim().split(/\s+/).length : 0

  const addWordToNotebook = async (candidate: CandidateWord) => {
    try {
      setAddingWords((prev) => ({ ...prev, [candidate.word]: true }))
      await api.post('/words', {
        word: candidate.word,
        phonetic: '',
        meanings: [{ pos: 'article', definitions: [`来自阅读文章：${article.titleZh}`] }],
        examples: [{ en: candidate.sentence, zh: `摘自文章：${article.titleZh}` }],
        vocabSet: 'reading-articles',
        tags: ['reading', article.level, article.title]
      })
      setAddedWords((prev) => ({ ...prev, [candidate.word]: true }))
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setAddedWords((prev) => ({ ...prev, [candidate.word]: true }))
        return
      }
      alert(error?.response?.data?.error || `加入单词本失败：${candidate.word}`)
    } finally {
      setAddingWords((prev) => ({ ...prev, [candidate.word]: false }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#e9ecef] p-6 lg:p-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-[#2b2d42]">{article.title}</h2>
            <p className="mt-2 text-[#8d99ae]">{article.titleZh}</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] text-[#2b2d42]">X</button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr,1fr,0.95fr] lg:p-8">
          <div className="rounded-2xl bg-[#f8f9fa] p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">{article.content}</div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#ef233c]/20 bg-gradient-to-br from-[#ef233c]/5 to-transparent p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">
              {article.contentZh || '暂无中文对照'}
            </div>
            <div className="rounded-2xl border border-[#e9ecef] bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#2b2d42]">整篇复述</h3>
                <span className="rounded-full bg-[#2b2d42] px-3 py-1 text-sm font-semibold text-white">{retellWordCount} 词</span>
              </div>
              <textarea
                value={retellDraft}
                onChange={(e) => onRetellChange(e.target.value)}
                placeholder="用英文复述这篇文章的核心观点、结构和结论。"
                className="min-h-[220px] w-full rounded-2xl border border-[#d1d5db] p-4 outline-none transition focus:border-[#2b2d42]"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-bold text-[#2b2d42]">文章生词</h3>
              <div className="space-y-3">
                {candidateWords.map((candidate) => (
                  <div key={candidate.word} className="rounded-2xl border border-[#e9ecef] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-bold text-[#2b2d42]">{candidate.word}</div>
                      <button
                        onClick={() => void addWordToNotebook(candidate)}
                        disabled={Boolean(addingWords[candidate.word] || addedWords[candidate.word])}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          addedWords[candidate.word] ? 'cursor-not-allowed bg-[#10b981] text-white'
                          : addingWords[candidate.word] ? 'cursor-not-allowed bg-gray-300 text-white'
                          : 'bg-[#2b2d42] text-white'
                        }`}
                      >
                        {addedWords[candidate.word] ? '已加入' : addingWords[candidate.word] ? '加入中...' : '加入单词本'}
                      </button>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-[#8d99ae]">{candidate.sentence}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-bold text-[#2b2d42]">句子收藏</h3>
              <div className="space-y-3">
                {currentSentences.map((sentence, index) => {
                  const favorited = favoriteSentences.some((item) => item.articleId === article.id && item.sentence === sentence)
                  return (
                    <div key={index} className="rounded-2xl border border-[#e9ecef] bg-white p-4">
                      <div className="text-sm leading-7 text-[#2b2d42]">{sentence}</div>
                      <button
                        onClick={() => onToggleFavorite(sentence)}
                        className={`mt-3 rounded-xl px-4 py-2 text-sm font-semibold ${favorited ? 'bg-[#10b981] text-white' : 'bg-[#2b2d42] text-white'}`}
                      >
                        {favorited ? '已收藏' : '收藏句子'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
