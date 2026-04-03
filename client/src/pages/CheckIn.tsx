import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../utils/api'

interface CheckInRecord {
  id: number
  date: string
  completed: boolean
  words: number
  note?: string
}

export default function CheckIn() {
  const [records, setRecords] = useState<CheckInRecord[]>([])
  const [todayChecked, setTodayChecked] = useState(false)
  const [streak, setStreak] = useState(0)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    loadCheckIns()
  }, [])

  const loadCheckIns = async () => {
    const [recordsRes, statsRes] = await Promise.all([
      api.get('/checkin'),
      api.get('/checkin/stats')
    ])
    setRecords(recordsRes.data)
    setStreak(statsRes.data.streak)

    const today = new Date().toDateString()
    const todayRecord = recordsRes.data.find((r: CheckInRecord) => 
      new Date(r.date).toDateString() === today
    )
    setTodayChecked(!!todayRecord)
  }

  const handleCheckIn = async () => {
    await api.post('/checkin/today', { note })
    setTodayChecked(true)
    setShowNote(false)
    setNote('')
    loadCheckIns()
  }

  const generateCalendar = () => {
    const days = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const record = records.find(r => new Date(r.date).toDateString() === dateStr)
      days.push({
        date,
        day: date.getDate(),
        month: date.getMonth() + 1,
        completed: !!record,
        isToday: i === 0
      })
    }
    return days
  }

  const calendar = generateCalendar()
  const completedCount = calendar.filter(d => d.completed).length

  return (
    <Layout maxWidth="max-w-5xl">
          {/* Header */}
          <header className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 bg-[#ef233c] rounded-full" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-[#2b2d42] mb-2">📅 每日打卡</h1>
                <p className="text-lg text-[#8d99ae]">和小飞侠一起，坚持每一天！💪</p>
              </div>
            </div>
          </header>

          {/* Main Card */}
          <div className="group relative bg-white rounded-3xl p-8 lg:p-12 shadow-md hover:shadow-xl transition-all duration-500 mb-8 animate-slide-in overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${todayChecked ? 'from-[#10b981]/10 to-transparent' : 'from-[#ef233c]/10 to-transparent'} transition-opacity duration-500`} />
            
            <div className="relative text-center">
              {todayChecked ? (
                <div className="animate-bounce">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center text-white text-5xl mx-auto mb-6 shadow-xl">
                    ✅
                  </div>
                  <h2 className="text-3xl font-bold text-[#10b981] mb-3">今日已打卡！</h2>
                  <p className="text-[#8d99ae] text-lg">太棒了！继续保持哦～</p>
                  <div className="mt-6 inline-flex items-center gap-2 bg-[#10b981]/10 px-6 py-3 rounded-full">
                    <span className="text-2xl">🔥</span>
                    <span className="font-bold text-[#10b981]">当前连胜 {streak} 天</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-24 h-24 bg-gradient-to-br from-[#ef233c] to-[#d91e36] rounded-full flex items-center justify-center text-white text-5xl mx-auto mb-6 shadow-xl animate-pulse">
                    📝
                  </div>
                  <h2 className="text-3xl font-bold text-[#2b2d42] mb-3">今天还没打卡呢</h2>
                  <p className="text-[#8d99ae] text-lg mb-6">每天进步一点点，成为更好的自己！</p>
                  <button
                    onClick={() => setShowNote(true)}
                    className="group relative bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
                  >
                    <span className="flex items-center gap-2">
                      ✨ 立即打卡
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Streak Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-in delay-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative text-center">
                <span className="text-4xl mb-3 block">🔥</span>
                <p className="text-4xl font-bold text-orange-600 mb-2">{streak}</p>
                <p className="text-[#8d99ae]">连续打卡天数</p>
              </div>
            </div>

            {/* Total Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-in delay-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ef233c]/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative text-center">
                <span className="text-4xl mb-3 block">✅</span>
                <p className="text-4xl font-bold text-[#ef233c] mb-2">{records.length}</p>
                <p className="text-[#8d99ae]">总打卡次数</p>
              </div>
            </div>

            {/* This Month Card */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-in delay-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3b82f6]/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative text-center">
                <span className="text-4xl mb-3 block">📆</span>
                <p className="text-4xl font-bold text-[#3b82f6] mb-2">{completedCount}</p>
                <p className="text-[#8d99ae]">本月已打卡</p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-xl transition-all duration-500 animate-slide-in delay-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#3b82f6]/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">📆</span>
                <div>
                  <h3 className="text-2xl font-bold text-[#2b2d42]">最近 30 天打卡记录</h3>
                  <p className="text-sm text-[#8d99ae]">每一天都算数</p>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                  <div 
                    key={day} 
                    className={`text-center font-bold text-sm py-2 ${index === 0 || index === 6 ? 'text-[#ef233c]' : 'text-[#8d99ae]'}`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendar.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                      day.completed 
                        ? 'bg-gradient-to-br from-[#ef233c] to-[#d91e36] text-white shadow-md hover:shadow-lg hover:scale-105' 
                        : day.isToday 
                          ? 'bg-white border-2 border-[#ef233c] shadow-md' 
                          : 'bg-[#f8f9fa] text-[#8d99ae]'
                    }`}
                  >
                    <span className={`font-bold ${day.isToday ? 'text-lg' : 'text-base'}`}>
                      {day.day}
                    </span>
                    {day.completed && (
                      <span className="text-xs opacity-80 mt-0.5">✓</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[#e9ecef]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-[#ef233c] to-[#d91e36]" />
                  <span className="text-sm text-[#8d99ae]">已打卡</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white border-2 border-[#ef233c]" />
                  <span className="text-sm text-[#8d99ae]">今天</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#f8f9fa]" />
                  <span className="text-sm text-[#8d99ae]">未打卡</span>
                </div>
              </div>
            </div>
          </div>

          {/* Note Modal */}
          {showNote && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
                <div className="text-center mb-6">
                  <span className="text-5xl mb-4 block">📝</span>
                  <h3 className="text-2xl font-bold text-[#2b2d42] mb-2">记录今天的学习</h3>
                  <p className="text-[#8d99ae]">分享一下你的学习收获吧～</p>
                </div>
                
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="今天学了什么？有什么收获？（可选）"
                  className="w-full h-32 px-4 py-3 border-2 border-[#e9ecef] rounded-xl focus:ring-2 focus:ring-[#ef233c] focus:border-[#ef233c] outline-none resize-none mb-4 transition-all"
                />
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowNote(false)} 
                    className="flex-1 bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#2b2d42] font-semibold py-4 rounded-xl transition-all"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleCheckIn} 
                    className="flex-1 bg-gradient-to-r from-[#ef233c] to-[#d91e36] hover:from-[#d91e36] hover:to-[#c41c30] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    ✨ 确认打卡
                  </button>
                </div>
              </div>
            </div>
          )}
    </Layout>
  )
}
