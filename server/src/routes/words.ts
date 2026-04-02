import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

const EBBINGHAUS_INTERVALS = [0.5, 1, 6, 24, 48, 96, 168, 336]
const VOCAB_DIR = path.resolve(process.cwd(), '../data/vocab')

type VocabularyWord = {
  word: string
  phonetic?: string
  meanings?: unknown
  examples?: unknown
  backgroundImage?: string | null
  tags?: unknown
}

type VocabularyFile = {
  name?: string
  description?: string
  words?: VocabularyWord[]
}

const normalizeWord = (value: string) => value.trim().toLowerCase()

const parseWordId = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const resolveVocabPath = (code: string) => path.join(VOCAB_DIR, `${code}.json`)

const loadVocabularyFile = (code: string): VocabularyFile | null => {
  const filePath = resolveVocabPath(code)
  if (!fs.existsSync(filePath)) {
    return null
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as VocabularyFile
}

router.get('/vocab-library', authMiddleware, async (_req: AuthRequest, res) => {
  try {
    const files = fs
      .readdirSync(VOCAB_DIR)
      .filter((file) => file.endsWith('.json'))
      .filter((file) => !file.includes('-old'))
      .filter((file) => !file.includes('complete') || file.startsWith('selfstudy'))

    const library = files
      .map((file) => {
        const code = file.replace(/\.json$/i, '')
        const data = loadVocabularyFile(code)
        const words = data?.words || []

        return {
          code,
          name: data?.name || code,
          description: data?.description || '',
          count: words.length
        }
      })
      .sort((a, b) => b.count - a.count)

    res.json(library)
  } catch (error) {
    console.error('Failed to load vocabulary library:', error)
    res.status(500).json({ error: '加载词库目录失败' })
  }
})

router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!
    const now = new Date()

    const [totalGroups, dueGroups] = await Promise.all([
      prisma.word.groupBy({
        by: ['vocabSet'],
        where: { userId },
        _count: { _all: true }
      }),
      prisma.word.groupBy({
        by: ['vocabSet'],
        where: {
          userId,
          nextReview: { lte: now }
        },
        _count: { _all: true }
      })
    ])

    const stats = new Map<string, { total: number; due: number }>()

    totalGroups.forEach((group) => {
      const key = group.vocabSet || 'unassigned'
      stats.set(key, { total: group._count._all, due: 0 })
    })

    dueGroups.forEach((group) => {
      const key = group.vocabSet || 'unassigned'
      const current = stats.get(key) || { total: 0, due: 0 }
      current.due = group._count._all
      stats.set(key, current)
    })

    res.json(Object.fromEntries(stats))
  } catch (error) {
    console.error('Failed to load vocabulary stats:', error)
    res.status(500).json({ error: '加载词库统计失败' })
  }
})

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab } = req.query
    const where: { userId: number; vocabSet?: string } = { userId: req.userId! }

    if (typeof vocab === 'string' && vocab) {
      where.vocabSet = vocab
    }

    const words = await prisma.word.findMany({
      where,
      orderBy: { addedDate: 'desc' }
    })

    res.json(words)
  } catch (error) {
    console.error('Failed to load words:', error)
    res.status(500).json({ error: '获取单词失败' })
  }
})

