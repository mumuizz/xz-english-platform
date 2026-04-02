import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import checkInRoutes from './routes/checkin.js'
import wordRoutes from './routes/words.js'
import settingsRoutes from './routes/settings.js'
import articleRoutes from './routes/articles.js'
import listeningRoutes from './routes/listening.js'
import { initializeData } from './init.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/checkin', checkInRoutes)
app.use('/api/words', wordRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/listening', listeningRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '肖战英语学习平台 API 运行中 💖' })
})

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

// 启动服务器并初始化数据
async function startServer() {
  // 初始化数据（词库、文章、听力）
  await initializeData()
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
    console.log(`💖 肖战粉丝英语学习平台 API 已启动！`)
    console.log(`📚 词库、文章、听力已自动加载，无需手动导入！`)
  })
}

startServer().catch(console.error)
