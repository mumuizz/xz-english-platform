import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

interface LoginProps {
  setIsLoggedIn: (loggedIn: boolean) => void
}

export default function Login({ setIsLoggedIn }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const response = await api.post(endpoint, { username, password })
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setIsLoggedIn(true)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请重试')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-xz-warm via-red-50 to-xz-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-xz-red rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-xz-red mb-2">小飞侠 English 动力</h1>
          <p className="text-gray-600">和小战战一起学英语！</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xz-red focus:border-transparent outline-none transition"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xz-red focus:border-transparent outline-none transition"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-xz-red hover:bg-xz-dark text-white font-bold py-3 rounded-lg transition duration-300 transform hover:scale-105"
          >
            {isRegister ? '注册' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xz-red hover:underline text-sm"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>💖 为虾而来，学英语不孤单！</p>
        </div>
      </div>
    </div>
  )
}
