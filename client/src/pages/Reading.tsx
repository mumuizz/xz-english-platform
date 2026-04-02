import { useState, useEffect } from 'react'
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
  tags: string[]
}

export default function Reading() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      const res = await api.get('/articles')
      setArticles(res.data)
    } catch (e) {
      console.error('Failed to load articles', e)
    } finally {
      setLoading(false)
    }
  }

  const importFromPeopleDaily = async () => {
    try {
      const res = await api.post('/articles/import-people-daily')
      alert(`✅ ${res.data.message || '导入成功！'}`)
      loadArticles()
    } catch (e: any) {
      alert(`❌ 导入失败：${e.response?.data?.error || '未知错误'}`)
    }
  }

  const levelConfig = {
    beginner: { label: '初级', icon: '🟢', color: '#10b981', bg: 'from-[#10b981]/10 to-transparent' },
    intermediate: { label: '中级', icon: '🟡', color: '#f59e0b', bg: 'from-[#f59e0b]/10 to-transparent' },
    advanced: { label: '高级', icon: '🔴', color: '#ef233c', bg: 'from-[#ef233c]/10 to-transparent' }
  }

  const filterConfig = [
    { key: 'all', label: '全部', icon: '📰', color: '#2b2d42' },
    { key: 'beginner', label: '初级', icon: '🟢', color: '#10b981' },
    { key: 'intermediate', label: '中级', icon: '🟡', color: '#f59e0b' },
    { key: 'advanced', label: '高级', icon: '🔴', color: '#ef233c' }
  ]

  return (
    <div className="min-h-screen bg-[#edf2f4]">
      <Sidebar />
      <div className="ml-0 md:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-[#ef233c] rounded-full" />
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-[#2b2d42] mb-2">📰 英语阅读</h1>
                  <p className="text-lg text-[#8d99ae]">人民日报精选文章，提升阅读能力</p>
                </div>
              </div>
              <button 
                onClick={importFromPeopleDaily} 
                className="group relative bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  📥 导入新文章
                </span>
              </button>
            </div>
          </header>

          {/* Filter */}
          <div className="group relative bg-white rounded-2xl p-4 shadow-md mb-8 animate-slide-in">
            <div className="flex gap-2 flex-wrap">
              {filterConfig.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    filter === item.key 
                      ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white shadow-md scale-105' 
                      : 'bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#2b2d42]'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-md animate-pulse">
              <span className="text-5xl mb-4 block">📚</span>
              <p className="text-[#8d99ae] text-lg">正在加载文章...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 animate-slide-in delay-1">
              {articles
                .filter(a => filter === 'all' || a.level === filter)
                .map((article, index) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${levelConfig[article.level].bg} rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#2b2d42] text-lg mb-2 line-clamp-2 group-hover:text-[#ef233c] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-[#8d99ae] text-sm line-clamp-2">{article.titleZh}</p>
                        </div>
                        <span 
                          className="ml-3 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ 
                            backgroundColor: `${levelConfig[article.level].color}15`,
                            color: levelConfig[article.level].color
                          }}
                        >
                          {levelConfig[article.level].icon} {levelConfig[article.level].label}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-[#8d99ae] pt-4 border-t border-[#e9ecef]">
                        <span className="flex items-center gap-1">
                          📅 {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          📰 {article.source}
                        </span>
                      </div>

                      {/* Hover Arrow */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-[#ef233c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && articles.filter(a => filter === 'all' || a.level === filter).length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center shadow-md">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-[#8d99ae] text-lg mb-4">暂无文章</p>
              <button 
                onClick={importFromPeopleDaily}
                className="bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white font-semibold px-6 py-3 rounded-xl"
              >
                📥 导入文章
              </button>
            </div>
          )}

          {/* Article Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-4xl my-8 shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 lg:p-8 border-b border-[#e9ecef] flex-shrink-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl lg:text-3xl font-bold text-[#2b2d42] mb-2">{selectedArticle.title}</h2>
                      <p className="text-[#8d99ae]">{selectedArticle.titleZh}</p>
                    </div>
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="w-10 h-10 rounded-full bg-[#f8f9fa] hover:bg-[#e9ecef] flex items-center justify-center text-[#2b2d42] transition-all"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span 
                      className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: `${levelConfig[selectedArticle.level].color}15`,
                        color: levelConfig[selectedArticle.level].color
                      }}
                    >
                      {levelConfig[selectedArticle.level].icon} {levelConfig[selectedArticle.level].label}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f8f9fa] text-[#2b2d42]">
                      📰 {selectedArticle.source}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f8f9fa] text-[#2b2d42]">
                      📅 {selectedArticle.date}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 lg:p-8 overflow-y-auto flex-1">
                  <div className="mb-6">
                    <h3 className="font-bold text-[#2b2d42] mb-3 flex items-center gap-2 text-lg">
                      <span>🇬🇧</span> 英文原文
                    </h3>
                    <div className="prose max-w-none bg-[#f8f9fa] rounded-xl p-6">
                      <p className="text-[#2b2d42] leading-relaxed whitespace-pre-wrap text-base lg:text-lg">
                        {selectedArticle.content}
                      </p>
                    </div>
                  </div>
                  
                  {selectedArticle.contentZh && (
                    <div className="">
                      <h3 className="font-bold text-[#2b2d42] mb-3 flex items-center gap-2 text-lg">
                        <span>🇨🇳</span> 中文翻译
                      </h3>
                      <div className="prose max-w-none bg-gradient-to-br from-[#ef233c]/5 to-transparent rounded-xl p-6 border border-[#ef233c]/20">
                        <p className="text-[#2b2d42] leading-relaxed whitespace-pre-wrap text-base lg:text-lg">
                          {selectedArticle.contentZh}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#e9ecef] bg-[#f8f9fa] rounded-b-3xl flex-shrink-0">
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl">
                      🔊 朗读文章
                    </button>
                    <button className="flex-1 bg-white hover:bg-[#e9ecef] text-[#2b2d42] font-semibold py-4 rounded-xl transition-all border-2 border-[#e9ecef]">
                      📝 添加生词
                    </button>
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
