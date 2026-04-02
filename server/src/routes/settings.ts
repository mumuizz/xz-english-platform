import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// 获取设置
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.userId! }
    })

    if (!settings) {
      // 创建默认设置
      const newSettings = await prisma.settings.create({
        data: { userId: req.userId! }
      })
      return res.json(newSettings)
    }

    res.json(settings)
  } catch (error) {
    console.error('获取设置错误:', error)
    res.status(500).json({ error: '获取设置失败' })
  }
})

// 更新设置
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { dailyReminder, reminderTime, darkMode, soundEnabled, reviewCount } = req.body

    const settings = await prisma.settings.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        dailyReminder: dailyReminder ?? true,
        reminderTime: reminderTime ?? '09:00',
        darkMode: darkMode ?? false,
        soundEnabled: soundEnabled ?? true,
        reviewCount: reviewCount ?? 20
      },
      update: {
        dailyReminder,
        reminderTime,
        darkMode,
        soundEnabled,
        reviewCount
      }
    })

    res.json({ message: '设置已保存', settings })
  } catch (error) {
    console.error('更新设置错误:', error)
    res.status(500).json({ error: '更新设置失败' })
  }
})

export default router
