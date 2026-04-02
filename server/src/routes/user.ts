import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        level: true,
        totalWords: true,
        checkInDays: true,
        createdAt: true,
        settings: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(user)
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

// 更新用户信息
router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { nickname, avatar, bio } = req.body

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        nickname,
        avatar,
        bio
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        level: true,
        totalWords: true,
        checkInDays: true
      }
    })

    res.json({ message: '更新成功', user })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({ error: '更新用户信息失败' })
  }
})

// 获取用户统计
router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! }
    })

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const checkInCount = await prisma.checkIn.count({
      where: { userId: req.userId!, completed: true }
    })

    const wordCount = await prisma.word.count({
      where: { userId: req.userId! }
    })

    const dueWords = await prisma.word.count({
      where: {
        userId: req.userId!,
        nextReview: { lte: new Date() }
      }
    })

    res.json({
      level: user.level,
      totalWords: wordCount,
      checkInDays: checkInCount,
      dueWords
    })
  } catch (error) {
    console.error('获取统计错误:', error)
    res.status(500).json({ error: '获取统计失败' })
  }
})

export default router
