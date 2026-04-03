import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  bio?: string
  level: number
  totalWords: number
  checkInDays: number
  createdAt: string
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    api.get('/user/profile').then(res => setUser(res.data))
  }, [])

  const achievements = [
    { name: '初入江湖', icon: '🌱', unlocked: true, progress: 100, description: '完成注册，开始学习之旅' },
    { name: '连续打卡 7 天', icon: '🔥', unlocked: (user?.checkInDays || 0) >= 7, progress: Math.min(100, ((user?.checkInDays || 0) / 7) * 100), description: '坚持就是胜利' },
    { name: '学习 100 词', icon: '📚', unlocked: (user?.totalWords || 0) >= 100, progress: Math.min(100, ((user?.totalWords || 0) / 100) * 100), description: '积少成多' },
    { name: '等级达到 5', icon: '⭐', unlocked: (user?.level || 1) >= 5, progress: Math.min(100, ((user?.level || 1) / 5) * 100), description: '步步高升' },
    { name: '记忆大师', icon: '🧠', unlocked: false, progress: 0, description: '掌握艾宾浩斯记忆法' },
    { name: '英语达人', icon: '🏆', unlocked: false, progress: 0, description: '完成所有学习目标' },
  ]

  const stats = [
    { label: '累计单词', value: user?.totalWords || 0, icon: '📖', color: '#ef233c', bg: 'from-[#ef233c]/10 to-transparent' },
    { label: '打卡天数', value: user?.checkInDays || 0, icon: '✅', color: '#10b981', bg: 'from-[#10b981]/10 to-transparent' },
    { label: '当前等级', value: `Lv.${user?.level || 1}`, icon: '🎯', color: '#3b82f6', bg: 'from-[#3b82f6]/10 to-transparent' },
    { label: '待复习', value: '0', icon: '🔄', color: '#8b5cf6', bg: 'from-[#8b5cf6]/10 to-transparent' },
  ]

  if (!user) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">✨</div>
          <p className="text-[#8d99ae]">加载中...</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
          {/* Header */}
          <header className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-12 bg-[#ef233c] rounded-full" />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-[#2b2d42] mb-2">个人中心</h1>
                <p className="text-lg text-[#8d99ae]">管理你的学习档案和成就</p>
              </div>
            </div>
          </header>

          {/* Profile Card */}
          <div className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-xl transition-all duration-500 mb-8 animate-slide-in">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#ef233c]/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-[#ef233c] to-[#d91e36] rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                  {user.avatar || '👤'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#10b981] rounded-full flex items-center justify-center text-white text-sm border-4 border-white">
                  ✓
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-[#2b2d42] mb-2">{user.nickname}</h2>
                <p className="text-[#8d99ae] mb-4">@{user.username}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="bg-gradient-to-r from-[#ef233c]/10 to-transparent text-[#ef233c] px-4 py-2 rounded-full text-sm font-semibold border border-[#ef233c]/20">
                    🎯 Lv.{user.level}
                  </span>
                  <span className="bg-gradient-to-r from-[#10b981]/10 to-transparent text-[#10b981] px-4 py-2 rounded-full text-sm font-semibold border border-[#10b981]/20">
                    📚 {user.totalWords} 词
                  </span>
                  <span className="bg-gradient-to-r from-orange-500/10 to-transparent text-orange-600 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/20">
                    🔥 {user.checkInDays} 天打卡
                  </span>
                </div>

                {user.bio && (
                  <p className="text-[#8d99ae] mt-4 text-sm">{user.bio}</p>
                )}
              </div>

              {/* Action */}
              <Link
                to="/edit-profile"
                className="group relative bg-[#ef233c] hover:bg-[#d91e36] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  ✏️ 编辑资料
                </span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden animate-slide-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bg} rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="text-3xl font-bold text-[#2b2d42] mb-1">{stat.value}</p>
                  <p className="text-sm text-[#8d99ae]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-xl transition-all duration-500 animate-slide-in delay-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">🏅</span>
                <div>
                  <h3 className="text-2xl font-bold text-[#2b2d42]">我的成就</h3>
                  <p className="text-sm text-[#8d99ae]">记录你的每一个进步</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`relative p-6 rounded-2xl transition-all duration-300 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-md hover:shadow-lg hover:scale-105'
                        : 'bg-[#f8f9fa] border-2 border-[#e9ecef] opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-5xl mb-3 block">{achievement.icon}</span>
                      <p className={`font-bold mb-1 ${achievement.unlocked ? 'text-[#2b2d42]' : 'text-[#8d99ae]'}`}>
                        {achievement.name}
                      </p>
                      <p className="text-xs text-[#8d99ae] mb-3">{achievement.description}</p>
                      
                      {/* Progress Bar */}
                      {!achievement.unlocked && achievement.progress > 0 && (
                        <div className="h-1.5 bg-[#e9ecef] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#ef233c] to-[#d91e36] rounded-full transition-all duration-500"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      )}
                      
                      {achievement.unlocked && (
                        <span className="text-xs text-yellow-600 font-semibold">已解锁 ✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </Layout>
  )
}
