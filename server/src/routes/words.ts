import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 艾宾浩斯遗忘曲线复习间隔（小时）
const EBINGHAUS_INTERVALS = [0.5, 1, 6, 24, 48, 96, 168, 336]

// 获取单词列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab } = req.query
    const where: any = { userId: req.userId! }
    
    if (vocab) {
      where.vocabSet = vocab
    }

    const words = await prisma.word.findMany({
      where,
      orderBy: { addedDate: 'desc' }
    })

    res.json(words)
  } catch (error) {
    console.error('获取单词错误:', error)
    res.status(500).json({ error: '获取单词失败' })
  }
})

// 获取待复习单词
router.get('/due', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab } = req.query
    const where: any = {
      userId: req.userId!,
      nextReview: { lte: new Date() }
    }
    
    if (vocab) {
      where.vocabSet = vocab
    }

    const words = await prisma.word.findMany({
      where,
      orderBy: { nextReview: 'asc' }
    })

    res.json(words)
  } catch (error) {
    console.error('获取待复习单词错误:', error)
    res.status(500).json({ error: '获取待复习单词失败' })
  }
})

// 添加单词
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { word, phonetic, meanings, examples, backgroundImage, vocabSet, tags } = req.body

    if (!word) {
      return res.status(400).json({ error: '单词不能为空' })
    }

    const newWord = await prisma.word.create({
      data: {
        userId: req.userId!!,
        word,
        phonetic: phonetic || '',
        meanings: meanings ? JSON.stringify(meanings) : null,
        examples: examples ? JSON.stringify(examples) : null,
        backgroundImage: backgroundImage || null,
        vocabSet: vocabSet || null,
        tags: tags ? JSON.stringify(tags) : null,
        level: 0,
        nextReview: new Date()
      }
    })

    await prisma.user.update({
      where: { id: req.userId! },
      data: { totalWords: { increment: 1 } }
    })

    res.json({ message: '添加成功', word: newWord })
  } catch (error) {
    console.error('添加单词错误:', error)
    res.status(500).json({ error: '添加单词失败' })
  }
})

// 复习单词
router.put('/:id/review', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { known } = req.body

    const word = await prisma.word.findUnique({
      where: { id: parseInt(id) }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: '单词不存在' })
    }

    const newLevel = known ? word.level + 1 : Math.max(0, word.level - 1)
    const interval = EBINGHAUS_INTERVALS[Math.min(newLevel, EBINGHAUS_INTERVALS.length - 1)]
    const nextReview = new Date(Date.now() + interval * 60 * 60 * 1000)

    const updatedWord = await prisma.word.update({
      where: { id: parseInt(id) },
      data: { level: newLevel, nextReview }
    })

    res.json({ message: '复习完成', word: updatedWord })
  } catch (error) {
    console.error('复习单词错误:', error)
    res.status(500).json({ error: '复习单词失败' })
  }
})

// 更新单词图片
router.put('/:id/image', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { backgroundImage } = req.body

    const word = await prisma.word.findUnique({
      where: { id: parseInt(id) }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: '单词不存在' })
    }

    const updatedWord = await prisma.word.update({
      where: { id: parseInt(id) },
      data: { backgroundImage }
    })

    res.json({ message: '更新成功', word: updatedWord })
  } catch (error) {
    console.error('更新图片错误:', error)
    res.status(500).json({ error: '更新图片失败' })
  }
})

// 删除单词
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const word = await prisma.word.findUnique({
      where: { id: parseInt(id) }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: '单词不存在' })
    }

    await prisma.word.delete({ where: { id: parseInt(id) } })

    await prisma.user.update({
      where: { id: req.userId! },
      data: { totalWords: { decrement: 1 } }
    })

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除单词错误:', error)
    res.status(500).json({ error: '删除单词失败' })
  }
})

