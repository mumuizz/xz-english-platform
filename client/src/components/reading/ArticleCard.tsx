import type { Article } from '../../types'
import { levelConfig } from '../../constants/theme'

interface ArticleCardProps {
  article: Article
  onClick: () => void
}

const paragraphCount = (content: string) => content.split('\n').map((item) => item.trim()).filter(Boolean).length
const wordCount = (content: string) => (content.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) || []).length

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-bold text-[#2b2d42]">{article.title}</div>
          <div className="mt-2 text-sm text-[#8d99ae]">{article.titleZh}</div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ color: levelConfig[article.level].color, backgroundColor: `${levelConfig[article.level].color}15` }}
        >
          {levelConfig[article.level].label}
        </span>
      </div>

      <div className="mt-5 line-clamp-4 text-sm leading-7 text-[#4b5563]">{article.content}</div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
        <div className="rounded-xl bg-[#f8f9fa] p-3">
          <div className="text-[#8d99ae]">英文词数</div>
          <div className="mt-1 font-bold text-[#2b2d42]">{wordCount(article.content)}</div>
        </div>
        <div className="rounded-xl bg-[#f8f9fa] p-3">
          <div className="text-[#8d99ae]">段落数</div>
          <div className="mt-1 font-bold text-[#2b2d42]">{paragraphCount(article.content)}</div>
        </div>
        <div className="rounded-xl bg-[#f8f9fa] p-3">
          <div className="text-[#8d99ae]">来源</div>
          <div className="mt-1 font-bold text-[#2b2d42]">{article.source}</div>
        </div>
        <div className="rounded-xl bg-[#f8f9fa] p-3">
          <div className="text-[#8d99ae]">日期</div>
          <div className="mt-1 font-bold text-[#2b2d42]">{article.date}</div>
        </div>
      </div>
    </button>
  )
}
