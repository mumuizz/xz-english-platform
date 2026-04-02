import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../utils/api'

interface ListeningMaterial {
  id: number
  title: string
  titleZh: string
  audioUrl: string
  transcript?: string
  transcriptZh?: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  type: 'news' | 'dialogue' | 'lecture' | 'story'
  tags: string[]
}

export default function Listening() {
  const [materials, setMaterials] = useState<ListeningMaterial[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<ListeningMaterial | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/listening')
      setMaterials(res.data)
      if (res.data.length === 0) {
        setError('暂无听力材料，请点击右上角"📥 导入听力材料"')
      }
    } catch (e: any) {
      console.error('Failed to load materials', e)
      setError(e.response?.status === 401 ? '请先登录' : '加载失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  const importListeningMaterials = async () => {
    try {
      const res = await api.post('/listening/import')
      alert(`✅ ${res.data.message || '导入成功！'}`)
      loadMaterials()
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.message || '未知错误'
      alert(`❌ 导入失败：${errorMsg}`)
      console.error('Import error:', e)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const levelConfig = {
    beginner: { label: '初级', icon: '🟢', color: '#10b981' },
    intermediate: { label: '中级', icon: '🟡', color: '#f59e0b' },
    advanced: { label: '高级', icon: '🔴', color: '#ef233c' }
  }

  const typeConfig = {
    news: { icon: '📰', label: '新闻' },
    dialogue: { icon: '💬', label: '对话' },
    lecture: { icon: '🎓', label: '讲座' },
    story: { icon: '📖', label: '故事' }
  }

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
                  <h1 className="text-4xl lg:text-5xl font-bold text-[#2b2d42] mb-2">🎧 英语听力</h1>
                  <p className="text-lg text-[#8d99ae]">精听训练，提升听力水平</p>
                </div>
              </div>
              <button 
                onClick={importListeningMaterials} 
                className="group relative bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  📥 导入听力材料
                </span>
              </button>
            </div>
          </header>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-3xl p-16 text-center shadow-md animate-pulse">
              <span className="text-6xl mb-4 block animate-bounce">🎧</span>
              <p className="text-[#8d99ae] text-lg">正在加载听力材料...</p>
            </div>
          )}

          {/* Error/Empty State */}
          {!loading && error && (
            <div className="bg-white rounded-3xl p-16 text-center shadow-md animate-slide-in">
              <span className="text-6xl mb-4 block">😕</span>
              <p className="text-[#8d99ae] text-lg mb-6">{error}</p>
              {error.includes('导入') && (
                <button 
                  onClick={importListeningMaterials}
                  className="bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl"
                >
                  📥 立即导入
                </button>
              )}
            </div>
          )}

          {/* Materials Grid */}
          {!loading && !error && (
            <>
              {materials.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-md animate-slide-in">
                  <span className="text-6xl mb-4 block">🎧</span>
                  <p className="text-[#8d99ae] text-lg mb-6">暂无听力材料</p>
                  <button 
                    onClick={importListeningMaterials}
                    className="bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl"
                  >
                    📥 导入听力材料
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 animate-slide-in delay-1">
                  {materials.map((material, index) => (
                    <div
                      key={material.id}
                      onClick={() => setSelectedMaterial(material)}
                      className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden animate-scale-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ef233c]/10 to-transparent flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                          {typeConfig[material.type].icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-[#2b2d42] text-lg truncate group-hover:text-[#ef233c] transition-colors">
                              {material.title}
                            </h3>
                            <span 
                              className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
                              style={{ 
                                backgroundColor: `${levelConfig[material.level].color}15`,
                                color: levelConfig[material.level].color
                              }}
                            >
                              {levelConfig[material.level].icon} {levelConfig[material.level].label}
                            </span>
                          </div>
                          <p className="text-[#8d99ae] text-sm mb-3 truncate">{material.titleZh}</p>
                          
                          <div className="flex items-center justify-between text-sm text-[#8d99ae]">
                            <span className="flex items-center gap-1">
                              ⏱️ {formatTime(material.duration)}
                            </span>
                            <span className="text-xs bg-[#f8f9fa] px-2 py-1 rounded">
                              {typeConfig[material.type].label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Play Button on Hover */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#ef233c] to-[#d91e36] rounded-full flex items-center justify-center text-white shadow-lg">
                          ▶️
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Player Modal */}
          {selectedMaterial && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-[#e9ecef] flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#2b2d42] mb-2">
                        {typeConfig[selectedMaterial.type].icon} {selectedMaterial.title}
                      </h2>
                      <p className="text-[#8d99ae]">{selectedMaterial.titleZh}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMaterial(null)
                        setIsPlaying(false)
                      }}
                      className="w-10 h-10 rounded-full bg-[#f8f9fa] hover:bg-[#e9ecef] flex items-center justify-center text-[#2b2d42] transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Player */}
                <div className="p-6 lg:p-8 flex-shrink-0">
                  {/* Album Art / Visual */}
                  <div className="w-full h-48 bg-gradient-to-br from-[#ef233c] via-[#d91e36] to-[#c41c30] rounded-2xl flex items-center justify-center mb-6 shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 text-center">
                      <span className="text-7xl mb-4 block">{typeConfig[selectedMaterial.type].icon}</span>
                      <p className="text-white/80 font-medium">{typeConfig[selectedMaterial.type].label}</p>
                    </div>
                    {/* Animated Waves */}
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-1 pb-4">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-white/30 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 40 + 10}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <input
                      type="range"
                      min="0"
                      max={selectedMaterial.duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-[#e9ecef] rounded-full appearance-none cursor-pointer accent-[#ef233c]"
                    />
                    <div className="flex justify-between text-sm text-[#8d99ae] mt-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(selectedMaterial.duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = Math.max(0, currentTime - 10)
                        }
                      }}
                      className="w-12 h-12 rounded-full bg-[#f8f9fa] hover:bg-[#e9ecef] flex items-center justify-center text-xl transition-all"
                    >
                      ⏪
                    </button>
                    <button
                      onClick={togglePlay}
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] flex items-center justify-center text-3xl text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = Math.min(selectedMaterial.duration, currentTime + 10)
                        }
                      }}
                      className="w-12 h-12 rounded-full bg-[#f8f9fa] hover:bg-[#e9ecef] flex items-center justify-center text-xl transition-all"
                    >
                      ⏩
                    </button>
                  </div>

                  {/* Speed Control */}
                  <div className="flex justify-center gap-2 flex-wrap">
                    <span className="text-sm text-[#8d99ae] py-2">播放速度:</span>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate)
                          if (audioRef.current) {
                            audioRef.current.playbackRate = rate
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          playbackRate === rate
                            ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white shadow-md'
                            : 'bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#2b2d42]'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Hidden Audio */}
                  <audio
                    ref={audioRef}
                    src={selectedMaterial.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>

                {/* Transcript */}
                {selectedMaterial.transcript && (
                  <div className="p-6 lg:p-8 border-t border-[#e9ecef] overflow-y-auto flex-1">
                    <div className="mb-4">
                      <h3 className="font-bold text-[#2b2d42] mb-3 flex items-center gap-2">
                        📝 听力原文
                      </h3>
                      <div className="bg-[#f8f9fa] rounded-xl p-4 max-h-40 overflow-y-auto">
                        <p className="text-[#2b2d42] leading-relaxed whitespace-pre-wrap text-sm">
                          {selectedMaterial.transcript}
                        </p>
                      </div>
                    </div>

                    {selectedMaterial.transcriptZh && (
                      <div>
                        <h3 className="font-bold text-[#2b2d42] mb-3 flex items-center gap-2">
                          🇨 中文翻译
                        </h3>
                        <div className="bg-gradient-to-br from-[#ef233c]/5 to-transparent rounded-xl p-4 max-h-40 overflow-y-auto border border-[#ef233c]/20">
                          <p className="text-[#2b2d42] leading-relaxed whitespace-pre-wrap text-sm">
                            {selectedMaterial.transcriptZh}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#e9ecef] bg-[#f8f9fa] rounded-b-3xl flex-shrink-0">
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white hover:bg-[#e9ecef] text-[#2b2d42] font-semibold py-4 rounded-xl transition-all border-2 border-[#e9ecef]">
                      📝 听写练习
                    </button>
                    <button className="flex-1 bg-white hover:bg-[#e9ecef] text-[#2b2d42] font-semibold py-4 rounded-xl transition-all border-2 border-[#e9ecef]">
                      ❓ 理解测试
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