// 导入词库（批量）
router.post('/import-batch', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab, batchSize = 50 } = req.query as { vocab?: string, batchSize?: string }
    const vocabCode = vocab || 'cet4'
    const batchSizeNum = parseInt(batchSize || '50')
    
    // 读取词库文件
    const vocabPath = path.resolve(process.cwd(), '../data/vocab', `${vocabCode}.json`)
    console.log(`[导入词库] 路径：${vocabPath}, 批次大小：${batchSizeNum}`)
    
    if (!fs.existsSync(vocabPath)) {
      return res.status(404).json({ error: `词库 ${vocabCode} 不存在` })
    }

    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'))
    const words = vocabData.words || []

    if (words.length === 0) {
      return res.status(400).json({ error: '词库为空' })
    }

    let createdCount = 0
    let updatedCount = 0
    let errorCount = 0

    // 分批处理
    for (let i = 0; i < words.length; i += batchSizeNum) {
      const batch = words.slice(i, i + batchSizeNum)
      console.log(`[导入词库] 处理批次 ${Math.floor(i/batchSizeNum)+1}, 单词 ${i+1}-${Math.min(i+batchSizeNum, words.length)}/${words.length}`)
      
      // 先查询这批单词哪些已存在
      const existingWords = await prisma.word.findMany({
        where: {
          userId: req.userId!!,
          word: { in: batch.map((w: any) => w.word) }
        }
      })

      const existingWordSet = new Set(existingWords.map(w => w.word))
      
      // 分类：需要创建的和需要更新的
      const toCreate = batch.filter((w: any) => !existingWordSet.has(w.word))
      const toUpdate = batch.filter((w: any) => existingWordSet.has(w.word))

      // 批量创建新单词
      if (toCreate.length > 0) {
        const createResults = await Promise.allSettled(
          toCreate.map((w: any) => prisma.word.create({
            data: {
              userId: req.userId!!,
              word: w.word,
              phonetic: w.phonetic,
              meanings: JSON.stringify(w.meanings),
              examples: JSON.stringify(w.examples),
              backgroundImage: w.backgroundImage || null,
              vocabSet: vocabCode,
              tags: JSON.stringify(w.tags || []),
              level: 0,
              nextReview: new Date()
            }
          }))
        )
        createdCount += createResults.filter(r => r.status === 'fulfilled').length
      }

      // 批量更新已有单词
      if (toUpdate.length > 0) {
        const updateResults = await Promise.allSettled(
          toUpdate.map((w: any) => {
            const existing = existingWords.find(ew => ew.word === w.word)
            return prisma.word.update({
              where: { id: existing!.id },
              data: {
                phonetic: w.phonetic,
                meanings: JSON.stringify(w.meanings),
                examples: JSON.stringify(w.examples),
                vocabSet: vocabCode,
                tags: JSON.stringify(w.tags || []),
              }
            })
          })
        )
        updatedCount += updateResults.filter(r => r.status === 'fulfilled').length
      }
    }

    // 更新用户统计（只增加新创建的）
    if (createdCount > 0) {
      await prisma.user.update({
        where: { id: req.userId! },
        data: { totalWords: { increment: createdCount } }
      })
    }

    console.log(`[导入词库] 完成：创建${createdCount}, 更新${updatedCount}, 错误${errorCount}`)

    res.json({ 
      message: `成功导入 ${createdCount + updatedCount} 个单词`, 
      count: createdCount + updatedCount,
      createdCount,
      updatedCount,
      errorCount,
      total: words.length,
      vocabName: vocabData.name 
    })
  } catch (error: any) {
    console.error('[导入词库] 错误:', error)
    res.status(500).json({ error: `导入词库失败：${error.message}` })
  }
})

// 导入词库（保留旧接口兼容）
router.post('/import-sample', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab } = req.query as { vocab?: string }
    const vocabCode = vocab || 'cet4'
    
    const vocabPath = path.resolve(process.cwd(), '../data/vocab', `${vocabCode}.json`)
    console.log('导入词库路径:', vocabPath)
    
    if (!fs.existsSync(vocabPath)) {
      return res.status(404).json({ error: `词库 ${vocabCode} 不存在` })
    }

    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'))
    const words = vocabData.words || []

    if (words.length === 0) {
      return res.status(400).json({ error: '词库为空' })
    }

    // 批量导入（使用 upsert 避免重复）
    const created = await Promise.allSettled(
      words.map((w: any) => prisma.word.upsert({
        where: {
          userId_word: {
            userId: req.userId!!,
            word: w.word.toLowerCase()
          }
        },
        update: {
          phonetic: w.phonetic,
          meanings: JSON.stringify(w.meanings),
          examples: JSON.stringify(w.examples),
          vocabSet: vocabCode,
        },
        create: {
          userId: req.userId!!,
          word: w.word,
          phonetic: w.phonetic,
          meanings: JSON.stringify(w.meanings),
          examples: JSON.stringify(w.examples),
          backgroundImage: w.backgroundImage || null,
          vocabSet: vocabCode,
          tags: JSON.stringify(w.tags || []),
          level: 0,
          nextReview: new Date()
        }
      }))
    )

    const successCount = created.filter(r => r.status === 'fulfilled').length

    await prisma.user.update({
      where: { id: req.userId! },
      data: { totalWords: { increment: successCount } }
    })

    res.json({ 
      message: `成功导入 ${successCount} 个单词`, 
      count: successCount,
      vocabName: vocabData.name 
    })
  } catch (error) {
    console.error('导入词库错误:', error)
    res.status(500).json({ error: '导入词库失败' })
  }
})

export default router
