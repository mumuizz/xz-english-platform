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

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  answer: string
  explanation: string
}

interface DictationSegment {
  id: string
  prompt: string
  answer: string
}

interface WrongQuestion {
  materialTitle: string
  questionId: string
  question: string
  selectedAnswer: string
  correctAnswer: string
  explanation: string
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

const quizBank: Record<string, QuizQuestion[]> = {
  'Self-study Exam Dialogue: Registration Day': [
    { id: 'q1', question: '考生最晚应几点前到达？', options: ['8:00', '8:30', '9:00', '9:30'], answer: '8:30', explanation: '九点开考，至少提前三十分钟。' },
    { id: 'q2', question: '考生需要自带什么？', options: ['耳机', '身份证件和黑色签字笔', '录音机', '电脑'], answer: '身份证件和黑色签字笔', explanation: '设备由考点提供。' }
  ],
  'Self-study Exam Passage: Study Schedule': [
    { id: 'q1', question: '学习计划包含几部分？', options: ['两部分', '三部分', '四部分', '五部分'], answer: '三部分', explanation: '原文明确说 three parts。' },
    { id: 'q2', question: '哪项能帮助发现反复错误？', options: ['短时复习', '集中听力', '每周阅读总结', '口语模仿'], answer: '每周阅读总结', explanation: 'weekly summary 用于发现 repeated mistakes。' }
  ],
  'Self-study Advanced Listening: Education Policy Talk': [
    { id: 'q1', question: '应重点注意哪类信号？', options: ['时间信号', '数字信号', '转折信号', '情绪信号'], answer: '转折信号', explanation: '原文强调 contrast signals。' },
    { id: 'q2', question: '主要考查什么？', options: ['拼写速度', '区分过去与当前改革', '背诵全文', '写作结构'], answer: '区分过去与当前改革', explanation: '原文直接说明。' }
  ],
  'Easy Listening: Morning Commute English': [
    { id: 'q1', question: '通勤练习优先关注什么？', options: ['每个单词', '核心意思和重复表达', '语法术语', '标题'], answer: '核心意思和重复表达', explanation: '原文直接这样说。' },
    { id: 'q2', question: '这种练习的主要价值是什么？', options: ['提高写作速度', '把碎片时间变成稳定输入', '快速通过考试', '记住词根'], answer: '把碎片时间变成稳定输入', explanation: 'free time 变 steady exposure。' }
  ],
  'Easy Listening: Health Podcast Summary': [
    { id: 'q1', question: '更有效的方法是什么？', options: ['工作更久', '减少交流', '更好地休息', '多喝咖啡'], answer: '更好地休息', explanation: '原文强调 better rest。' },
    { id: 'q2', question: '哪一项没有被建议？', options: ['睡前减少看屏幕', '保持固定作息', '白天散步', '凌晨学到很晚'], answer: '凌晨学到很晚', explanation: '与原文建议相反。' }
  ],
  'Easy Listening Advanced: Workplace Communication': [
    { id: 'q1', question: '清晰沟通的价值是什么？', options: ['更强硬', '避免误解并节省时间', '减少会议', '提升口音'], answer: '避免误解并节省时间', explanation: '原文直接给出。' },
    { id: 'q2', question: '高效职场人士不会怎样做？', options: ['尽早说明预期', '写下决定', '等小问题变大再处理', '提前提风险'], answer: '等小问题变大再处理', explanation: '原文强调提前处理。' }
  ]
}

const dictationBank: Record<string, DictationSegment[]> = {
  'Self-study Exam Dialogue: Registration Day': [
    { id: 'd1', prompt: '听写：listening ___ starts at nine o’clock sharp', answer: 'section' },
    { id: 'd2', prompt: '听写：arrive at least ___ minutes early', answer: 'thirty' }
  ],
  'Self-study Exam Passage: Study Schedule': [
    { id: 'd1', prompt: '听写：include ___ parts', answer: 'three' },
    { id: 'd2', prompt: '听写：trains attention to ___', answer: 'details' }
  ],
  'Self-study Advanced Listening: Education Policy Talk': [
    { id: 'd1', prompt: '听写：topic ___ of each section', answer: 'sentence' },
    { id: 'd2', prompt: '听写：contrast ___', answer: 'signals' }
  ],
  'Easy Listening: Morning Commute English': [
    { id: 'd1', prompt: '听写：catch the ___', answer: 'subway' },
    { id: 'd2', prompt: '听写：repeated ___', answer: 'expressions' }
  ],
  'Easy Listening: Health Podcast Summary': [
    { id: 'd1', prompt: '听写：better ___ can be more effective', answer: 'rest' },
    { id: 'd2', prompt: '听写：before ___', answer: 'bed' }
  ],
  'Easy Listening Advanced: Workplace Communication': [
    { id: 'd1', prompt: '听写：prevents ___', answer: 'misunderstanding' },
    { id: 'd2', prompt: '听写：in ___', answer: 'writing' }
  ]
}

type SceneFilter = 'all' | 'exam-focus' | 'easy-listening'

const normalize = (value: string) => value.trim().toLowerCase()

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
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [dictationAnswers, setDictationAnswers] = useState<Record<string, string>>({})
  const [dictationSubmitted, setDictationSubmitted] = useState(false)
  const [wrongNotebook, setWrongNotebook] = useState<WrongQuestion[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    void loadMaterials()
  }, [])

  useEffect(() => {
    setCurrentTime(0)
    setIsPlaying(false)
    setAnswers({})
    setSubmitted(false)
    setDictationAnswers({})
    setDictationSubmitted(false)
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

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchScene = scene === 'all' || item.tags.includes(scene)
      const matchLevel = level === 'all' || item.level === level
      return matchScene && matchLevel
    })
  }, [materials, scene, level])

  const quizQuestions = useMemo(() => selectedMaterial ? quizBank[selectedMaterial.title] || [] : [], [selectedMaterial])
  const dictationSegments = useMemo(() => selectedMaterial ? dictationBank[selectedMaterial.title] || [] : [], [selectedMaterial])

  const score = useMemo(() => quizQuestions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? 1 : 0), 0), [answers, quizQuestions])
  const dictationScore = useMemo(() => dictationSegments.reduce((sum, s) => sum + (normalize(dictationAnswers[s.id] || '') === normalize(s.answer) ? 1 : 0), 0), [dictationAnswers, dictationSegments])

  const togglePlay = async () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (e) {
      console.error('Failed to play audio', e)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const submitQuiz = () => {
    if (!selectedMaterial) return
    setSubmitted(true)
    const wrongItems = quizQuestions.filter((q) => answers[q.id] !== q.answer).map((q) => ({
      materialTitle: selectedMaterial.title,
      questionId: q.id,
      question: q.question,
      selectedAnswer: answers[q.id] || '未作答',
      correctAnswer: q.answer,
      explanation: q.explanation
    }))
    setWrongNotebook((prev) => {
      const next = [...prev]
      wrongItems.forEach((item) => {
        if (!next.some((r) => r.materialTitle === item.materialTitle && r.questionId === item.questionId)) {
          next.unshift(item)
        }
      })
      return next
    })
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
                <p className="mt-3 max-w-3xl text-[#8d99ae]">新增题目模式、听写模式和错题本，训练链路已经闭环。</p>
              </div>
              <button
                onClick={importMaterials}
                disabled={importing}
                className={`rounded-2xl px-6 py-4 font-semibold text-white shadow-lg transition ${importing ? 'cursor-not-allowed bg-gray-400' : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:scale-[1.02]'}`}
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
                    <button key={item.key} onClick={() => setScene(item.key as SceneFilter)} className={`rounded-xl px-5 py-2.5 font-medium transition ${scene === item.key ? 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] text-white shadow-md' : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'}`}>{item.label}</button>
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
                    <button key={item.key} onClick={() => setLevel(item.key as typeof level)} className={`rounded-xl px-5 py-2.5 font-medium transition ${level === item.key ? 'bg-gradient-to-r from-[#2b2d42] to-[#3f4564] text-white shadow-md' : 'bg-[#f8f9fa] text-[#2b2d42] hover:bg-[#e9ecef]'}`}>{item.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {wrongNotebook.length > 0 && (
            <section className="rounded-3xl bg-white p-8 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#2b2d42]">错题本</h2>
                  <p className="mt-2 text-sm text-[#8d99ae]">提交后自动记录错题。</p>
                </div>
                <div className="rounded-full bg-[#2b2d42] px-4 py-2 text-sm font-semibold text-white">{wrongNotebook.length} 题</div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {wrongNotebook.map((item) => (
                  <div key={`${item.materialTitle}-${item.questionId}`} className="rounded-2xl border border-[#e9ecef] bg-[#f8f9fa] p-5">
                    <div className="text-sm text-[#8d99ae]">{item.materialTitle}</div>
                    <div className="mt-2 font-semibold text-[#2b2d42]">{item.question}</div>
                    <div className="mt-3 text-sm text-[#991b1b]">你的答案：{item.selectedAnswer}</div>
                    <div className="mt-1 text-sm text-[#065f46]">正确答案：{item.correctAnswer}</div>
                    <div className="mt-3 rounded-xl bg-white p-4 text-sm leading-6 text-[#4b5563]">{item.explanation}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

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
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ef233c]/10 text-2xl font-bold text-[#ef233c]">{typeConfig[material.type].icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold text-[#2b2d42]">{material.title}</div>
                          <div className="mt-1 text-sm text-[#8d99ae]">{material.titleZh}</div>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: levelConfig[material.level].color, backgroundColor: `${levelConfig[material.level].color}15` }}>{levelConfig[material.level].label}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">{material.tags.includes('exam-focus') ? '自考导向' : '磨耳朵'}</span>
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">{typeConfig[material.type].label}</span>
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">时长 {formatTime(material.duration)}</span>
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">{quizBank[material.title]?.length || 0} 题</span>
                        <span className="rounded-full bg-[#f8f9fa] px-3 py-1 font-semibold text-[#2b2d42]">{dictationBank[material.title]?.length || 0} 段听写</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </section>
          )}

          {!loading && !error && filteredMaterials.length === 0 && (
            <div className="rounded-3xl bg-white p-16 text-center text-[#8d99ae] shadow-md">当前筛选条件下没有材料。</div>
          )}

          {selectedMaterial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#e9ecef] p-6">
                  <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold text-[#2b2d42]">{selectedMaterial.title}</h2>
                    <p className="mt-2 text-[#8d99ae]">{selectedMaterial.titleZh}</p>
                  </div>
                  <button onClick={() => { setSelectedMaterial(null); setIsPlaying(false); audioRef.current?.pause() }} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] text-[#2b2d42] transition hover:bg-[#e9ecef]">X</button>
                </div>

                <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1fr,1fr,1fr] lg:p-8">
                  <div className="space-y-6">
                    <div className="rounded-3xl bg-gradient-to-br from-[#ef233c] to-[#c41c30] p-8 text-white shadow-xl">
                      <div className="text-sm uppercase tracking-[0.2em] text-white/70">{selectedMaterial.tags.includes('exam-focus') ? 'Exam Focus' : 'Easy Listening'}</div>
                      <div className="mt-2 text-2xl font-bold">{typeConfig[selectedMaterial.type].label}</div>
                      <div className="mt-6">
                        <input type="range" min="0" max={selectedMaterial.duration} value={currentTime} onChange={(event) => { const time = Number.parseFloat(event.target.value); setCurrentTime(time); if (audioRef.current) audioRef.current.currentTime = time }} className="w-full accent-white" />
                        <div className="mt-2 flex justify-between text-sm text-white/80">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(selectedMaterial.duration)}</span>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button onClick={togglePlay} className="rounded-2xl bg-white px-6 py-3 font-semibold text-[#ef233c] transition hover:bg-white/90">{isPlaying ? '暂停' : '播放'}</button>
                        {[0.75, 1, 1.25, 1.5].map((rate) => (
                          <button key={rate} onClick={() => { setPlaybackRate(rate); if (audioRef.current) audioRef.current.playbackRate = rate }} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${playbackRate === rate ? 'bg-white text-[#ef233c]' : 'bg-white/15 text-white'}`}>{rate}x</button>
                        ))}
                      </div>
                      <audio ref={audioRef} src={selectedMaterial.audioUrl} onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime) }} onEnded={() => setIsPlaying(false)} />
                    </div>
                    <div className="rounded-2xl bg-[#f8f9fa] p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">{selectedMaterial.transcript || '暂无原文'}</div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-[#ef233c]/20 bg-gradient-to-br from-[#ef233c]/5 to-transparent p-6 text-base leading-8 text-[#2b2d42] whitespace-pre-wrap">{selectedMaterial.transcriptZh || '暂无中文对照'}</div>
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#2b2d42]">听写模式</h3>
                        {dictationSubmitted && <span className="rounded-full bg-[#2b2d42] px-3 py-1 text-sm font-semibold text-white">得分 {dictationScore}/{dictationSegments.length}</span>}
                      </div>
                      <div className="space-y-4">
                        {dictationSegments.map((segment, index) => {
                          const correct = normalize(dictationAnswers[segment.id] || '') === normalize(segment.answer)
                          return (
                            <div key={segment.id} className="rounded-2xl border border-[#e9ecef] bg-white p-5">
                              <div className="font-semibold text-[#2b2d42]">{index + 1}. {segment.prompt}</div>
                              <input value={dictationAnswers[segment.id] || ''} onChange={(event) => setDictationAnswers((prev) => ({ ...prev, [segment.id]: event.target.value }))} disabled={dictationSubmitted} placeholder="输入听写结果" className="mt-4 w-full rounded-xl border border-[#d1d5db] px-4 py-3 outline-none transition focus:border-[#2b2d42]" />
                              {dictationSubmitted && <div className={`mt-4 rounded-xl p-4 text-sm ${correct ? 'bg-[#10b981]/10 text-[#065f46]' : 'bg-[#ef233c]/10 text-[#991b1b]'}`}>{correct ? '听写正确' : `正确答案：${segment.answer}`}</div>}
                            </div>
                          )
                        })}
                      </div>
                      {dictationSegments.length > 0 && (
                        <div className="mt-4 flex gap-3">
                          <button onClick={() => setDictationSubmitted(true)} disabled={dictationSubmitted || Object.keys(dictationAnswers).length < dictationSegments.length} className={`flex-1 rounded-2xl px-5 py-3 font-semibold text-white transition ${dictationSubmitted || Object.keys(dictationAnswers).length < dictationSegments.length ? 'cursor-not-allowed bg-gray-400' : 'bg-gradient-to-r from-[#2b2d42] to-[#3f4564] hover:scale-[1.01]'}`}>提交听写</button>
                          <button onClick={() => { setDictationAnswers({}); setDictationSubmitted(false) }} className="rounded-2xl border border-[#d1d5db] px-5 py-3 font-semibold text-[#2b2d42] transition hover:bg-[#f8f9fa]">重做</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#2b2d42]">题目模式</h3>
                      {submitted && <span className="rounded-full bg-[#2b2d42] px-3 py-1 text-sm font-semibold text-white">得分 {score}/{quizQuestions.length}</span>}
                    </div>
                    <div className="space-y-4">
                      {quizQuestions.map((question, index) => (
                        <div key={question.id} className="rounded-2xl border border-[#e9ecef] bg-white p-5">
                          <div className="font-semibold text-[#2b2d42]">{index + 1}. {question.question}</div>
                          <div className="mt-4 space-y-2">
                            {question.options.map((option) => {
                              const selected = answers[question.id] === option
                              const correct = submitted && question.answer === option
                              const wrong = submitted && selected && question.answer !== option
                              return (
                                <button key={option} onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))} disabled={submitted} className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition ${correct ? 'border-[#10b981] bg-[#10b981]/10 text-[#065f46]' : wrong ? 'border-[#ef233c] bg-[#ef233c]/10 text-[#991b1b]' : selected ? 'border-[#2b2d42] bg-[#2b2d42]/5 text-[#2b2d42]' : 'border-[#e5e7eb] bg-[#f8f9fa] text-[#374151] hover:bg-white'}`}>{option}</button>
                              )
                            })}
                          </div>
                          {submitted && <div className="mt-4 rounded-xl bg-[#f8f9fa] p-4 text-sm leading-6 text-[#4b5563]"><div className="font-semibold text-[#2b2d42]">解析</div><div className="mt-2">{question.explanation}</div></div>}
                        </div>
                      ))}
                    </div>
                    {quizQuestions.length > 0 && (
                      <div className="mt-4 flex gap-3">
                        <button onClick={submitQuiz} disabled={submitted || Object.keys(answers).length < quizQuestions.length} className={`flex-1 rounded-2xl px-5 py-3 font-semibold text-white transition ${submitted || Object.keys(answers).length < quizQuestions.length ? 'cursor-not-allowed bg-gray-400' : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:scale-[1.01]'}`}>提交答案</button>
                        <button onClick={() => { setAnswers({}); setSubmitted(false) }} className="rounded-2xl border border-[#d1d5db] px-5 py-3 font-semibold text-[#2b2d42] transition hover:bg-[#f8f9fa]">重做</button>
                      </div>
                    )}
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