router.get('/due', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab } = req.query
    const where: {
      userId: number
      nextReview: { lte: Date }
      vocabSet?: string
    } = {
      userId: req.userId!,
      nextReview: { lte: new Date() }
    }

    if (typeof vocab === 'string' && vocab) {
      where.vocabSet = vocab
    }

    const words = await prisma.word.findMany({
      where,
      orderBy: { nextReview: 'asc' }
    })

    res.json(words)
  } catch (error) {
    console.error('Failed to load due words:', error)
    res.status(500).json({ error: '获取待复习单词失败' })
  }
})

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { word, phonetic, meanings, examples, backgroundImage, vocabSet, tags } = req.body

    if (typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ error: '单词不能为空' })
    }

    const normalizedWord = normalizeWord(word)

    const existingWord = await prisma.word.findFirst({
      where: {
        userId: req.userId!,
        word: normalizedWord
      }
    })

    if (existingWord) {
      return res.status(409).json({ error: '该单词已存在' })
    }

    const [newWord] = await prisma.$transaction([
      prisma.word.create({
        data: {
          userId: req.userId!,
          word: normalizedWord,
          phonetic: phonetic || '',
          meanings: meanings ? JSON.stringify(meanings) : null,
          examples: examples ? JSON.stringify(examples) : null,
          backgroundImage: backgroundImage || null,
          vocabSet: vocabSet || null,
          tags: tags ? JSON.stringify(tags) : null,
          level: 0,
          nextReview: new Date()
        }
      }),
      prisma.user.update({
        where: { id: req.userId! },
        data: { totalWords: { increment: 1 } }
      })
    ])

    res.json({ message: '添加成功', word: newWord })
  } catch (error) {
    console.error('Failed to create word:', error)
    res.status(500).json({ error: '添加单词失败' })
  }
})

router.put('/:id/review', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { known } = req.body
    const wordId = parseWordId(id)

    if (wordId === null) {
      return res.status(400).json({ error: '单词 ID 无效' })
    }

    const word = await prisma.word.findUnique({
      where: { id: wordId }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: '单词不存在' })
    }

    const newLevel = known ? word.level + 1 : Math.max(0, word.level - 1)
    const interval = EBBINGHAUS_INTERVALS[Math.min(newLevel, EBBINGHAUS_INTERVALS.length - 1)]
    const nextReview = new Date(Date.now() + interval * 60 * 60 * 1000)

    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: { level: newLevel, nextReview }
    })

    res.json({ message: '复习完成', word: updatedWord })
  } catch (error) {
    console.error('Failed to review word:', error)
    res.status(500).json({ error: '复习单词失败' })
  }
})

router.put('/:id/image', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { backgroundImage } = req.body
    const wordId = parseWordId(id)

    if (wordId === null) {
      return res.status(400).json({ error: '单词 ID 无效' })
    }

    const word = await prisma.word.findUnique({
      where: { id: wordId }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: '单词不存在' })
    }

    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: { backgroundImage }
    })

    res.json({ message: '更新成功', word: updatedWord })
  } catch (error) {
    console.error('Failed to update word image:', error)
    res.status(500).json({ error: '更新单词图片失败' })
  }
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const wordId = parseWordId(id)

    if (wordId === null) {
      return res.status(400).json({ error: '单词 ID 无效' })
    }

    const word = await prisma.word.findUnique({
      where: { id: wordId }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: '单词不存在' })
    }

    await prisma.$transaction([
      prisma.word.delete({ where: { id: wordId } }),
      prisma.user.update({
        where: { id: req.userId! },
        data: { totalWords: { decrement: 1 } }
      })
    ])

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('Failed to delete word:', error)
    res.status(500).json({ error: '删除单词失败' })
  }
})

