import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import WordCard from '../components/WordCard'
import api from '../utils/api'

interface Word {
  id: number
  word: string
  phonetic: string
  meanings: {
    pos: string
    definitions: string[]
  }[]
  examples: {
    en: string
    zh: string
    speaker?: string
  }[]
  backgroundImage?: string
  level: number
  nextReview: string
  tags: string[]
}

interface VocabSet {
  code: string
  name: string
  count: number
  icon: string
  color: string
}

export default function Ebbinghaus() {
  const [words, setWords] = useState<Word[]>([])
  const [reviewWords, setReviewWords] = useState<Word[]>([])
  const [currentReview, setCurrentReview] = useState<Word | null>(null)
  const [selectedVocab, setSelectedVocab] = useState<string>('cet4')
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([])

  useEffect(() => {
    loadVocabSets()
    loadWords()
  }, [selectedVocab])

  const loadVocabSets = async () => {
    try {
      const allVocabs = ['selfstudy', 'business', 'cet4', 'ielts']
      const counts = await Promise.all(
        allVocabs.map(async (vocab) => {
          try {
            const res = await api.get(`/words?vocab=${vocab}`)
            return res.data.length
          } catch {
            return 0
          }
        })
      )
      
      setVocabSets([
        { code: 'selfstudy', name: '自考英语', count: counts[0], icon: '📘', color: '#3b82f6' },
        { code: 'business', name: '商务英语', count: counts[1], icon: '💼', color: '#8b5cf6' },
        { code: 'cet4', name: '大学英语四级', count: counts[2], icon: '🎓', color: '#ef233c' },
        { code: 'ielts', name: '雅思', count: counts[3], icon: '🌍', color: '#10b981' },
      ])
    } catch (e) {
      console.error('Failed to load vocab sets', e)
    }
  }

  const loadWords = async () => {
    try {
      const [allWords, dueWords] = await Promise.all([
        api.get(`/words?vocab=${selectedVocab}`),
        api.get(`/words/due?vocab=${selectedVocab}`)
      ])
      setWords(allWords.data)
      setReviewWords(dueWords.data)
    } catch (e) {
      console.error('Failed to load words', e)
    }
  }

  const startReview = () => {
    if (reviewWords.length > 0) {
      setCurrentReview(reviewWords[0])
    }
  }

  const handleReview = async (known: boolean) => {
    if (!currentReview) return
    try {
      await api.put(`/words/${currentReview.id}/review`, { known })
      loadWords()
      setCurrentReview(null)
    } catch (e) {
      console.error('Failed to submit review', e)
    }
  }

  const parseWord = (word: any) => {
    try {
      return {
        ...word,
        meanings: word.meanings ? JSON.parse(word.meanings) : [],
        examples: word.examples ? JSON.parse(word.examples) : [],
        tags: word.tags ? JSON.parse(word.tags) : []
      }
    } catch (e) {
      console.error('Failed to parse word data', e)
      return word
    }
  }

  const handleImageChange = async (imageUrl: string) => {
    if (!currentReview) return
    try {
      await api.put(`/words/${currentReview.id}/image`, { backgroundImage: imageUrl })
      setCurrentReview({ ...currentReview, backgroundImage: imageUrl })
    } catch (e) {
      console.error('Failed to update image', e)
    }
  }

  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null)

  const importVocab = async () => {
    if (!selectedVocab) return
    
    const confirmMsg = `确定要导入「${selectedVocabData?.name}」吗？\n这可能需要一些时间...`
    if (!window.confirm(confirmMsg)) return

    setImporting(true)
    setImportProgress({ current: 0, total: 100 })

    try {
      const res = await api.post(`/words/import-batch?vocab=${selectedVocab}&batchSize=50`)
      setImportProgress({ current: res.data.count, total: res.data.total })
      
      setTimeout(() => {
        alert(`✅ ${res.data.message}\n\n📊 统计：\n- 新增：${res.data.createdCount || 0}\n- 更新：${res.data.updatedCount || 0}\n- 错误：${res.data.errorCount || 0}\n- 总计：${res.data.total}`)
        loadWords()
        loadVocabSets()
        setImportProgress(null)
      }, 500)
    } catch (e: any) {
      setImportProgress(null)
      alert(`❌ 导入失败：${e.response?.data?.error || e.message || '未知错误'}`)
    } finally {
      setImporting(false)
    }
  }

  const selectedVocabData = vocabSets.find(v => v.code === selectedVocab)

  const reviewStages = [
    { time: '30 分钟', label: '第一次复习', color: '#ef233c' },
    { time: '1 天', label: '第二次复习', color: '#f59e0b' },
    { time: '2 天', label: '第三次复习', color: '#3b82f6' },
    { time: '7 天', label: '第四次复习', color: '#10b981' },
    { time: '15 天', label: '第五次复习', color: '#8b5cf6' },
    { time: '30 天', label: '第六次复习', color: '#ec4899' },
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
                  <h1 className="text-4xl lg:text-5xl font-bold text-[#2b2d42] mb-2">🧠 艾宾浩斯记忆法</h1>
                  <p className="text-lg text-[#8d99ae]">科学记忆曲线，事半功倍！</p>
                </div>
              </div>
              <button 
                onClick={importVocab}
                disabled={importing}
                className={`group relative font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                  importing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {importing ? (
                    <>
                      <span className="animate-spin">⏳</span> 导入中...
                    </>
                  ) : (
                    <>
                      📥 导入整本词库
                    </>
                  )}
                </span>
              </button>
            </div>
          </header>

          {/* Vocab Selection */}
          <div className="group relative bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-500 mb-8 animate-slide-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#ef233c]/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📚</span>
                <div>
                  <h2 className="text-2xl font-bold text-[#2b2d42]">选择词库</h2>
                  <p className="text-sm text-[#8d99ae]">选择你要学习的词库</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vocabSets.map((vocab, index) => (
                  <button
                    key={vocab.code}
                    onClick={() => setSelectedVocab(vocab.code)}
                    className={`group relative p-6 rounded-2xl transition-all duration-300 overflow-hidden ${
                      selectedVocab === vocab.code
                        ? 'shadow-xl scale-105'
                        : 'bg-[#f8f9fa] hover:bg-[#e9ecef] hover:shadow-md'
                    }`}
                    style={{
                      background: selectedVocab === vocab.code 
                        ? `linear-gradient(135deg, ${vocab.color} 0%, ${vocab.color}dd 100%)`
                        : undefined,
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="relative z-10">
                      <span className="text-4xl mb-3 block">{vocab.icon}</span>
                      <p className={`font-bold mb-1 ${selectedVocab === vocab.code ? 'text-white' : 'text-[#2b2d42]'}`}>
                        {vocab.name}
                      </p>
                      <p className={`text-sm ${selectedVocab === vocab.code ? 'text-white/80' : 'text-[#8d99ae]'}`}>
                        {vocab.count} 词
                      </p>
                    </div>
                    
                    {/* Selected indicator */}
                    {selectedVocab === vocab.code && (
                      <div className="absolute top-3 right-3 text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Import Progress */}
          {importProgress && (
            <div className="bg-white rounded-2xl p-6 shadow-md mb-8 animate-slide-in">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-[#2b2d42]">📥 导入进度</span>
                <span className="text-sm text-[#8d99ae]">{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="h-3 bg-[#e9ecef] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Review Status */}
          <div className="group relative bg-white rounded-3xl p-10 shadow-md hover:shadow-xl transition-all duration-500 mb-8 animate-slide-in delay-1 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${reviewWords.length > 0 ? 'from-[#ef233c]/10 to-transparent' : 'from-[#10b981]/10 to-transparent'} transition-opacity duration-500`} />
            
            <div className="relative text-center">
              {reviewWords.length > 0 ? (
                <>
                  <div className="w-24 h-24 bg-gradient-to-br from-[#ef233c] to-[#d91e36] rounded-full flex items-center justify-center text-white text-5xl mx-auto mb-6 shadow-xl animate-pulse">
                    📚
                  </div>
                  <h2 className="text-3xl font-bold text-[#2b2d42] mb-3">
                    待复习单词：<span className="text-[#ef233c]">{reviewWords.length}</span> 个
                  </h2>
                  <p className="text-[#8d99ae] text-lg mb-8 max-w-md mx-auto">
                    是时候复习啦！根据艾宾浩斯遗忘曲线，现在复习效果最好～
                  </p>
                  <button 
                    onClick={startReview} 
                    className="group relative bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
                  >
                    <span className="flex items-center gap-2">
                      🚀 开始复习
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-white text-5xl mx-auto mb-6 shadow-xl animate-bounce">
                    ✅
                  </div>
                  <h2 className="text-3xl font-bold text-[#10b981] mb-3">太棒了！</h2>
                  <p className="text-[#8d99ae] text-lg">
                    所有单词都已复习完毕！继续保持哦～
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Ebbinghaus Curve */}
          <div className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-xl transition-all duration-500 mb-8 animate-slide-in delay-2">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">📈</span>
                <div>
                  <h2 className="text-2xl font-bold text-[#2b2d42]">艾宾浩斯遗忘曲线</h2>
                  <p className="text-sm text-[#8d99ae]">科学规划复习时间</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reviewStages.map((stage, index) => (
                  <div
                    key={index}
                    className="group/stage relative p-5 rounded-2xl text-center transition-all duration-300 hover:scale-105 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${stage.color}08 0%, ${stage.color}15 100%)`,
                      border: `2px solid ${stage.color}30`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover/stage:opacity-100 transition-opacity" />
                    <div className="relative">
                      <p 
                        className="text-xl font-bold mb-1"
                        style={{ color: stage.color }}
                      >
                        {stage.time}
                      </p>
                      <p className="text-xs text-[#8d99ae]">{stage.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Curve Visualization */}
              <div className="mt-8 pt-8 border-t border-[#e9ecef]">
                <div className="relative h-32">
                  {/* Simple curve SVG */}
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="90" x2="400" y2="90" stroke="#e9ecef" strokeWidth="1" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#e9ecef" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="10" x2="400" y2="10" stroke="#e9ecef" strokeWidth="1" strokeDasharray="4" />
                    
                    {/* Memory curve */}
                    <path
                      d="M 0 10 Q 50 60, 100 75 T 200 82 T 300 87 T 400 90"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef233c" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    
                    {/* Points */}
                    <circle cx="0" cy="10" r="5" fill="#ef233c" />
                    <circle cx="100" cy="75" r="5" fill="#f59e0b" />
                    <circle cx="200" cy="82" r="5" fill="#3b82f6" />
                    <circle cx="300" cy="87" r="5" fill="#10b981" />
                    <circle cx="400" cy="90" r="5" fill="#8b5cf6" />
                  </svg>
                  
                  {/* Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-[#8d99ae] pt-2">
                    <span>学习</span>
                    <span>30 分钟</span>
                    <span>1 天</span>
                    <span>7 天</span>
                    <span>30 天</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Word List */}
          <div className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-xl transition-all duration-500 animate-slide-in delay-3">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#3b82f6]/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2b2d42]">我的单词本</h2>
                    <p className="text-sm text-[#8d99ae]">{words.length} 个单词</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {words.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">📭</span>
                    <p className="text-[#8d99ae]">暂无单词，先导入词库吧！</p>
                  </div>
                ) : (
                  words.map((word, index) => (
                    <div 
                      key={word.id} 
                      className="group/item flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl hover:bg-gradient-to-r hover:from-[#ef233c]/10 hover:to-transparent transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ef233c]/10 to-transparent flex items-center justify-center text-lg font-bold text-[#ef233c]">
                          {word.word[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#2b2d42] group-hover/item:text-[#ef233c] transition-colors">
                            {word.word}
                          </p>
                          <p className="text-[#8d99ae] text-sm">/{word.phonetic}/</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#8d99ae] mb-1">下次复习</p>
                        <p className="text-sm font-medium text-[#2b2d42]">
                          {new Date(word.nextReview).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Review Modal */}
          {currentReview && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="relative max-w-4xl w-full animate-scale-in">
                <button
                  onClick={() => setCurrentReview(null)}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
                >
                  ✕
                </button>
                
                <WordCard
                  word={currentReview.word}
                  phonetic={currentReview.phonetic || ''}
                  meanings={parseWord(currentReview).meanings}
                  examples={parseWord(currentReview).examples}
                  backgroundImage={currentReview.backgroundImage}
                  onImageChange={handleImageChange}
                />

                {/* Review Actions */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleReview(false)} 
                    className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2 text-lg">
                      ❌ 不认识
                    </span>
                  </button>
                  <button 
                    onClick={() => handleReview(true)} 
                    className="group relative bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2 text-lg">
                      ✅ 认识
                    </span>
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
