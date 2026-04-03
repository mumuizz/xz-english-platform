import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ArticleCard from '../components/reading/ArticleCard'
import ArticleModal from '../components/reading/ArticleModal'
import api from '../utils/api'
import type { Article, FavoriteSentence, LevelFilter } from '../types'

const MIN_ARTICLE_WORDS = 500
const wordCount = (content: string) => (content.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) || []).length

export default function Reading() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LevelFilter>('all')
  const [importing, setImporting] = useState(false)
  const [favoriteSentences, setFavoriteSentences] = useState<FavoriteSentence[]>([])
  const [retellDrafts, setRetellDrafts] = useState<Record<number, string>>({})

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
      alert(`${res.data.message}\n共导入 ${res.data.count} 篇文章`)
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

  const qualifiedArticles = useMemo(
    () => articles.filter((article) => wordCount(article.content) >= MIN_ARTICLE_WORDS).length,
    [articles]
  )

  const toggleFavoriteSentence = (sentence: string) => {
    if (!selectedArticle) return

    const exists = favoriteSentences.some(
      (item) => item.articleId === selectedArticle.id && item.sentence === sentence
    )

    if (exists) {
      setFavoriteSentences((prev) =>
        prev.filter(
          (item) => !(item.articleId === selectedArticle.id && item.sentence === sentence)
        )
      )
      return
    }

    setFavoriteSentences((prev) => [
      { articleId: selectedArticle.id, articleTitle: selectedArticle.titleZh, sentence },
      ...prev
    ])
  }

  const currentRetell = selectedArticle ? retellDrafts[selectedArticle.id] || '' : ''

  return (
    <Layout>
      <div className="space-y-8">
        <header className="rounded-3xl bg-white p-8 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2b2d42]">英语阅读</h1>
              <p className="mt-3 max-w-3xl text-[#8d99ae]">
                这里导入的是整篇阅读文章，不是短句材料。当前阅读要求是每篇文章不少于 {MIN_ARTICLE_WORDS}{' '}
                词，适合整篇理解、摘句和复述训练。
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

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="text-sm text-[#8d99ae]">文章总数</div>
            <div className="mt-2 text-3xl font-bold text-[#2b2d42]">{articles.length}</div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="text-sm text-[#8d99ae]">达标文章</div>
            <div className="mt-2 text-3xl font-bold text-[#ef233c]">{qualifiedArticles}</div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="text-sm text-[#8d99ae]">最低要求</div>
            <div className="mt-2 text-3xl font-bold text-[#2b2d42]">{MIN_ARTICLE_WORDS}+ 词</div>
          </div>
        </section>

        {favoriteSentences.length > 0 && (
          <section className="rounded-3xl bg-white p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#2b2d42]">句子收藏</h2>
                <p className="mt-2 text-sm text-[#8d99ae]">
                  收藏的句子可以用于复述、仿写和重点表达积累。
                </p>
              </div>
              <div className="rounded-full bg-[#2b2d42] px-4 py-2 text-sm font-semibold text-white">
                {favoriteSentences.length} 句
              </div>
            </div>
            <div className="grid gap-4">
              {favoriteSentences.map((item, index) => (
                <div
                  key={`${item.articleId}-${index}`}
                  className="rounded-2xl border border-[#e9ecef] bg-[#f8f9fa] p-5"
                >
                  <div className="text-sm text-[#8d99ae]">{item.articleTitle}</div>
                  <div className="mt-2 text-base leading-7 text-[#2b2d42]">{item.sentence}</div>
                </div>
              ))}
            </div>
          </section>
        )}

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
                onClick={() => setFilter(item.key as LevelFilter)}
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
          <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">
            正在加载文章...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">
            当前没有文章，先导入整篇阅读内容。
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
            ))}
          </section>
        )}

        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            favoriteSentences={favoriteSentences}
            onClose={() => setSelectedArticle(null)}
            onToggleFavorite={toggleFavoriteSentence}
            retellDraft={currentRetell}
            onRetellChange={(value) =>
              setRetellDrafts((prev) => ({ ...prev, [selectedArticle.id]: value }))
            }
          />
        )}
      </div>
    </Layout>
  )
}