router.post('/import-batch', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab, batchSize = '100' } = req.query as { vocab?: string; batchSize?: string }
    const vocabCode = vocab || 'cet4'
    const batchSizeNum = Math.max(20, Number.parseInt(batchSize, 10) || 100)
    const vocabData = loadVocabularyFile(vocabCode)

    if (!vocabData) {
      return res.status(404).json({ error: `词库 ${vocabCode} 不存在` })
    }

    const words = Array.isArray(vocabData.words) ? vocabData.words : []
    if (words.length === 0) {
      return res.status(400).json({ error: '词库为空' })
    }

    let createdCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (let i = 0; i < words.length; i += batchSizeNum) {
      const batch = words.slice(i, i + batchSizeNum)
      const normalizedWordMap = new Map(batch.map((item) => [normalizeWord(item.word), item]))

      const existingWords = await prisma.word.findMany({
        where: {
          userId: req.userId!,
          word: { in: [...normalizedWordMap.keys()] }
        }
      })

      const existingWordMap = new Map(existingWords.map((item) => [item.word, item.id]))
      const toCreate = [...normalizedWordMap.entries()].filter(([word]) => !existingWordMap.has(word))
      const toUpdate = [...normalizedWordMap.entries()].filter(([word]) => existingWordMap.has(word))

      const [createResults, updateResults] = await Promise.all([
        Promise.allSettled(
          toCreate.map(([normalizedWord, item]) =>
            prisma.word.create({
              data: {
                userId: req.userId!,
                word: normalizedWord,
                phonetic: item.phonetic || '',
                meanings: item.meanings ? JSON.stringify(item.meanings) : null,
                examples: item.examples ? JSON.stringify(item.examples) : null,
                backgroundImage: item.backgroundImage || null,
                vocabSet: vocabCode,
                tags: item.tags ? JSON.stringify(item.tags) : JSON.stringify([]),
                level: 0,
                nextReview: new Date()
              }
            })
          )
        ),
        Promise.allSettled(
          toUpdate.map(([normalizedWord, item]) =>
            prisma.word.update({
              where: { id: existingWordMap.get(normalizedWord)! },
              data: {
                phonetic: item.phonetic || '',
                meanings: item.meanings ? JSON.stringify(item.meanings) : null,
                examples: item.examples ? JSON.stringify(item.examples) : null,
                backgroundImage: item.backgroundImage || null,
                vocabSet: vocabCode,
                tags: item.tags ? JSON.stringify(item.tags) : JSON.stringify([])
              }
            })
          )
        )
      ])

      createdCount += createResults.filter((result) => result.status === 'fulfilled').length
      updatedCount += updateResults.filter((result) => result.status === 'fulfilled').length
      errorCount +=
        createResults.filter((result) => result.status === 'rejected').length +
        updateResults.filter((result) => result.status === 'rejected').length
    }

    if (createdCount > 0) {
      await prisma.user.update({
        where: { id: req.userId! },
        data: { totalWords: { increment: createdCount } }
      })
    }

    res.json({
      message: `成功导入 ${createdCount + updatedCount} 个单词`,
      count: createdCount + updatedCount,
      createdCount,
      updatedCount,
      errorCount,
      total: words.length,
      vocabName: vocabData.name || vocabCode
    })
  } catch (error: any) {
    console.error('Failed to import vocabulary:', error)
    res.status(500).json({ error: error?.message || '导入词库失败' })
  }
})

router.post('/import-sample', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab } = req.query as { vocab?: string }
    const vocabCode = vocab || 'cet4'
    const vocabData = loadVocabularyFile(vocabCode)

    if (!vocabData) {
      return res.status(404).json({ error: `词库 ${vocabCode} 不存在` })
    }

    const sampleWords = (vocabData.words || []).slice(0, 100)
    if (sampleWords.length === 0) {
      return res.status(400).json({ error: '词库为空' })
    }

    const existingWords = await prisma.word.findMany({
      where: {
        userId: req.userId!,
        word: { in: sampleWords.map((item) => normalizeWord(item.word)) }
      }
    })
    const existingWordSet = new Set(existingWords.map((item) => item.word))

    const createResults = await Promise.allSettled(
      sampleWords
        .filter((item) => !existingWordSet.has(normalizeWord(item.word)))
        .map((item) =>
          prisma.word.create({
            data: {
              userId: req.userId!,
              word: normalizeWord(item.word),
              phonetic: item.phonetic || '',
              meanings: item.meanings ? JSON.stringify(item.meanings) : null,
              examples: item.examples ? JSON.stringify(item.examples) : null,
              backgroundImage: item.backgroundImage || null,
              vocabSet: vocabCode,
              tags: item.tags ? JSON.stringify(item.tags) : JSON.stringify([]),
              level: 0,
              nextReview: new Date()
            }
          })
        )
    )

    const createdCount = createResults.filter((result) => result.status === 'fulfilled').length

    if (createdCount > 0) {
      await prisma.user.update({
        where: { id: req.userId! },
        data: { totalWords: { increment: createdCount } }
      })
    }

    res.json({
      message: `成功导入 ${createdCount} 个单词`,
      count: createdCount,
      vocabName: vocabData.name || vocabCode
    })
  } catch (error) {
    console.error('Failed to import vocabulary sample:', error)
    res.status(500).json({ error: '导入词库失败' })
  }
})

export default router
