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

const levelConfig = {
  beginner: { label: '初级', color: '#10b981' },
  intermediate: { label: '中级', color: '#f59e0b' },
  advanced: { label: '高级', color: '#ef233c' }
}

export default function Reading() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [importing, setImporting] = useState(false)

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

  const filteredArticles = useMemo(
    () => articles.filter((item) => filter === 'all' || item.level === filter),
    [articles, filter]
  )

  const paragraphCount = (content: string) =>
    content
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#edf2f4]">
      <Sidebar />
      <div className="ml-0 md:ml-72 p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="rounded-3xl bg-white p-8 shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#2b2d42]">英语阅读</h1>
                <p className="mt-3 max-w-3xl text-[#8d99ae]">
                  这里改成了整篇文章阅读，不再只给摘要。每篇文章都包含完整英文正文和中文对照，适合做整篇理解和复述训练。
                </p>
              </div>
              <button
                onClick={importFullArticles}
                disabled={importing}
                className={`rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition ${
                  importing
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:scale-[1.02]'
                }`}
              >
                {importing ? '导入中...' : '导入整篇文章'}
              </button>
            </div>
          </header>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: '全部' },
                { key: 'beginner', label: '初级' },
                { key: 'intermediate', label: '中级' },
                { key: 'advanced', label: '高级' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as typeof filter)}
                  className={`rounded-xl px-5 py-2.5 font-medium transition ${
                    filter === item.key
                      ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white shadow-md'
                      : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {loading ? (
            <div className="rounded-3xl bg-white p-16 text-center shadow-md text-[#8d99ae]">正在加载文章...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="rounded-3xl bg-white p-16 text-center shadow-md text-[#8d99ae]">
              当前没有文章，先导入整篇阅读内容。
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="rounded-3xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-bold text-[#2b2d42]">{article.title}</div>
                      <div className="mt-2 text-sm text-[#8d99ae]">{article.titleZh}</div>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        color: levelConfig[article.level].color,
                        backgroundColor: `${levelConfig[article.level].color}15`
                      }}
                    >
                      {levelConfig[article.level].label}
                    </span>
                  </div>

                  <div className="mt-5 line-clamp-4 text-sm leading-7 text-[#4b5563]">
                    {article.content}
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
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
              ))}
            </section>
          )}

          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#e9ecef] p-6 lg:p-8">
                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold text-[#2b2d42]">{selectedArticle.title}</h2>
                    <p className="mt-2 text-[#8d99ae]">{selectedArticle.titleZh}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <span
                        className="rounded-full px-3 py-1 font-semibold"
                        style={{
                          color: levelConfig[selectedArticle.level].color,
                          backgroundColor: `${levelConfig[selectedArticle.level].color}15`
                        }}
                      >
                        {levelConfig[selectedArticle.level].label}
                      </span>
                      <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">
                        {selectedArticle.source}
                      </span>
                      <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">
                        {selectedArticle.date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] text-[#2b2d42] transition hover:bg-[#e9ecef]"
                  >
                    X
                  </button>
                </div>

                <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-2 lg:p-8">
                  <div>
                    <h3 className="mb-4 text-lg font-bold text-[#2b2d42]">英文整篇</h3>
                    <div className="rounded-2xl bg-[#f8f9fa] p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">
                      {selectedArticle.content}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-bold text-[#2b2d42]">中文对照</h3>
                    <div className="rounded-2xl border border-[#ef233c]/20 bg-gradient-to-br from-[#ef233c]/5 to-transparent p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">
                      {selectedArticle.contentZh || '暂无中文对照'}
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
