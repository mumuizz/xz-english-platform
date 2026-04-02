import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../db.js'
import { generateToken } from '../middleware/auth.js'

const router = Router()

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nickname: nickname || '小粉丝'
      }
    })

    // 创建默认设置
    await prisma.settings.create({
      data: {
        userId: user.id
      }
    })

    const token = generateToken(user.id)

    res.json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        level: user.level,
        totalWords: user.totalWords,
        checkInDays: user.checkInDays
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ error: '注册失败' })
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const token = generateToken(user.id)

    res.json({
      message: '登录成功 💖',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        level: user.level,
        totalWords: user.totalWords,
        checkInDays: user.checkInDays
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ error: '登录失败' })
  }
})

export default router
