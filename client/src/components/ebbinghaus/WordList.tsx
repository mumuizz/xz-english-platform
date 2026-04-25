import { useMemo } from 'react'
import type { ParsedWord } from '../../types'

type WordFilter = 'all' | 'high-frequency'

const HIGH_FREQUENCY_KEYWORDS = ['高频', '核心', 'high-frequency', 'high_frequency', 'highfreq', '楂橀', '鏍稿績']

const isHighFrequencyWord = (tags: string[]) =>
  tags.some((tag) => {
    const normalized = tag.trim().toLowerCase()
    return HIGH_FREQUENCY_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()))
  })

interface WordListProps {
  words: ParsedWord[]
  loading: boolean
  wordFilter: WordFilter
  onFilterChange: (filter: WordFilter) => void
}

export default function WordList({ words, loading, wordFilter, onFilterChange }: WordListProps) {
  const visibleWords = useMemo(() => {
    if (wordFilter === 'high-frequency') {
      return words.filter((word) => isHighFrequencyWord(word.tags))
    }
    return words
  }, [words, wordFilter])

  return (
    <section className="rounded-3xl bg-white p-8 shadow-md">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2d42]">词库单词列表</h2>
          <p className="mt-2 text-sm text-[#8d99ae]">用于确认整本词库已经导入，并识别哪些词条属于高频单词。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#f8f9fa] p-1">
            <button
              onClick={() => onFilterChange('all')}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${wordFilter === 'all' ? 'bg-white text-[#2b2d42] shadow-sm' : 'text-[#8d99ae]'}`}
            >
              全部
            </button>
            <button
              onClick={() => onFilterChange('high-frequency')}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${wordFilter === 'high-frequency' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-[#8d99ae]'}`}
            >
              仅看高频
            </button>
          </div>
          <div className="text-sm text-[#8d99ae]">{loading ? '加载中...' : `${visibleWords.length} 条记录`}</div>
        </div>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
        {!loading && visibleWords.length === 0 ? (
          <div className="rounded-2xl bg-[#f8f9fa] p-12 text-center text-[#8d99ae]">
            {words.length === 0 ? '当前词库还没有数据，点击上方“导入整本自考词库”即可。' : '当前筛选条件下没有单词。'}
          </div>
        ) : (
          visibleWords.map((word) => {
            const highFrequency = isHighFrequencyWord(word.tags)
            return (
              <div key={word.id} className="flex items-center justify-between rounded-xl bg-[#f8f9fa] p-4 transition hover:bg-gradient-to-r hover:from-[#ef233c]/10 hover:to-transparent">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef233c]/10 font-bold text-[#ef233c]">
                    {word.word?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-[#2b2d42]">{word.word}</div>
                      {highFrequency && (
                        <span className="rounded-full bg-[#7c3aed]/10 px-3 py-1 text-xs font-semibold text-[#7c3aed]">高频</span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-[#8d99ae]">/{word.phonetic || '-'}/</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#8d99ae]">下次复习</div>
                  <div className="text-sm font-medium text-[#2b2d42]">{new Date(word.nextReview).toLocaleDateString('zh-CN')}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
