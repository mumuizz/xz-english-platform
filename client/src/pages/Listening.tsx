import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import AudioPlayer from '../components/listening/AudioPlayer'
import QuizSection from '../components/listening/QuizSection'
import DictationSection from '../components/listening/DictationSection'
import WrongNotebook from '../components/listening/WrongNotebook'
import StudyRecords from '../components/listening/StudyRecords'
import { levelConfig, listeningTypeConfig } from '../constants/theme'
import { quizBank, dictationBank } from '../data/listeningQuiz'
import { formatTime } from '../components/listening/AudioPlayer'
import api from '../utils/api'
import type { ListeningMaterial, WrongQuestion, StudyRecord, LevelFilter } from '../types'

type SceneFilter = 'all' | 'exam-focus' | 'easy-listening'

export default function Listening() {
  const [materials, setMaterials] = useState<ListeningMaterial[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<ListeningMaterial | null>(null)
  const [scene, setScene] = useState<SceneFilter>('all')
  const [level, setLevel] = useState<LevelFilter>('all')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [wrongNotebook, setWrongNotebook] = useState<WrongQuestion[]>([])
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([])
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null)
  const [dictationScore, setDictationScore] = useState<{ score: number; total: number } | null>(null)

  useEffect(() => { void loadMaterials() }, [])
  useEffect(() => {
    setQuizScore(null)
    setDictationScore(null)
  }, [selectedMaterial])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get<ListeningMaterial[]>('/listening')
      setMaterials(res.data)
      if (res.data.length === 0) setError('当前没有听力材料，请先导入。')
    } catch (e: any) {
      console.error('Failed to load listening materials', e)
      setError(e?.response?.data?.error || '加载听力材料失败')
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
    } catch (e: any) {
      alert(e?.response?.data?.error || '导入听力材料失败')
    } finally {
      setImporting(false)
    }
  }

  const filteredMaterials = useMemo(
    () => materials.filter((item) => (scene === 'all' || item.tags.includes(scene)) && (level === 'all' || item.level === level)),
    [materials, scene, level]
  )

  const quizQuestions = useMemo(() => selectedMaterial ? quizBank[selectedMaterial.title] || [] : [], [selectedMaterial])
  const dictationSegments = useMemo(() => selectedMaterial ? dictationBank[selectedMaterial.title] || [] : [], [selectedMaterial])

  const handleWrongQuestions = (items: WrongQuestion[]) => {
    setWrongNotebook((prev) => {
      const next = [...prev]
      items.forEach((item) => {
        if (!next.some((r) => r.materialTitle === item.materialTitle && r.questionId === item.questionId)) next.unshift(item)
      })
      return next
    })
  }

  const saveStudyRecord = () => {
    if (!selectedMaterial || !quizScore || !dictationScore) return
    const record: StudyRecord = {
      materialTitle: selectedMaterial.title,
      quizScore: `${quizScore.score}/${quizScore.total}`,
      dictationScore: `${dictationScore.score}/${dictationScore.total}`,
      createdAt: new Date().toLocaleString('zh-CN'),
    }
    setStudyRecords((prev) => [record, ...prev])
  }

  return (
    <Layout>
      <div className="space-y-8">
        <header className="rounded-3xl bg-white p-8 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2b2d42]">英语听力</h1>
              <p className="mt-3 max-w-3xl text-[#8d99ae]">题目模式、听写模式、错题再练和学习记录已经接通，训练结果开始累计。</p>
            </div>
            <button onClick={importMaterials} disabled={importing} className={`rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition ${importing ? 'cursor-not-allowed bg-gray-400' : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:scale-[1.02]'}`}>
              {importing ? '导入中...' : '导入听力材料'}
            </button>
          </div>
        </header>

        {studyRecords.length > 0 && <StudyRecords records={studyRecords} />}
        {wrongNotebook.length > 0 && <WrongNotebook items={wrongNotebook} />}

        {/* Filters */}
        <section className="rounded-3xl bg-white p-6 shadow-md">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-3 text-sm font-semibold text-[#2b2d42]">场景筛选</div>
              <div className="flex flex-wrap gap-3">
                {[{ key: 'all', label: '全部' }, { key: 'exam-focus', label: '自考导向' }, { key: 'easy-listening', label: '空闲磨耳朵' }].map((item) => (
                  <button key={item.key} onClick={() => setScene(item.key as SceneFilter)} className={`rounded-xl px-5 py-2.5 font-medium transition ${scene === item.key ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white shadow-md' : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 text-sm font-semibold text-[#2b2d42]">难度筛选</div>
              <div className="flex flex-wrap gap-3">
                {[{ key: 'all', label: '全部' }, { key: 'beginner', label: '初级' }, { key: 'intermediate', label: '中级' }, { key: 'advanced', label: '高级' }].map((item) => (
                  <button key={item.key} onClick={() => setLevel(item.key as LevelFilter)} className={`rounded-xl px-5 py-2.5 font-medium transition ${level === item.key ? 'bg-gradient-to-r from-[#2b2d42] to-[#3f4564] text-white shadow-md' : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Material List */}
        {loading ? (
          <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">正在加载听力材料...</div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">
            <div>{error}</div>
            <button onClick={importMaterials} className="mt-6 rounded-2xl bg-gradient-to-r from-[#ef233c] to-[#d91e36] px-6 py-3 font-semibold text-white">导入听力材料</button>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {filteredMaterials.map((material) => (
              <button key={material.id} onClick={() => setSelectedMaterial(material)} className="rounded-3xl bg-white p-6 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ef233c]/10 text-2xl font-bold text-[#ef233c]">
                    {listeningTypeConfig[material.type].icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-bold text-[#2b2d42]">{material.title}</div>
                        <div className="mt-1 text-sm text-[#8d99ae]">{material.titleZh}</div>
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: levelConfig[material.level].color, backgroundColor: `${levelConfig[material.level].color}15` }}>
                        {levelConfig[material.level].label}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">{material.tags.includes('exam-focus') ? '自考导向' : '磨耳朵'}</span>
                      <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">{listeningTypeConfig[material.type].label}</span>
                      <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">时长 {formatTime(material.duration)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </section>
        )}

        {/* Material Detail Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-[#e9ecef] p-6">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold text-[#2b2d42]">{selectedMaterial.title}</h2>
                  <p className="mt-2 text-[#8d99ae]">{selectedMaterial.titleZh}</p>
                </div>
                <button onClick={() => setSelectedMaterial(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] text-[#2b2d42]">X</button>
              </div>
              <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr,1fr,1fr] lg:p-8">
                <div className="space-y-6">
                  <AudioPlayer material={selectedMaterial} />
                  <div className="rounded-2xl bg-[#f8f9fa] p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">{selectedMaterial.transcript || '暂无原文'}</div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#ef233c]/20 bg-gradient-to-br from-[#ef233c]/5 to-transparent p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">{selectedMaterial.transcriptZh || '暂无中文对照'}</div>
                  <DictationSection segments={dictationSegments} onScoreReady={(s, t) => setDictationScore({ score: s, total: t })} />
                </div>
                <div>
                  <QuizSection
                    questions={quizQuestions}
                    materialTitle={selectedMaterial.title}
                    onWrongQuestions={handleWrongQuestions}
                    onScoreReady={(s, t) => setQuizScore({ score: s, total: t })}
                  />
                  {quizScore && dictationScore && (
                    <button onClick={saveStudyRecord} className="mt-4 w-full rounded-2xl bg-[#2b2d42] px-5 py-3 font-semibold text-white">保存本次学习记录</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
