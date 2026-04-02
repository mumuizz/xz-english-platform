import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import WordCard from '../components/WordCard'
import api from '../utils/api'

interface WordRecord {
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

interface ParsedWord extends Omit<WordRecord, 'meanings' | 'examples' | 'tags'> {
  meanings: { pos: string; definitions: string[] }[]
  examples: { en: string; zh: string; speaker?: string }[]
  tags: string[]
}

interface VocabLibraryItem {
  code: string
  name: string
  description: string
  count: number
}

interface VocabStats {
  total: number
  due: number
  highFrequency: number
}

type WordFilter = 'all' | 'high-frequency'

const REVIEW_STAGES = [
  { time: '30 分钟', label: '第一次复习', color: '#ef233c' },
  { time: '1 小时', label: '第二次复习', color: '#f59e0b' },
  { time: '6 小时', label: '第三次复习', color: '#3b82f6' },
  { time: '1 天', label: '第四次复习', color: '#10b981' },
  { time: '2 天', label: '第五次复习', color: '#8b5cf6' },
  { time: '4 天', label: '长期巩固', color: '#0f766e' }
]

const HIGH_FREQUENCY_KEYWORDS = ['高频', 'high-frequency', 'high_frequency', 'highfreq', '核心']

const parseWord = (word: WordRecord): ParsedWord => {
  try {
    return {
      ...word,
      meanings: word.meanings ? JSON.parse(word.meanings) : [],
      examples: word.examples ? JSON.parse(word.examples) : [],
      tags: word.tags ? JSON.parse(word.tags) : []
    }
  } catch {
    return {
      ...word,
      meanings: [],
      examples: [],
      tags: []
    }
  }
}

const isHighFrequencyWord = (tags: string[]) =>
  tags.some((tag) => {
    const normalized = tag.trim().toLowerCase()
    return HIGH_FREQUENCY_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()))
  })

