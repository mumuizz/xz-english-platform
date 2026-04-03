import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

interface Stats {
  level: number
  totalWords: number
  checkInDays: number
  dueWords: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    api.get('/user/stats').then(res => setStats(res.data))
    
    const hour = new Date().getHours()
    if (hour < 6) setGreeting('夜深了')
    else if (hour < 12) setGreeting('早上好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
  }, [])

  const quickActions = [
    { title: '单词记忆', path: '/ebbinghaus', icon: '🧠', color: '#ef233c', subtitle: `${stats?.dueWords || 0} 个待复习` },
    { title: '每日打卡', path: '/checkin', icon: '✅', color: '#2b2d42', subtitle: '保持连胜' },
    { title: '英语阅读', path: '/reading', icon: '📰', color: '#8d99ae', subtitle: '精读训练' },
    { title: '英语听力', path: '/listening', icon: '🎧', color: '#ef233c', subtitle: '磨耳朵' },
  ]

  return (
    <Layout maxWidth="max-w-7xl">
          {/* Hero Section */}
          <header className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 bg-[#ef233c] rounded-full" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-[#2b2d42] mb-2">
                  {greeting}，小飞侠
                </h1>
                <p className="text-lg text-[#8d99ae]">
                  今天也要一起努力学习哦 💪
                </p>
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Level Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-in delay-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ef233c]/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#8d99ae] uppercase tracking-wider">学习等级</span>
                  <span className="text-3xl">🎯</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#2b2d42]">{stats?.level || 1}</span>
                  <span className="text-lg text-[#8d99ae]">级</span>
                </div>
                <div className="mt-4 h-2 bg-[#edf2f4] rounded-full overflow-hidden">
                  <div className="h-full w-[60%] bg-gradient-to-r from-[#ef233c] to-[#d91e36] rounded-full" />
                </div>
                <p className="text-xs text-[#8d99ae] mt-2">距离下一级还需 120 单词</p>
              </div>
            </div>

            {/* Words Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-in delay-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2b2d42]/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#8d99ae] uppercase tracking-wider">已学单词</span>
                  <span className="text-3xl">📖</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#2b2d42]">{stats?.totalWords || 0}</span>
                  <span className="text-lg text-[#8d99ae]">词</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#ef233c] bg-[#ef233c]/10 px-2 py-1 rounded">+12 今天</span>
                  <span className="text-xs text-[#8d99ae]">持续进步中</span>
                </div>
              </div>
            </div>

            {/* Streak Card */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-in delay-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#8d99ae] uppercase tracking-wider">连续打卡</span>
                  <span className="text-3xl">🔥</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[#2b2d42]">{stats?.checkInDays || 0}</span>
                  <span className="text-lg text-[#8d99ae]">天</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-500/10 px-2 py-1 rounded">
                    {stats?.checkInDays || 0} 天连胜
                  </span>
                  <span className="text-xs text-[#8d99ae]">保持住！</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#2b2d42]">快速入口</h2>
              <Link to="/all-modules" className="text-sm font-semibold text-[#ef233c] hover:text-[#d91e36] transition-colors flex items-center gap-1">
                查看全部
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {quickActions.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-scale-in"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${item.color}08 0%, transparent 100%)` }}
                  />
                  <div className="relative">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[#2b2d42] mb-1 group-hover:text-[#ef233c] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#8d99ae]">{item.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Daily Quote */}
          <div className="relative bg-gradient-to-br from-[#2b2d42] to-[#3d3f5e] rounded-3xl p-8 lg:p-10 overflow-hidden shadow-2xl animate-fade-in delay-5">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef233c]/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8d99ae]/10 rounded-full blur-3xl -ml-24 -mb-24" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📝</span>
                <span className="text-sm font-bold text-white/80 uppercase tracking-wider">今日英语名言</span>
              </div>
              
              <blockquote className="mb-6">
                <p className="text-2xl lg:text-3xl font-serif text-white leading-relaxed italic mb-4">
                  "The only way to do great work is to love what you do."
                </p>
                <footer className="text-lg text-[#8d99ae]">
                  — Steve Jobs
                </footer>
              </blockquote>
              
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <div className="w-10 h-10 bg-[#ef233c] rounded-full flex items-center justify-center text-white font-bold">
                  💖
                </div>
                <p className="text-sm text-white/80">
                  和小飞侠一起，成为更好的自己！
                </p>
              </div>
            </div>
          </div>
    </Layout>
  )
}
