import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../utils/api'

interface User {
  username: string
  nickname: string
  avatar: string
  bio?: string
  level: number
  totalWords: number
  checkInDays: number
}

export default function EditProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User>({
    username: '',
    nickname: '',
    avatar: '',
    level: 1,
    totalWords: 0,
    checkInDays: 0,
    bio: ''
  })
  const [saved, setSaved] = useState(false)
  const [isCustomImage, setIsCustomImage] = useState(false)

  useEffect(() => {
    api.get('/user/profile').then(res => {
      setUser(res.data)
      if (res.data.avatar && res.data.avatar.startsWith('data:image')) {
        setIsCustomImage(true)
      }
    })
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result as string })
        setIsCustomImage(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setUser({ ...user, avatar: emoji })
    setIsCustomImage(false)
  }

  const handleSave = async () => {
    await api.put('/user/profile', {
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio
    })
    localStorage.setItem('user', JSON.stringify({ ...user, nickname: user.nickname, avatar: user.avatar, bio: user.bio }))
    setSaved(true)
    setTimeout(() => navigate('/profile'), 1500)
  }

  const avatars = ['📚', '⭐', '💖', '🎯', '🌟', '✨', '🔥', '💪']

  return (
    <Layout maxWidth="max-w-2xl">
          <h1 className="text-3xl font-bold text-xz-red mb-6">✏️ 编辑资料</h1>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* 头像预览区 */}
            <div className="text-center mb-8">
              <p className="text-gray-700 font-medium mb-4">头像</p>
              <div className="relative inline-block">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl overflow-hidden ${
                  isCustomImage ? 'bg-white' : 'bg-gray-100'
                } ring-4 ring-xz-light`}>
                  {user.avatar ? (
                    isCustomImage ? (
                      <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
                    ) : (
                      user.avatar
                    )
                  ) : (
                    <span className="text-gray-300">👤</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-xz-red rounded-full flex items-center justify-center cursor-pointer hover:bg-xz-dark transition shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-500 text-sm mt-2">点击相机图标上传照片</p>
            </div>

            {/* Emoji 选择区 */}
            <div className="mb-8">
              <p className="text-gray-700 font-medium mb-3 text-center">或选择表情头像</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {avatars.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`w-12 h-12 rounded-full text-2xl transition ${
                      user.avatar === emoji && !isCustomImage
                        ? 'bg-xz-red text-white ring-4 ring-xz-light'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">用户名</label>
                <input type="text" value={user.username} disabled className="w-full px-4 py-3 border bg-gray-100 rounded-lg" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">昵称</label>
                <input type="text" value={user.nickname} onChange={(e) => setUser({...user, nickname: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-xz-red outline-none" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">个人简介</label>
                <textarea value={user.bio || ''} onChange={(e) => setUser({...user, bio: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-xz-red outline-none resize-none" rows={4} />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">📊 学习信息</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-xz-red">Lv.{user.level}</p><p className="text-gray-500 text-sm">等级</p></div>
                  <div><p className="text-2xl font-bold text-green-600">{user.totalWords}</p><p className="text-gray-500 text-sm">单词</p></div>
                  <div><p className="text-2xl font-bold text-orange-600">{user.checkInDays}</p><p className="text-gray-500 text-sm">打卡</p></div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button onClick={handleSave} className={`w-full font-bold py-4 rounded-lg ${saved ? 'bg-green-500 text-white' : 'bg-xz-red hover:bg-xz-dark text-white'}`}>
                {saved ? '✅ 已保存' : '💾 保存修改'}
              </button>
            </div>
          </div>
    </Layout>
  )
}
