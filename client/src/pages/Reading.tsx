import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../utils/api'

interface Article {
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

interface CandidateWord {
  word: string
  sentence: string
}

interface FavoriteSentence {
  articleId: number
  articleTitle: string
  sentence: string
}

const levelConfig = {
  beginner: { label: '初级', color: '#10b981' },
  intermediate: { label: '中级', color: '#f59e0b' },
  advanced: { label: '高级', color: '#ef233c' }
}

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'among', 'because', 'before', 'being', 'between', 'could', 'during',
  'every', 'first', 'found', 'from', 'have', 'into', 'itself', 'later', 'many', 'might', 'more', 'most',
  'other', 'people', 'should', 'their', 'there', 'these', 'they', 'through', 'under', 'using', 'while',
  'with', 'would', 'which', 'where', 'those', 'than', 'when', 'what', 'this', 'that'
])

const splitSentences = (content: string) =>
  content
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)

const extractCandidateWords = (article: Article | null): CandidateWord[] => {
  if (!article) return []
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

export default function Reading() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [importing, setImporting] = useState(false)
  const [addingWords, setAddingWords] = useState<Record<string, boolean>>({})
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({})
  const [favoriteSentences, setFavoriteSentences] = useState<FavoriteSentence[]>([])

  useEffect(() => {
    void loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const res = await api.get<Article[]>('/articles')
      setArticles(res.data)
    } catch (error) {
      console.error('Failed to load articles', error)
    } finally {
      setLoading(false)
    }
  }

  const importFullArticles = async () => {
    try {
      setImporting(true)
      const res = await api.post('/articles/import-people-daily')
      alert(`${res.data.message}\n共导入 ${res.data.count} 篇整篇文章`)
      await loadArticles()
    } catch (error: any) {
      alert(error?.response?.data?.error || '导入文章失败')
    } finally {
      setImporting(false)
    }
  }

  const filteredArticles = useMemo(() => articles.filter((item) => filter === 'all' || item.level === filter), [articles, filter])
  const candidateWords = useMemo(() => extractCandidateWords(selectedArticle), [selectedArticle])
  const currentSentences = useMemo(() => selectedArticle ? splitSentences(selectedArticle.content).slice(0, 8) : [], [selectedArticle])

  const paragraphCount = (content: string) => content.split('\n').map((item) => item.trim()).filter(Boolean).length

  const addWordToNotebook = async (candidate: CandidateWord) => {
    if (!selectedArticle) return
    try {
      setAddingWords((prev) => ({ ...prev, [candidate.word]: true }))
      await api.post('/words', {
        word: candidate.word,
        phonetic: '',
        meanings: [{ pos: 'article', definitions: [`来自阅读文章：${selectedArticle.titleZh}`] }],
        examples: [{ en: candidate.sentence, zh: `摘自文章：${selectedArticle.titleZh}` }],
        vocabSet: 'reading-articles',
        tags: ['reading', selectedArticle.level, selectedArticle.title]
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

  const toggleFavoriteSentence = (sentence: string) => {
    if (!selectedArticle) return
    const exists = favoriteSentences.some((item) => item.articleId === selectedArticle.id && item.sentence === sentence)
    if (exists) {
      setFavoriteSentences((prev) => prev.filter((item) => !(item.articleId === selectedArticle.id && item.sentence === sentence)))
      return
    }
    setFavoriteSentences((prev) => [{ articleId: selectedArticle.id, articleTitle: selectedArticle.titleZh, sentence }, ...prev])
  }

  return (
    <div className="min-h-screen bg-[#edf2f4]">
      <Sidebar />
      <div className="ml-0 md:ml-72 p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="rounded-3xl bg-white p-8 shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#2b2d42]">英语阅读</h1>
                <p className="mt-3 max-w-3xl text-[#8d99ae]">整篇文章阅读、生词提取和句子收藏已经接通，阅读内容可以直接沉淀到复习素材里。</p>
              </div>
              <button onClick={importFullArticles} disabled={importing} className={`rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition ${importing ? 'cursor-not-allowed bg-gray-400' : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:scale-[1.02]'}`}>{importing ? '导入中...' : '导入整篇文章'}</button>
            </div>
          </header>

          {favoriteSentences.length > 0 && (
            <section className="rounded-3xl bg-white p-8 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#2b2d42]">句子收藏</h2>
                  <p className="mt-2 text-sm text-[#8d99ae]">收藏的句子可作为复述、仿写和后续单词回顾的素材。</p>
                </div>
                <div className="rounded-full bg-[#2b2d42] px-4 py-2 text-sm font-semibold text-white">{favoriteSentences.length} 句</div>
              </div>
              <div className="grid gap-4">
                {favoriteSentences.map((item, index) => (
                  <div key={`${item.articleId}-${index}`} className="rounded-2xl border border-[#e9ecef] bg-[#f8f9fa] p-5">
                    <div className="text-sm text-[#8d99ae]">{item.articleTitle}</div>
                    <div className="mt-2 text-base leading-7 text-[#2b2d42]">{item.sentence}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex flex-wrap gap-3">
              {[{ key: 'all', label: '全部' }, { key: 'beginner', label: '初级' }, { key: 'intermediate', label: '中级' }, { key: 'advanced', label: '高级' }].map((item) => (
                <button key={item.key} onClick={() => setFilter(item.key as typeof filter)} className={`rounded-xl px-5 py-2.5 font-medium transition ${filter === item.key ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white shadow-md' : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'}`}>{item.label}</button>
              ))}
            </div>
          </section>

          {loading ? <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">正在加载文章...</div> : filteredArticles.length === 0 ? <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">当前没有文章，先导入整篇阅读内容。</div> : (
            <section className="grid gap-6 md:grid-cols-2">
              {filteredArticles.map((article) => (
                <button key={article.id} onClick={() => { setSelectedArticle(article); setAddedWords({}) }} className="rounded-3xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div><div className="text-xl font-bold text-[#2b2d42]">{article.title}</div><div className="mt-2 text-sm text-[#8d99ae]">{article.titleZh}</div></div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: levelConfig[article.level].color, backgroundColor: `${levelConfig[article.level].color}15` }}>{levelConfig[article.level].label}</span>
                  </div>
                  <div className="mt-5 line-clamp-4 text-sm leading-7 text-[#4b5563]">{article.content}</div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-[#f8f9fa] p-3"><div className="text-[#8d99ae]">段落数</div><div className="mt-1 font-bold text-[#2b2d42]">{paragraphCount(article.content)}</div></div>
                    <div className="rounded-xl bg-[#f8f9fa] p-3"><div className="text-[#8d99ae]">来源</div><div className="mt-1 font-bold text-[#2b2d42]">{article.source}</div></div>
                    <div className="rounded-xl bg-[#f8f9fa] p-3"><div className="text-[#8d99ae]">日期</div><div className="mt-1 font-bold text-[#2b2d42]">{article.date}</div></div>
                  </div>
                </button>
              ))}
            </section>
          )}

          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#e9ecef] p-6 lg:p-8">
                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold text-[#2b2d42]">{selectedArticle.title}</h2>
                    <p className="mt-2 text-[#8d99ae]">{selectedArticle.titleZh}</p>
                  </div>
                  <button onClick={() => setSelectedArticle(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] text-[#2b2d42]">X</button>
                </div>

                <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr,1fr,0.9fr] lg:p-8">
                  <div className="rounded-2xl bg-[#f8f9fa] p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">{selectedArticle.content}</div>
                  <div className="rounded-2xl border border-[#ef233c]/20 bg-gradient-to-br from-[#ef233c]/5 to-transparent p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">{selectedArticle.contentZh || '暂无中文对照'}</div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 text-lg font-bold text-[#2b2d42]">文章生词</h3>
                      <div className="space-y-3">
                        {candidateWords.map((candidate) => (
                          <div key={candidate.word} className="rounded-2xl border border-[#e9ecef] bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-lg font-bold text-[#2b2d42]">{candidate.word}</div>
                              <button onClick={() => void addWordToNotebook(candidate)} disabled={Boolean(addingWords[candidate.word] || addedWords[candidate.word])} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${addedWords[candidate.word] ? 'cursor-not-allowed bg-[#10b981] text-white' : addingWords[candidate.word] ? 'cursor-not-allowed bg-gray-300 text-white' : 'bg-[#2b2d42] text-white'}`}>{addedWords[candidate.word] ? '已加入' : addingWords[candidate.word] ? '加入中...' : '加入单词本'}</button>
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
                          const favorited = favoriteSentences.some((item) => item.articleId === selectedArticle.id && item.sentence === sentence)
                          return (
                            <div key={index} className="rounded-2xl border border-[#e9ecef] bg-white p-4">
                              <div className="text-sm leading-7 text-[#2b2d42]">{sentence}</div>
                              <button onClick={() => toggleFavoriteSentence(sentence)} className={`mt-3 rounded-xl px-4 py-2 text-sm font-semibold ${favorited ? 'bg-[#10b981] text-white' : 'bg-[#2b2d42] text-white'}`}>{favorited ? '已收藏' : '收藏句子'}</button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
