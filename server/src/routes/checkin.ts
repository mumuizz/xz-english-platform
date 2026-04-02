import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// 获取打卡记录
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
      take: 100
    })

    res.json(checkIns)
  } catch (error) {
    console.error('获取打卡记录错误:', error)
    res.status(500).json({ error: '获取打卡记录失败' })
  }
})

// 今日打卡
router.post('/today', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { note, words } = req.body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 检查今天是否已打卡
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: req.userId!,
        date: {
          gte: today
        }
      }
    })

    if (existingCheckIn) {
      return res.status(400).json({ error: '今天已经打卡过了' })
    }

    // 创建打卡记录
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: req.userId!,
        note,
        words: words || 0
      }
    })

    // 更新用户打卡天数
    await prisma.user.update({
      where: { id: req.userId! },
      data: {
        checkInDays: { increment: 1 }
      }
    })

    res.json({ message: '打卡成功！💖', checkIn })
  } catch (error: any) {
    console.error('打卡错误:', error)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: '今天已经打卡过了' })
    }
    res.status(500).json({ error: '打卡失败' })
  }
})

// 获取打卡统计
router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const totalCheckIns = await prisma.checkIn.count({
      where: { userId: req.userId!, completed: true }
    })

    // 计算连续打卡天数
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: req.userId!, completed: true },
      orderBy: { date: 'desc' },
      take: 365
    })

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < checkIns.length; i++) {
      const checkInDate = new Date(checkIns[i].date)
      checkInDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (checkInDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    res.json({
      totalCheckIns,
      streak
    })
  } catch (error) {
    console.error('获取打卡统计错误:', error)
    res.status(500).json({ error: '获取打卡统计失败' })
  }
})

export default router
