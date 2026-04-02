import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

const EBINGHAUS_INTERVALS = [0.5, 1, 6, 24, 48, 96, 168, 336]

type ImportedWord = {
  word: string
  phonetic?: string
  meanings?: unknown
  examples?: unknown
  backgroundImage?: string | null
  tags?: unknown
}

const normalizeWord = (value: string) => value.trim().toLowerCase()

const parseWordId = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const resolveVocabPath = (vocabCode: string) =>
  path.resolve(process.cwd(), '../data/vocab', `${vocabCode}.json`)

const serialize = (value: unknown) => (value == null ? null : JSON.stringify(value))

const buildWordPayload = (userId: number, vocabCode: string, word: ImportedWord) => ({
  userId,
  word: normalizeWord(word.word),
  phonetic: word.phonetic || '',
  meanings: serialize(word.meanings),
  examples: serialize(word.examples),
  backgroundImage: word.backgroundImage || null,
  vocabSet: vocabCode,
  tags: serialize(word.tags || []),
  level: 0,
  nextReview: new Date()
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

    const stats: Record<string, { total: number; due: number }> = {}

    totalGroups.forEach((group) => {
      const key = group.vocabSet || 'unknown'
      stats[key] = {
        total: group._count._all,
        due: 0
      }
    })

    dueGroups.forEach((group) => {
      const key = group.vocabSet || 'unknown'
      stats[key] = {
        total: stats[key]?.total || 0,
        due: group._count._all
      }
    })

    res.json(stats)
  } catch (error) {
    console.error('Failed to load vocab stats:', error)
    res.status(500).json({ error: 'Failed to load vocab stats' })
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
    res.status(500).json({ error: 'Failed to load words' })
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
    res.status(500).json({ error: 'Failed to load due words' })
  }
})

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { word, phonetic, meanings, examples, backgroundImage, vocabSet, tags } = req.body
    const normalizedWord = typeof word === 'string' ? normalizeWord(word) : ''

    if (!normalizedWord) {
      return res.status(400).json({ error: 'Word is required' })
    }

    const existing = await prisma.word.findFirst({
      where: {
        userId: req.userId!,
        word: normalizedWord
      }
    })

    if (existing) {
      return res.status(409).json({ error: 'Word already exists' })
    }

    const [newWord] = await prisma.$transaction([
      prisma.word.create({
        data: {
          userId: req.userId!,
          word: normalizedWord,
          phonetic: phonetic || '',
          meanings: serialize(meanings),
          examples: serialize(examples),
          backgroundImage: backgroundImage || null,
          vocabSet: vocabSet || null,
          tags: serialize(tags),
          level: 0,
          nextReview: new Date()
        }
      }),
      prisma.user.update({
        where: { id: req.userId! },
        data: { totalWords: { increment: 1 } }
      })
    ])

    res.json({ message: 'Word created', word: newWord })
  } catch (error) {
    console.error('Failed to create word:', error)
    res.status(500).json({ error: 'Failed to create word' })
  }
})

router.put('/:id/review', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const wordId = parseWordId(req.params.id)
    const { known } = req.body

    if (wordId === null) {
      return res.status(400).json({ error: 'Invalid word id' })
    }

    const word = await prisma.word.findUnique({
      where: { id: wordId }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: 'Word not found' })
    }

    const newLevel = known ? word.level + 1 : Math.max(0, word.level - 1)
    const interval = EBINGHAUS_INTERVALS[Math.min(newLevel, EBINGHAUS_INTERVALS.length - 1)]
    const nextReview = new Date(Date.now() + interval * 60 * 60 * 1000)

    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: { level: newLevel, nextReview }
    })

    res.json({ message: 'Review completed', word: updatedWord })
  } catch (error) {
    console.error('Failed to review word:', error)
    res.status(500).json({ error: 'Failed to review word' })
  }
})

router.put('/:id/image', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const wordId = parseWordId(req.params.id)
    const { backgroundImage } = req.body

    if (wordId === null) {
      return res.status(400).json({ error: 'Invalid word id' })
    }

    const word = await prisma.word.findUnique({
      where: { id: wordId }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: 'Word not found' })
    }

    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: { backgroundImage }
    })

    res.json({ message: 'Image updated', word: updatedWord })
  } catch (error) {
    console.error('Failed to update word image:', error)
    res.status(500).json({ error: 'Failed to update word image' })
  }
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const wordId = parseWordId(req.params.id)

    if (wordId === null) {
      return res.status(400).json({ error: 'Invalid word id' })
    }

    const word = await prisma.word.findUnique({
      where: { id: wordId }
    })

    if (!word || word.userId !== req.userId!) {
      return res.status(404).json({ error: 'Word not found' })
    }

    await prisma.$transaction([
      prisma.word.delete({ where: { id: wordId } }),
      prisma.user.update({
        where: { id: req.userId! },
        data: { totalWords: { decrement: 1 } }
      })
    ])

    res.json({ message: 'Word deleted' })
  } catch (error) {
    console.error('Failed to delete word:', error)
    res.status(500).json({ error: 'Failed to delete word' })
  }
})

