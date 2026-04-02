#!/usr/bin/env tsx
import prisma from './server/src/db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function importVocabSets() {
  console.log('\n📚 开始导入词库...')
  const vocabFiles = ['cet4', 'business', 'ielts', 'selfstudy']
  const userId = 1
  let totalWords = 0
  
  for (const vocabCode of vocabFiles) {
    const vocabPath = path.join(__dirname, 'data/vocab', `${vocabCode}.json`)
    if (!fs.existsSync(vocabPath)) {
      console.log(`  ⚠️  ${vocabCode}.json 不存在，跳过`)
      continue
    }
    
    const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'))
    const words = vocabData.words || []
    console.log(`  📖 ${vocabData.name || vocabCode}: ${words.length} 词`)
    
    const existing = await prisma.word.count({ where: { userId, vocabSet: vocabCode } })
    if (existing > 0) {
      console.log(`    ✓ 已有 ${existing} 词，跳过`)
      continue
    }
    
    let successCount = 0
    for (const w of words) {
      try {
        await prisma.word.create({
          data: {
            userId,
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
      } catch (e) {}
    }
    console.log(`    ✅ 导入 ${successCount} 词`)
    totalWords += successCount
  }
  
  if (totalWords > 0) {
    await prisma.user.update({ where: { id: userId }, data: { totalWords } })
  }
  console.log(`🎉 词库导入完成！共 ${totalWords} 词\n`)
}

async function importArticles() {
  console.log('📰 开始导入阅读文章...')
  const existing = await prisma.article.count()
  if (existing > 0) {
    console.log(`  ✓ 已有 ${existing} 篇文章，跳过\n`)
    return
  }
  
  const articles = [
    {
      title: "China's Economy Shows Strong Recovery",
      titleZh: "中国经济展现强劲复苏",
      content: "China's economy demonstrated resilient growth in the first quarter, with GDP expanding by 5.3 percent year-on-year. The recovery was driven by strong domestic consumption and robust industrial production. Key highlights include retail sales growth of 10.5%, industrial production increase of 6.8%, and stable unemployment rate at 5.2%. Analysts say the positive momentum is expected to continue throughout the year as policy support remains in place.",
      contentZh: "中国经济在第一季度展现出韧性增长，GDP 同比增长 5.3%。复苏由强劲的内需和稳健的工业生产驱动。主要亮点包括零售额增长 10.5%，工业生产增长 6.8%，失业率稳定在 5.2%。分析师表示，随着政策支持持续，全年有望保持积极势头。",
      source: "People's Daily",
      date: "2026-03-28",
      level: "intermediate",
      tags: JSON.stringify(["经济", "GDP"])
    },
    {
      title: "The Rise of Electric Vehicles",
      titleZh: "电动汽车的崛起",
      content: "Electric vehicles are transforming the automotive industry worldwide. In China, EV sales reached a record 35% market share last month. The transformation is driven by government subsidies, improved charging infrastructure, falling battery costs, and growing environmental awareness. Major automakers like BYD, Tesla, and NIO are competing fiercely for market share. China now has over 2 million public charging piles.",
      contentZh: "电动汽车正在全球范围内改变汽车行业。在中国，电动汽车销量上个月达到 35% 的市场份额创纪录。这一转型由政府补贴、充电基础设施改善、电池成本下降和环保意识增强驱动。比亚迪、特斯拉和蔚来等主要汽车制造商正在激烈争夺市场份额。中国现在拥有超过 200 万个公共充电桩。",
      source: "People's Daily",
      date: "2026-03-27",
      level: "intermediate",
      tags: JSON.stringify(["科技", "新能源"])
    },
    {
      title: "Traditional Culture in Modern Times",
      titleZh: "现代社会中的传统文化",
      content: "Young Chinese people are rediscovering their cultural heritage in innovative ways. From hanfu fashion to traditional music, ancient traditions are finding new life in the digital age. Social media platforms like Douyin and Bilibili have played a crucial role. Museums report that over 60% of visitors are under 30 years old. The Palace Museum has developed creative products generating over 1 billion yuan in annual sales.",
      contentZh: "中国年轻人正在以创新的方式重新发现他们的文化遗产。从汉服到传统音乐，古老传统正在数字时代焕发新生。抖音和哔哩哔哩等社交媒体平台发挥了关键作用。博物馆报告称超过 60% 的游客年龄在 30 岁以下。故宫博物院开发了年销售额超过 10 亿元的创意产品。",
      source: "People's Daily",
      date: "2026-03-26",
      level: "advanced",
      tags: JSON.stringify(["文化", "传统"])
    },
    {
      title: "My Daily Routine",
      titleZh: "我的日常生活",
      content: "I wake up at 7 o'clock every morning. After brushing my teeth and washing my face, I have breakfast with my family. We usually eat bread, eggs, and drink milk. I go to work at 8:30 by subway. The journey takes about 30 minutes. I start work at 9 o'clock. Lunch break is at 12:00. After work, I go to the gym or meet friends for dinner. I try to go to bed before 11 o'clock.",
      contentZh: "我每天早上 7 点起床。刷牙洗脸后，我和家人一起吃早餐。我们通常吃面包、鸡蛋，喝牛奶。我 8 点半坐地铁去上班。路程大约需要 30 分钟。我 9 点开始工作。12 点是午休时间。下班后，我去健身房或和朋友一起吃晚饭。我尽量在 11 点前睡觉。",
      source: "Learning English",
      date: "2026-03-25",
      level: "beginner",
      tags: JSON.stringify(["日常", "生活"])
    },
    {
      title: "The Benefits of Reading",
      titleZh: "阅读的好处",
      content: "Reading is one of the best habits you can develop. It improves vocabulary and language skills, enhances critical thinking abilities, boosts memory and concentration, and reduces stress. Experts recommend reading at least 20 minutes per day. You don't need to read serious books all the time. Fiction, magazines, and online articles all count. The key is to find what you enjoy and make reading a regular part of your routine.",
      contentZh: "阅读是你能养成的最好习惯之一。它提高词汇量和语言技能，增强批判性思维能力，提升记忆力和注意力，减轻压力。专家建议每天至少阅读 20 分钟。你不需要一直读严肃的书籍。小说、杂志和在线文章都算。关键是找到你喜欢的内容，让阅读成为日常生活的一部分。",
      source: "Learning English",
      date: "2026-03-24",
      level: "beginner",
      tags: JSON.stringify(["阅读", "习惯"])
    }
  ]
  
  let successCount = 0
  for (const article of articles) {
    try {
      await prisma.article.create({ data: article })
      successCount++
    } catch (e) { console.error(e) }
  }
  console.log(`  ✅ 导入 ${successCount} 篇文章\n`)
}

async function importListeningMaterials() {
  console.log('🎧 开始导入听力材料...')
  const existing = await prisma.listening.count()
  if (existing > 0) {
    console.log(`  ✓ 已有 ${existing} 个听力材料，跳过\n`)
    return
  }
  
  const materials = [
    {
      title: "VOA Learning English - Technology",
      titleZh: "VOA 学习英语 - 科技",
      audioUrl: "https://voa-11.akacast.akamaistream.net/7/597/238986/v1/ibb.akamaized.net/media/element/2024/03/15/20240315_st_tech.mp3",
      transcript: "Technology continues to change how we live and work. New developments in artificial intelligence and robotics are creating both opportunities and challenges. Experts say workers need to adapt and learn new skills to succeed in the changing economy. Many jobs that exist today may disappear in the next decade. However, new jobs will also be created. The key is to stay flexible and keep learning throughout your career.",
      transcriptZh: "科技继续改变我们的生活和工作方式。人工智能和机器人技术的新发展既创造了机遇也带来了挑战。专家表示，工人需要适应并学习新技能才能在变化的经济中取得成功。许多今天存在的工作可能在未来十年消失。然而，新的工作机会也会被创造出来。关键是保持灵活性，在整个职业生涯中不断学习。",
      duration: 180,
      level: "beginner",
      type: "news",
      tags: JSON.stringify(["VOA", "慢速", "科技"])
    },
    {
      title: "BBC 6 Minute English - Sleep",
      titleZh: "BBC 6 分钟英语 - 睡眠话题",
      audioUrl: "https://podcasts.files.bbci.co.uk/p02pc9qn.m4a",
      transcript: "How much sleep do we really need? Research suggests that most adults require between seven and nine hours per night. But modern life often makes it difficult to get enough rest. What can we do to improve our sleep habits? First, maintain a regular sleep schedule. Go to bed and wake up at the same time every day. Second, create a relaxing bedtime routine. Avoid screens for at least an hour before bed. Third, make your bedroom comfortable. Keep it cool, dark, and quiet.",
      transcriptZh: "我们到底需要多少睡眠？研究表明大多数成年人每晚需要 7 到 9 小时。但现代生活常常让我们难以获得足够的休息。我们能做些什么来改善睡眠习惯呢？第一，保持规律的睡眠时间表。每天在同一时间上床睡觉和起床。第二，创建放松的睡前习惯。睡前至少一小时避免使用电子屏幕。第三，让卧室舒适。保持凉爽、黑暗和安静。",
      duration: 360,
      level: "intermediate",
      type: "lecture",
      tags: JSON.stringify(["BBC", "健康"])
    },
    {
      title: "Everyday English - At the Restaurant",
      titleZh: "日常英语 - 在餐厅",
      audioUrl: "https://media.blubrry.com/eslpod/eslpod.com/episodes/2024/ESL_Podcast_2024-03-15.mp3",
      transcript: "Waiter: Good evening! Welcome to our restaurant. Do you have a reservation? Customer: Yes, under the name Smith. Waiter: Let me check... Yes, table for four. Please follow me. Customer: Thank you. Could we sit by the window? Waiter: Of course. Here are your menus. Can I get you something to drink? Customer: I'll have a glass of red wine, please. Waiter: Excellent choice. Our special today is grilled salmon with vegetables.",
      transcriptZh: "服务员：晚上好！欢迎光临我们餐厅。您有预订吗？顾客：是的，用 Smith 的名字预订的。服务员：让我查一下... 是的，四人桌。请跟我来。顾客：谢谢。我们可以坐在窗边吗？服务员：当然可以。这是你们的菜单。需要点什么喝的吗？顾客：我要一杯红酒。服务员：很好的选择。我们今天的特色菜是烤三文鱼配蔬菜。",
      duration: 120,
      level: "beginner",
      type: "dialogue",
      tags: JSON.stringify(["对话", "餐厅"])
    },
    {
      title: "The Story of Starbucks",
      titleZh: "星巴克的故事",
      audioUrl: "https://www.storynory.com/wp-content/uploads/2024/03/Tortoise-Hare.mp3",
      transcript: "Starbucks began in 1971 in Seattle, Washington. Three partners opened the first coffee shop in Pike Place Market. The name comes from a character in the novel Moby Dick. In 1987, Howard Schultz bought the company and began expanding. He had visited Italy and was inspired by Italian coffee culture. Today, Starbucks has over 30,000 stores in more than 80 countries. It's the largest coffee chain in the world.",
      transcriptZh: "星巴克于 1971 年在华盛顿州西雅图成立。三位合伙人在派克市场开了第一家咖啡店。这个名字来自小说《白鲸记》中的一个角色。1987 年，霍华德·舒尔茨买下了公司并开始扩张。他曾访问意大利，受到意大利咖啡文化的启发。如今，星巴克在 80 多个国家拥有超过 30,000 家门店。它是全球最大的咖啡连锁店。",
      duration: 240,
      level: "intermediate",
      type: "story",
      tags: JSON.stringify(["故事", "商业"])
    }
  ]
  
  let successCount = 0
  for (const m of materials) {
    try {
      await prisma.listening.create({ data: m })
      successCount++
    } catch (e) { console.error(e) }
  }
  console.log(`  ✅ 导入 ${successCount} 个听力材料\n`)
}

async function main() {
  console.log('🚀 开始导入数据...\n')
  try {
    await importVocabSets()
    await importArticles()
    await importListeningMaterials()
    console.log('🎉 所有数据导入完成！\n')
  } catch (error) {
    console.error('❌ 导入失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
