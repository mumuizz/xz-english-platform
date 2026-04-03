import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { title: '首页', path: '/', icon: '🏠', subtitle: 'Dashboard' },
    { title: '个人中心', path: '/profile', icon: '👤', subtitle: 'Profile' },
    { title: '每日打卡', path: '/checkin', icon: '✅', subtitle: 'Daily Check-in' },
    { title: '单词记忆', path: '/ebbinghaus', icon: '🧠', subtitle: 'Vocabulary' },
    { title: '英语阅读', path: '/reading', icon: '📰', subtitle: 'Reading' },
    { title: '英语听力', path: '/listening', icon: '🎧', subtitle: 'Listening' },
    { title: '设置', path: '/settings', icon: '⚙️', subtitle: 'Settings' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-5 left-5 z-50 w-11 h-11 bg-[#ef233c] text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-[#d91e36] transition-all duration-300 hover:scale-105"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#2b2d42]/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-500 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="pt-12 pb-8 px-8 border-b border-[#edf2f4]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#ef233c] to-[#d91e36] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ef233c]/30">
              <span className="text-2xl">🦐</span>
            </div>
            <div>
              <h1 className="font-bold text-[#2b2d42] text-lg leading-tight">小飞侠</h1>
              <p className="text-xs text-[#8d99ae] font-medium tracking-wide">English 动力</p>
            </div>
          </div>

          {/* User Progress Indicator */}
          <div className="bg-[#edf2f4] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#2b2d42]">今日进度</span>
              <span className="text-xs font-bold text-[#ef233c]">65%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div className="h-full w-[65%] bg-gradient-to-r from-[#ef233c] to-[#d91e36] rounded-full transition-all duration-1000" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  active
                    ? 'bg-[#2b2d42] text-white shadow-lg shadow-[#2b2d42]/20'
                    : 'text-[#2b2d42] hover:bg-[#edf2f4]'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={`text-xl transition-transform duration-300 ${
                  active ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className={`text-xs ${active ? 'text-white/60' : 'text-[#8d99ae]'}`}>
                    {item.subtitle}
                  </p>
                </div>
                {active && (
                  <div className="w-2 h-2 bg-[#ef233c] rounded-full animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer - User Profile */}
        <Link
          to="/edit-profile"
          className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#edf2f4] to-transparent"
        >
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all duration-300 group cursor-pointer">
            <div className="w-11 h-11 bg-gradient-to-br from-[#ef233c] to-[#d91e36] rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              {user?.avatar || '🦐'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#2b2d42] text-sm truncate">{user?.nickname || '小飞侠'}</p>
              <p className="text-xs text-[#8d99ae] group-hover:text-[#ef233c] transition-colors">编辑资料</p>
            </div>
            <svg className="w-5 h-5 text-[#8d99ae] group-hover:text-[#2b2d42] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Logout Button - Fixed at bottom */}
        <div className="absolute bottom-24 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#ef233c] hover:bg-[#ef233c]/10 rounded-xl transition-all duration-300 font-semibold text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </button>
        </div>
      </aside>
    </>
  )
}
