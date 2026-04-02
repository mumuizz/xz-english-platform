import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
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

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/checkin', checkInRoutes)
app.use('/api/words', wordRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/listening', listeningRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'English platform API is running.' })
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

async function startServer() {
  await initializeData()

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`)
    console.log('Word, reading, and listening modules are ready.')
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
})
