#!/usr/bin/env tsx
/**
 * 词库导入脚本
 * 用法：tsx scripts/import-vocab.ts cet4
 */

import prisma from '../src/db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function importVocab(vocabCode: string) {
  const vocabPath = path.resolve(__dirname, '../../data/vocab', `${vocabCode}.json`)
  
  if (!fs.existsSync(vocabPath)) {
    console.error(`❌ 词库文件不存在：${vocabPath}`)
    return
  }
  
  const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'))
  const words = vocabData.words || []
  
  console.log(`📚 开始导入 ${vocabData.name}...`)
  console.log(`📊 共 ${words.length} 个单词`)
  
  let successCount = 0
  let skipCount = 0
  
  for (const w of words) {
    try {
      const existing = await prisma.word.findFirst({
        where: { word: w.word, vocabSet: vocabCode }
      })
      
      if (existing) {
        skipCount++
        continue
      }
      
      await prisma.word.create({
        data: {
          userId: 1,
          word: w.word,
          phonetic: w.phonetic || '',
          meanings: JSON.stringify(w.meanings || []),
          examples: JSON.stringify(w.examples || []),
          vocabSet: vocabCode,
          tags: JSON.stringify(w.tags || []),
          level: 0,
          nextReview: new Date()
        }
      })
      successCount++
      
      if (successCount % 50 === 0) {
        console.log(`  ✓ 已导入 ${successCount} 个...`)
      }
    } catch (error) {
      console.error(`  ✗ 导入失败：${w.word}`, error)
    }
  }
  
  console.log(`✅ 导入完成！`)
  console.log(`   成功：${successCount} 词`)
  console.log(`   跳过：${skipCount} 词`)
}

const vocabCode = process.argv[2] || 'cet4'
importVocab(vocabCode).catch(console.error)
