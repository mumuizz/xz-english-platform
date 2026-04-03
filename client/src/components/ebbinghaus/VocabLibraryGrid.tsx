import type { VocabLibraryItem, VocabStats } from '../../types'

interface VocabLibraryGridProps {
  library: VocabLibraryItem[]
  stats: Record<string, VocabStats>
  selectedVocab: string
  onSelect: (code: string) => void
}

export default function VocabLibraryGrid({ library, stats, selectedVocab, onSelect }: VocabLibraryGridProps) {
  return (
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
              onClick={() => onSelect(item.code)}
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
                  <span className="rounded-full bg-[#8b5cf6] px-3 py-1 text-xs font-semibold text-white">当前选择</span>
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white p-3"><div className="text-[#8d99ae]">总词数</div><div className="mt-1 font-bold text-[#2b2d42]">{item.count}</div></div>
                <div className="rounded-xl bg-white p-3"><div className="text-[#8d99ae]">已导入</div><div className="mt-1 font-bold text-[#2b2d42]">{itemStats?.total || 0}</div></div>
                <div className="rounded-xl bg-white p-3"><div className="text-[#8d99ae]">待复习</div><div className="mt-1 font-bold text-[#ef233c]">{itemStats?.due || 0}</div></div>
                <div className="rounded-xl bg-white p-3"><div className="text-[#8d99ae]">高频单词</div><div className="mt-1 font-bold text-[#7c3aed]">{itemStats?.highFrequency || 0}</div></div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