export default function Ebbinghaus() {
  const [library, setLibrary] = useState<VocabLibraryItem[]>([])
  const [stats, setStats] = useState<Record<string, VocabStats>>({})
  const [selectedVocab, setSelectedVocab] = useState('selfstudy-complete')
  const [words, setWords] = useState<WordRecord[]>([])
  const [reviewWords, setReviewWords] = useState<WordRecord[]>([])
  const [currentReview, setCurrentReview] = useState<WordRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [wordFilter, setWordFilter] = useState<WordFilter>('all')
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null)

  const selectedVocabInfo = useMemo(
    () => library.find((item) => item.code === selectedVocab),
    [library, selectedVocab]
  )

  const parsedCurrentReview = useMemo(
    () => (currentReview ? parseWord(currentReview) : null),
    [currentReview]
  )

  const parsedWords = useMemo(() => words.map(parseWord), [words])

  const visibleWords = useMemo(() => {
    if (wordFilter === 'high-frequency') {
      return parsedWords.filter((word) => isHighFrequencyWord(word.tags))
    }

    return parsedWords
  }, [parsedWords, wordFilter])

  useEffect(() => {
    void loadLibrary()
    void loadStats()
  }, [])

  useEffect(() => {
    if (!selectedVocab) {
      return
    }

    setWordFilter('all')
    void loadWords(selectedVocab)
  }, [selectedVocab])

  const loadLibrary = async () => {
    try {
      const res = await api.get<VocabLibraryItem[]>('/words/vocab-library')
      setLibrary(res.data)

      if (!res.data.find((item) => item.code === selectedVocab) && res.data[0]) {
        setSelectedVocab(res.data[0].code)
      }
    } catch (error) {
      console.error('Failed to load vocab library', error)
    }
  }

  const loadStats = async () => {
    try {
      const res = await api.get<Record<string, VocabStats>>('/words/stats')
      setStats(res.data)
    } catch (error) {
      console.error('Failed to load vocab stats', error)
    }
  }

  const loadWords = async (vocab: string) => {
    try {
      setLoading(true)
      const [allWords, dueWords] = await Promise.all([
        api.get<WordRecord[]>(`/words?vocab=${vocab}`),
        api.get<WordRecord[]>(`/words/due?vocab=${vocab}`)
      ])
      setWords(allWords.data)
      setReviewWords(dueWords.data)
    } catch (error) {
      console.error('Failed to load words', error)
    } finally {
      setLoading(false)
    }
  }

  const importWholeVocab = async () => {
    if (!selectedVocabInfo) {
      return
    }

    const confirmed = window.confirm(
      `确认导入整本词库《${selectedVocabInfo.name}》吗？\n\n这次会导入当前词库的全部单词，并保留高频单词标签。`
    )
    if (!confirmed) {
      return
    }

    try {
      setImporting(true)
      setImportProgress({ current: 0, total: selectedVocabInfo.count || 1 })

      const res = await api.post(`/words/import-batch?vocab=${selectedVocab}&batchSize=100`)
      setImportProgress({ current: res.data.count, total: res.data.total })

      window.setTimeout(() => {
        alert(
          `整本词库导入完成\n\n词库：${res.data.vocabName}\n新增：${res.data.createdCount}\n更新：${res.data.updatedCount}\n高频单词：${res.data.highFrequencyCount ?? 0}\n失败：${res.data.errorCount}\n总词数：${res.data.total}`
        )
        void loadWords(selectedVocab)
        void loadStats()
        setImportProgress(null)
      }, 300)
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || '导入失败'
      alert(message)
      setImportProgress(null)
    } finally {
      setImporting(false)
    }
  }

  const startReview = () => {
    if (reviewWords.length > 0) {
      setCurrentReview(reviewWords[0])
    }
  }

  const submitReview = async (known: boolean) => {
    if (!currentReview) {
      return
    }

    try {
      await api.put(`/words/${currentReview.id}/review`, { known })
      setCurrentReview(null)
      await loadWords(selectedVocab)
      await loadStats()
    } catch (error) {
      console.error('Failed to submit review', error)
    }
  }

  const handleImageChange = async (imageUrl: string) => {
    if (!currentReview) {
      return
    }

    try {
      await api.put(`/words/${currentReview.id}/image`, { backgroundImage: imageUrl })
      setCurrentReview({ ...currentReview, backgroundImage: imageUrl })
    } catch (error) {
      console.error('Failed to update image', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#edf2f4]">
      <Sidebar />
      <div className="ml-0 p-6 md:ml-72 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-md lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2b2d42]">单词记忆</h1>
              <p className="mt-3 max-w-2xl text-[#8d99ae]">
                当前页面支持整本词库导入。导入后会保留词条标签，并单独标识高频单词，方便优先记忆。
              </p>
            </div>
            <button
              onClick={importWholeVocab}
              disabled={importing || !selectedVocabInfo}
              className={`rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition ${
                importing || !selectedVocabInfo
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:scale-[1.02]'
              }`}
            >
              {importing ? '整本词库导入中...' : '导入整本词库'}
            </button>
          </header>

          <section className="rounded-3xl bg-white p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#2b2d42]">可导入词库</h2>
              <p className="mt-2 text-sm text-[#8d99ae]">
                词库卡片会显示总词数、已导入数量、待复习数量，以及高频单词数量。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {library.map((item) => {
                const selected = item.code === selectedVocab
                const itemStats = stats[item.code]

                return (
                  <button
                    key={item.code}
                    onClick={() => setSelectedVocab(item.code)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      selected
                        ? 'border-[#8b5cf6] bg-gradient-to-br from-[#8b5cf6]/10 to-transparent shadow-lg'
                        : 'border-[#e9ecef] bg-[#f8f9fa] hover:border-[#cbd5e1] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold text-[#2b2d42]">{item.name}</div>
                        <div className="mt-1 text-sm text-[#8d99ae]">{item.description || item.code}</div>
                      </div>
                      {selected && (
                        <span className="rounded-full bg-[#8b5cf6] px-3 py-1 text-xs font-semibold text-white">
                          当前选择
                        </span>
                      )}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white p-3">
                        <div className="text-[#8d99ae]">总词数</div>
                        <div className="mt-1 font-bold text-[#2b2d42]">{item.count}</div>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <div className="text-[#8d99ae]">已导入</div>
                        <div className="mt-1 font-bold text-[#2b2d42]">{itemStats?.total || 0}</div>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <div className="text-[#8d99ae]">待复习</div>
                        <div className="mt-1 font-bold text-[#ef233c]">{itemStats?.due || 0}</div>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <div className="text-[#8d99ae]">高频单词</div>
                        <div className="mt-1 font-bold text-[#7c3aed]">{itemStats?.highFrequency || 0}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {importProgress && (
            <section className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-[#2b2d42]">导入进度</span>
                <span className="text-sm text-[#8d99ae]">
                  {importProgress.current} / {importProgress.total}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#e9ecef]">
                <div
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] transition-all"
                  style={{
                    width: `${Math.min((importProgress.current / Math.max(importProgress.total, 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </section>
          )}

          <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-3xl bg-white p-8 shadow-md">
              <h2 className="text-2xl font-bold text-[#2b2d42]">当前复习状态</h2>
              <p className="mt-2 text-[#8d99ae]">
                词库：{selectedVocabInfo?.name || selectedVocab}，已导入 {words.length} 个单词，待复习{' '}
                {reviewWords.length} 个。
              </p>

              <div className="mt-8 rounded-2xl border border-dashed border-[#d9dee8] p-8 text-center">
                {reviewWords.length > 0 ? (
                  <>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#ef233c] text-3xl font-bold text-white">
                      待
                    </div>
                    <div className="text-3xl font-bold text-[#2b2d42]">
                      目前有 {reviewWords.length} 个单词待复习
                    </div>
                    <p className="mx-auto mt-3 max-w-md text-[#8d99ae]">
                      建议优先完成到期复习，再继续导入新词，避免词量持续增加但复习跟不上。
                    </p>
                    <button
                      onClick={startReview}
                      className="mt-6 rounded-2xl bg-gradient-to-r from-[#ef233c] to-[#d91e36] px-8 py-4 font-bold text-white shadow-lg transition hover:scale-[1.02]"
                    >
                      开始复习
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#10b981] text-3xl font-bold text-white">
                      OK
                    </div>
                    <div className="text-3xl font-bold text-[#10b981]">当前没有到期复习</div>
                    <p className="mt-3 text-[#8d99ae]">可以切换词库继续学习，或者直接导入整本词库。</p>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-md">
              <h2 className="text-2xl font-bold text-[#2b2d42]">复习节奏</h2>
              <p className="mt-2 text-[#8d99ae]">按照艾宾浩斯时间点安排复习，减少遗忘后的重复学习成本。</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {REVIEW_STAGES.map((stage) => (
                  <div
                    key={stage.time}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: `${stage.color}33`, background: `${stage.color}10` }}
                  >
                    <div className="font-bold" style={{ color: stage.color }}>
                      {stage.time}
                    </div>
                    <div className="mt-1 text-sm text-[#8d99ae]">{stage.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-md">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#2b2d42]">词库单词列表</h2>
                <p className="mt-2 text-sm text-[#8d99ae]">
                  用于确认整本词库已经导入，并识别哪些词条属于高频单词。
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#f8f9fa] p-1">
                  <button
                    onClick={() => setWordFilter('all')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      wordFilter === 'all' ? 'bg-white text-[#2b2d42] shadow-sm' : 'text-[#8d99ae]'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setWordFilter('high-frequency')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      wordFilter === 'high-frequency'
                        ? 'bg-white text-[#7c3aed] shadow-sm'
                        : 'text-[#8d99ae]'
                    }`}
                  >
                    仅看高频
                  </button>
                </div>
                <div className="text-sm text-[#8d99ae]">
                  {loading ? '加载中...' : `${visibleWords.length} 条记录`}
                </div>
              </div>
            </div>

            <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
              {!loading && visibleWords.length === 0 ? (
                <div className="rounded-2xl bg-[#f8f9fa] p-12 text-center text-[#8d99ae]">
                  {words.length === 0 ? '当前词库还没有数据，点击上方“导入整本词库”即可。' : '当前筛选条件下没有单词。'}
                </div>
              ) : (
                visibleWords.map((word) => {
                  const highFrequency = isHighFrequencyWord(word.tags)

                  return (
                    <div
                      key={word.id}
                      className="flex items-center justify-between rounded-xl bg-[#f8f9fa] p-4 transition hover:bg-gradient-to-r hover:from-[#ef233c]/10 hover:to-transparent"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef233c]/10 font-bold text-[#ef233c]">
                          {word.word?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-[#2b2d42]">{word.word}</div>
                            {highFrequency && (
                              <span className="rounded-full bg-[#7c3aed]/10 px-3 py-1 text-xs font-semibold text-[#7c3aed]">
                                高频
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-[#8d99ae]">/{word.phonetic || '-'}/</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#8d99ae]">下次复习</div>
                        <div className="text-sm font-medium text-[#2b2d42]">
                          {new Date(word.nextReview).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {currentReview && parsedCurrentReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="relative w-full max-w-4xl">
                <button
                  onClick={() => setCurrentReview(null)}
                  className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                >
                  X
                </button>

                <WordCard
                  word={parsedCurrentReview.word}
                  phonetic={parsedCurrentReview.phonetic || ''}
                  meanings={parsedCurrentReview.meanings}
                  examples={parsedCurrentReview.examples}
                  backgroundImage={parsedCurrentReview.backgroundImage}
                  onImageChange={handleImageChange}
                />

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => submitReview(false)}
                    className="rounded-2xl bg-gradient-to-r from-red-500 to-red-600 py-5 font-bold text-white shadow-lg transition hover:scale-[1.02]"
                  >
                    不认识
                  </button>
                  <button
                    onClick={() => submitReview(true)}
                    className="rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] py-5 font-bold text-white shadow-lg transition hover:scale-[1.02]"
                  >
                    认识
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
