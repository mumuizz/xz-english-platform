import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import VocabLibraryGrid from '../components/ebbinghaus/VocabLibraryGrid'
import ReviewPanel from '../components/ebbinghaus/ReviewPanel'
import WordList from '../components/ebbinghaus/WordList'
import WordCard from '../components/WordCard'
import api from '../utils/api'
import type { WordRecord, ParsedWord, VocabLibraryItem, VocabStats } from '../types'

type WordFilter = 'all' | 'high-frequency'
const MIN_VOCAB_WORDS = 1000

const parseWord = (word: WordRecord): ParsedWord => {
  try {
    return {
      ...word,
      meanings: word.meanings ? JSON.parse(word.meanings) : [],
      examples: word.examples ? JSON.parse(word.examples) : [],
      tags: word.tags ? JSON.parse(word.tags) : []
    }
  } catch {
    return { ...word, meanings: [], examples: [], tags: [] }
  }
}

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

  const selectedVocabInfo = useMemo(() => library.find((item) => item.code === selectedVocab), [library, selectedVocab])
  const parsedCurrentReview = useMemo(() => (currentReview ? parseWord(currentReview) : null), [currentReview])
  const selectedVocabStats = useMemo(() => stats[selectedVocab] || { total: 0, due: 0, highFrequency: 0 }, [selectedVocab, stats])
  const parsedWords = useMemo(() => words.map(parseWord), [words])

  useEffect(() => {
    void loadLibrary()
    void loadStats()
  }, [])

  useEffect(() => {
    if (!selectedVocab) return
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
    const targetVocab = selectedVocabInfo || library[0]
    if (!targetVocab) return

    const confirmed = window.confirm(
      `确认导入整本词库《${targetVocab.name}》吗？\n\n这次会导入当前词库的全部单词，并保留高频单词标签。`
    )
    if (!confirmed) return

    try {
      if (targetVocab.code !== selectedVocab) {
        setSelectedVocab(targetVocab.code)
      }

      setImporting(true)
      setImportProgress({ current: 0, total: targetVocab.count || 1 })

      const res = await api.post(`/words/import-batch?vocab=${targetVocab.code}&batchSize=100`)
      setImportProgress({ current: res.data.count, total: res.data.total })

      window.setTimeout(() => {
        alert(
          `整本词库导入完成\n\n词库：${res.data.vocabName}\n新增：${res.data.createdCount}\n更新：${res.data.updatedCount}\n高频单词：${res.data.highFrequencyCount ?? 0}\n失败：${res.data.errorCount}\n总词数：${res.data.total}`
        )
        void loadWords(targetVocab.code)
        void loadStats()
        setImportProgress(null)
      }, 300)
    } catch (error: any) {
      alert(error?.response?.data?.error || error?.message || '导入失败')
      setImportProgress(null)
    } finally {
      setImporting(false)
    }
  }

  const startReview = () => {
    if (reviewWords.length > 0) setCurrentReview(reviewWords[0])
  }

  const submitReview = async (known: boolean) => {
    if (!currentReview) return
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
    if (!currentReview) return
    try {
      await api.put(`/words/${currentReview.id}/image`, { backgroundImage: imageUrl })
      setCurrentReview({ ...currentReview, backgroundImage: imageUrl })
    } catch (error) {
      console.error('Failed to update image', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-md lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#2b2d42]">自考单词</h1>
            <p className="mt-3 max-w-2xl text-[#8d99ae]">
              支持整本自考英语词库导入。导入后会保留词条标签，并单独标识高频单词，方便优先记忆。
            </p>
            <p className="mt-2 max-w-2xl text-sm text-[#8d99ae]">
              当前仅展示词量不少于 {MIN_VOCAB_WORDS} 的大词库，避免混入几十词的小词库。
            </p>
          </div>
          <button
            onClick={importWholeVocab}
            disabled={importing || library.length === 0}
            className={`rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition ${
              importing || library.length === 0 ? 'cursor-not-allowed bg-gray-400' : 'bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:scale-[1.02]'
            }`}
          >
            {importing ? '整本词库导入中...' : '导入整本自考词库'}
          </button>
        </header>

        <VocabLibraryGrid library={library} stats={stats} selectedVocab={selectedVocab} onSelect={setSelectedVocab} />

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
                style={{ width: `${Math.min((importProgress.current / Math.max(importProgress.total, 1)) * 100, 100)}%` }}
              />
            </div>
          </section>
        )}

        <ReviewPanel
          words={words}
          reviewWords={reviewWords}
          selectedVocabInfo={selectedVocabInfo}
          selectedVocab={selectedVocab}
          selectedVocabStats={selectedVocabStats}
          onStartReview={startReview}
        />

        <WordList words={parsedWords} loading={loading} wordFilter={wordFilter} onFilterChange={setWordFilter} />

        {currentReview && parsedCurrentReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl">
              <button onClick={() => setCurrentReview(null)} className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30">
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
                <button onClick={() => submitReview(false)} className="rounded-2xl bg-gradient-to-r from-red-500 to-red-600 py-5 font-bold text-white shadow-lg transition hover:scale-[1.02]">
                  不认识
                </button>
                <button onClick={() => submitReview(true)} className="rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] py-5 font-bold text-white shadow-lg transition hover:scale-[1.02]">
                  认识
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
