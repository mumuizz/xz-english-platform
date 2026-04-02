import { useEffect, useMemo, useRef, useState } from 'react'
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
  tags: string
}

const levelConfig = {
  beginner: { label: '初级', color: '#10b981' },
  intermediate: { label: '中级', color: '#f59e0b' },
  advanced: { label: '高级', color: '#ef233c' }
}

const typeConfig = {
  news: { label: '新闻', icon: 'N' },
  dialogue: { label: '对话', icon: 'D' },
  lecture: { label: '讲解', icon: 'L' },
  story: { label: '磨耳朵', icon: 'S' }
}

type SceneFilter = 'all' | 'exam-focus' | 'easy-listening'

export default function Listening() {
  const [materials, setMaterials] = useState<ListeningMaterial[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<ListeningMaterial | null>(null)
  const [scene, setScene] = useState<SceneFilter>('all')
  const [level, setLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    void loadMaterials()
  }, [])

  useEffect(() => {
    setCurrentTime(0)
    setIsPlaying(false)
  }, [selectedMaterial])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get<ListeningMaterial[]>('/listening')
      setMaterials(res.data)
      if (res.data.length === 0) {
        setError('当前没有听力材料，请先导入。')
      }
    } catch (error: any) {
      console.error('Failed to load listening materials', error)
      setError(error?.response?.data?.error || '加载听力材料失败')
    } finally {
      setLoading(false)
    }
  }

  const importMaterials = async () => {
    try {
      setImporting(true)
      const res = await api.post('/listening/import')
      alert(`${res.data.message}\n共导入 ${res.data.count} 条材料`)
      await loadMaterials()
    } catch (error: any) {
      alert(error?.response?.data?.error || '导入听力材料失败')
    } finally {
      setImporting(false)
    }
  }

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchScene = scene === 'all' || item.tags?.includes(scene)
      const matchLevel = level === 'all' || item.level === level
      return matchScene && matchLevel
    })
  }, [level, materials, scene])

  const togglePlay = async () => {
    if (!audioRef.current) {
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Failed to play audio', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#edf2f4]">
      <Sidebar />
      <div className="ml-0 md:ml-72 p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="rounded-3xl bg-white p-8 shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#2b2d42]">英语听力</h1>
                <p className="mt-3 max-w-3xl text-[#8d99ae]">
                  听力内容拆成两条线：一条是贴合自考的考试导向听力，另一条是空闲时间可直接播放的磨耳朵材料；每条材料继续区分初级、中级、高级。
                </p>
              </div>
              <button
                onClick={importMaterials}
                disabled={importing}
                className={`rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition ${
                  importing
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:scale-[1.02]'
                }`}
              >
                {importing ? '导入中...' : '导入听力材料'}
              </button>
            </div>
          </header>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-3 text-sm font-semibold text-[#2b2d42]">场景筛选</div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'all', label: '全部' },
                    { key: 'exam-focus', label: '自考导向' },
                    { key: 'easy-listening', label: '空闲磨耳朵' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setScene(item.key as SceneFilter)}
                      className={`rounded-xl px-5 py-2.5 font-medium transition ${
                        scene === item.key
                          ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white shadow-md'
                          : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold text-[#2b2d42]">难度筛选</div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'all', label: '全部' },
                    { key: 'beginner', label: '初级' },
                    { key: 'intermediate', label: '中级' },
                    { key: 'advanced', label: '高级' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setLevel(item.key as typeof level)}
                      className={`rounded-xl px-5 py-2.5 font-medium transition ${
                        level === item.key
                          ? 'bg-gradient-to-r from-[#2b2d42] to-[#3f4564] text-white shadow-md'
                          : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">正在加载听力材料...</div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">
              <div>{error}</div>
              <button
                onClick={importMaterials}
                className="mt-6 rounded-2xl bg-gradient-to-r from-[#ef233c] to-[#d91e36] px-6 py-3 font-semibold text-white"
              >
                导入听力材料
              </button>
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2">
              {filteredMaterials.map((material) => (
                <button
                  key={material.id}
                  onClick={() => setSelectedMaterial(material)}
                  className="rounded-3xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ef233c]/10 text-2xl font-bold text-[#ef233c]">
                      {typeConfig[material.type].icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-[#2b2d42]">{material.title}</div>
                          <div className="mt-1 text-sm text-[#8d99ae]">{material.titleZh}</div>
                        </div>
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            color: levelConfig[material.level].color,
                            backgroundColor: `${levelConfig[material.level].color}15`
                          }}
                        >
                          {levelConfig[material.level].label}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">
                          {material.tags.includes('exam-focus') ? '自考导向' : '磨耳朵'}
                        </span>
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">
                          {typeConfig[material.type].label}
                        </span>
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">
                          时长 {formatTime(material.duration)}
                        </span>
                      </div>

                      <div className="mt-4 line-clamp-3 text-sm leading-7 text-[#4b5563]">
                        {material.transcript}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </section>
          )}

          {!loading && !error && filteredMaterials.length === 0 && (
            <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">
              当前筛选条件下没有材料。
            </div>
          )}

          {selectedMaterial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#e9ecef] p-6">
                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold text-[#2b2d42]">{selectedMaterial.title}</h2>
                    <p className="mt-2 text-[#8d99ae]">{selectedMaterial.titleZh}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <span
                        className="rounded-full px-3 py-1 font-semibold"
                        style={{
                          color: levelConfig[selectedMaterial.level].color,
                          backgroundColor: `${levelConfig[selectedMaterial.level].color}15`
                        }}
                      >
                        {levelConfig[selectedMaterial.level].label}
                      </span>
                      <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">
                        {selectedMaterial.tags.includes('exam-focus') ? '自考导向' : '空闲磨耳朵'}
                      </span>
                      <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">
                        {typeConfig[selectedMaterial.type].label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMaterial(null)
                      setIsPlaying(false)
                      if (audioRef.current) {
                        audioRef.current.pause()
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] text-[#2b2d42] transition hover:bg-[#e9ecef]"
                  >
                    X
                  </button>
                </div>

                <div className="overflow-y-auto p-6 lg:p-8">
                  <div className="rounded-3xl bg-gradient-to-br from-[#ef233c] to-[#c41c30] p-8 text-white shadow-xl">
                    <div className="text-sm uppercase tracking-[0.2em] text-white/70">
                      {selectedMaterial.tags.includes('exam-focus') ? 'Exam Focus' : 'Easy Listening'}
                    </div>
                    <div className="mt-2 text-2xl font-bold">{typeConfig[selectedMaterial.type].label}</div>
                    <div className="mt-6">
                      <input
                        type="range"
                        min="0"
                        max={selectedMaterial.duration}
                        value={currentTime}
                        onChange={(event) => {
                          const time = Number.parseFloat(event.target.value)
                          setCurrentTime(time)
                          if (audioRef.current) {
                            audioRef.current.currentTime = time
                          }
                        }}
                        className="w-full accent-white"
                      />
                      <div className="mt-2 flex justify-between text-sm text-white/80">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(selectedMaterial.duration)}</span>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="rounded-2xl bg-white px-6 py-3 font-semibold text-[#ef233c] transition hover:bg-white/90"
                      >
                        {isPlaying ? '暂停' : '播放'}
                      </button>
                      {[0.75, 1, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate)
                            if (audioRef.current) {
                              audioRef.current.playbackRate = rate
                            }
                          }}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            playbackRate === rate ? 'bg-white text-[#ef233c]' : 'bg-white/15 text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                    <audio
                      ref={audioRef}
                      src={selectedMaterial.audioUrl}
                      onTimeUpdate={() => {
                        if (audioRef.current) {
                          setCurrentTime(audioRef.current.currentTime)
                        }
                      }}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-4 text-lg font-bold text-[#2b2d42]">英文原文</h3>
                      <div className="rounded-2xl bg-[#f8f9fa] p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">
                        {selectedMaterial.transcript || '暂无原文'}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-4 text-lg font-bold text-[#2b2d42]">中文对照</h3>
                      <div className="rounded-2xl border border-[#ef233c]/20 bg-gradient-to-br from-[#ef233c]/5 to-transparent p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">
                        {selectedMaterial.transcriptZh || '暂无中文对照'}
                      </div>
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