router.post('/import-batch', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab, batchSize = '50' } = req.query as { vocab?: string; batchSize?: string }
    const userId = req.userId!
    const vocabCode = vocab || 'cet4'
    const batchSizeNum = Number.parseInt(batchSize, 10) || 50
    const vocabPath = resolveVocabPath(vocabCode)

    if (!fs.existsSync(vocabPath)) {
      return res.status(404).json({ error: `Vocab ${vocabCode} not found` })
    }

    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'))
    const words = (vocabData.words || []) as ImportedWord[]

    if (words.length === 0) {
      return res.status(400).json({ error: 'Vocab file is empty' })
    }

    let createdCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (let index = 0; index < words.length; index += batchSizeNum) {
      const batch = words.slice(index, index + batchSizeNum)
      const normalizedWords = batch.map((item) => normalizeWord(item.word))
      const existingWords = await prisma.word.findMany({
        where: {
          userId,
          word: { in: normalizedWords }
        }
      })

      const existingWordMap = new Map(existingWords.map((word) => [word.word, word.id]))
      const toCreate = batch.filter((item) => !existingWordMap.has(normalizeWord(item.word)))
      const toUpdate = batch.filter((item) => existingWordMap.has(normalizeWord(item.word)))

      const [createResults, updateResults] = await Promise.all([
        Promise.allSettled(
          toCreate.map((item) =>
            prisma.word.create({
              data: buildWordPayload(userId, vocabCode, item)
            })
          )
        ),
        Promise.allSettled(
          toUpdate.map((item) =>
            prisma.word.update({
              where: { id: existingWordMap.get(normalizeWord(item.word))! },
              data: {
                phonetic: item.phonetic || '',
                meanings: serialize(item.meanings),
                examples: serialize(item.examples),
                backgroundImage: item.backgroundImage || null,
                vocabSet: vocabCode,
                tags: serialize(item.tags || [])
              }
            })
          )
        )
      ])

      createdCount += createResults.filter((result) => result.status === 'fulfilled').length
      updatedCount += updateResults.filter((result) => result.status === 'fulfilled').length
      errorCount += createResults.filter((result) => result.status === 'rejected').length
      errorCount += updateResults.filter((result) => result.status === 'rejected').length
    }

    if (createdCount > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalWords: { increment: createdCount } }
      })
    }

    res.json({
      message: `Imported ${createdCount + updatedCount} words`,
      count: createdCount + updatedCount,
      createdCount,
      updatedCount,
      errorCount,
      total: words.length,
      vocabName: vocabData.name
    })
  } catch (error: any) {
    console.error('Failed to import batch vocab:', error)
    res.status(500).json({ error: error?.message || 'Failed to import batch vocab' })
  }
})

router.post('/import-sample', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vocab } = req.query as { vocab?: string }
    const userId = req.userId!
    const vocabCode = vocab || 'cet4'
    const vocabPath = resolveVocabPath(vocabCode)

    if (!fs.existsSync(vocabPath)) {
      return res.status(404).json({ error: `Vocab ${vocabCode} not found` })
    }

    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'))
    const words = (vocabData.words || []) as ImportedWord[]

    if (words.length === 0) {
      return res.status(400).json({ error: 'Vocab file is empty' })
    }

    const normalizedWords = words.map((item) => normalizeWord(item.word))
    const existingWords = await prisma.word.findMany({
      where: {
        userId,
        word: { in: normalizedWords }
      }
    })

    const existingWordMap = new Map(existingWords.map((word) => [word.word, word.id]))
    const toCreate = words.filter((item) => !existingWordMap.has(normalizeWord(item.word)))
    const toUpdate = words.filter((item) => existingWordMap.has(normalizeWord(item.word)))

    const [createResults, updateResults] = await Promise.all([
      Promise.allSettled(
        toCreate.map((item) =>
          prisma.word.create({
            data: buildWordPayload(userId, vocabCode, item)
          })
        )
      ),
      Promise.allSettled(
        toUpdate.map((item) =>
          prisma.word.update({
            where: { id: existingWordMap.get(normalizeWord(item.word))! },
            data: {
              phonetic: item.phonetic || '',
              meanings: serialize(item.meanings),
              examples: serialize(item.examples),
              backgroundImage: item.backgroundImage || null,
              vocabSet: vocabCode,
              tags: serialize(item.tags || [])
            }
          })
        )
      )
    ])

    const createdCount = createResults.filter((result) => result.status === 'fulfilled').length
    const updatedCount = updateResults.filter((result) => result.status === 'fulfilled').length

    if (createdCount > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalWords: { increment: createdCount } }
      })
    }

    res.json({
      message: `Imported ${createdCount + updatedCount} words`,
      count: createdCount + updatedCount,
      createdCount,
      updatedCount,
      vocabName: vocabData.name
    })
  } catch (error) {
    console.error('Failed to import sample vocab:', error)
    res.status(500).json({ error: 'Failed to import sample vocab' })
  }
})

export default router
