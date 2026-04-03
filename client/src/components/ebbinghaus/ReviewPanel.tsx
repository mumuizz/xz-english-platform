import type { WordRecord, VocabLibraryItem, VocabStats } from '../../types'

const REVIEW_STAGES = [
  { time: '30 分钟', label: '第一次复习', color: '#ef233c' },
  { time: '1 小时', label: '第二次复习', color: '#f59e0b' },
  { time: '6 小时', label: '第三次复习', color: '#3b82f6' },
  { time: '1 天', label: '第四次复习', color: '#10b981' },
  { time: '2 天', label: '第五次复习', color: '#8b5cf6' },
  { time: '4 天', label: '长期巩固', color: '#0f766e' }
]

interface ReviewPanelProps {
  words: WordRecord[]
  reviewWords: WordRecord[]
  selectedVocabInfo: VocabLibraryItem | undefined
  selectedVocab: string
  selectedVocabStats: VocabStats
  onStartReview: () => void
}

export default function ReviewPanel({ words, reviewWords, selectedVocabInfo, selectedVocab, selectedVocabStats, onStartReview }: ReviewPanelProps) {
  const importCoverageTotal = selectedVocabInfo?.count || 0
  const importCoverageImported = selectedVocabStats.total
  const importCoverageRatio = importCoverageTotal > 0 ? Math.min(importCoverageImported / importCoverageTotal, 1) : 0
  const importCoverageCompleted = importCoverageTotal > 0 && importCoverageImported >= importCoverageTotal

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="rounded-3xl bg-white p-8 shadow-md">
        <h2 className="text-2xl font-bold text-[#2b2d42]">当前复习状态</h2>
        <p className="mt-2 text-[#8d99ae]">
          词库：{selectedVocabInfo?.name || selectedVocab}，已导入 {words.length} 个单词，待复习 {reviewWords.length} 个。
        </p>

        <div className="mt-6 rounded-2xl bg-[#f8f9fa] p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[#2b2d42]">整本导入进度</span>
            <span className="text-[#8d99ae]">{importCoverageImported} / {importCoverageTotal || '--'}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
            <div className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] transition-all" style={{ width: `${importCoverageRatio * 100}%` }} />
          </div>
          <div className="mt-3 text-sm">
            {importCoverageCompleted ? (
              <span className="font-medium text-[#10b981]">当前词库已经整本导入完成</span>
            ) : (
              <span className="text-[#8d99ae]">当前词库还差 {Math.max(importCoverageTotal - importCoverageImported, 0)} 个单词未导入</span>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-[#d9dee8] p-8 text-center">
          {reviewWords.length > 0 ? (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#ef233c] text-3xl font-bold text-white">待</div>
              <div className="text-3xl font-bold text-[#2b2d42]">目前有 {reviewWords.length} 个单词待复习</div>
              <p className="mx-auto mt-3 max-w-md text-[#8d99ae]">建议优先完成到期复习，再继续导入新词，避免词量持续增加但复习跟不上。</p>
              <button onClick={onStartReview} className="mt-6 rounded-2xl bg-gradient-to-r from-[#ef233c] to-[#d91e36] px-8 py-4 font-bold text-white shadow-lg transition hover:scale-[1.02]">开始复习</button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#10b981] text-3xl font-bold text-white">OK</div>
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
            <div key={stage.time} className="rounded-2xl border p-4" style={{ borderColor: `${stage.color}33`, background: `${stage.color}10` }}>
              <div className="font-bold" style={{ color: stage.color }}>{stage.time}</div>
              <div className="mt-1 text-sm text-[#8d99ae]">{stage.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
