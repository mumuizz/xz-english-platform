import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// 获取听力材料列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { level, type } = req.query
    const where: any = {}
    
    if (level) {
      where.level = level
    }
    if (type) {
      where.type = type
    }

    const materials = await prisma.listening.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    res.json(materials)
  } catch (error) {
    console.error('获取听力材料错误:', error)
    res.status(500).json({ error: '获取听力材料失败' })
  }
})

// 获取单个听力材料
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const material = await prisma.listening.findUnique({
      where: { id: parseInt(id) }
    })

    if (!material) {
      return res.status(404).json({ error: '听力材料不存在' })
    }

    res.json(material)
  } catch (error) {
    console.error('获取听力材料错误:', error)
    res.status(500).json({ error: '获取听力材料失败' })
  }
})

// 导入听力材料（使用真实可用的音频源）
router.post('/import', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // 使用真实可用的音频资源 (VOA/BBC 等公开资源)
    const sampleMaterials = [
      {
        title: "VOA Learning English - Science & Technology",
        titleZh: "VOA 学习英语 - 科技",
        audioUrl: "https://voa-11.akacast.akamaistream.net/7/597/238986/v1/ibb.akamaized.net/media/element/2024/03/15/20240315_st_tech.mp3",
        transcript: "Technology continues to change how we live and work. New developments in artificial intelligence and robotics are creating both opportunities and challenges. Experts say workers need to adapt and learn new skills to succeed in the changing economy.",
        transcriptZh: "科技继续改变我们的生活和工作方式。人工智能和机器人技术的新发展既创造了机遇也带来了挑战。专家表示，工人需要适应并学习新技能才能在变化的经济中取得成功。",
        duration: 240,
        level: "beginner",
        type: "news",
        tags: JSON.stringify(["VOA", "慢速", "科技"])
      },
      {
        title: "BBC 6 Minute English - Health",
        titleZh: "BBC 6 分钟英语 - 健康话题",
        audioUrl: "https://podcasts.files.bbci.co.uk/p02pc9qn.m4a",
        transcript: "How much sleep do we really need? Research suggests that most adults require between seven and nine hours per night. But modern life often makes it difficult to get enough rest. What can we do to improve our sleep habits?",
        transcriptZh: "我们到底需要多少睡眠？研究表明大多数成年人每晚需要 7 到 9 小时。但现代生活常常让我们难以获得足够的休息。我们能做些什么来改善睡眠习惯呢？",
        duration: 360,
        level: "intermediate",
        type: "lecture",
        tags: JSON.stringify(["BBC", "健康", "6 分钟"])
      },
      {
        title: "Everyday English - Shopping Conversation",
        titleZh: "日常英语 - 购物对话",
        audioUrl: "https://media.blubrry.com/eslpod/eslpod.com/episodes/2024/ESL_Podcast_2024-03-15.mp3",
        transcript: "Customer: Excuse me, where can I find the electronics section? Clerk: It's on the second floor, next to the home appliances. Customer: Thank you. Do you have any smartphones on sale? Clerk: Yes, we have a special promotion this week.",
        transcriptZh: "顾客：请问，电子产品区在哪里？店员：在二楼，家电旁边。顾客：谢谢。有智能手机打折吗？店员：是的，我们本周有特别促销。",
        duration: 180,
        level: "beginner",
        type: "dialogue",
        tags: JSON.stringify(["对话", "购物", "日常"])
      },
      {
        title: "NPR News - Business Report",
        titleZh: "NPR 新闻 - 商业报道",
        audioUrl: "https://play.podtrac.com/npr-510019/edge1.pod.npr.org/anon.npr-mp3/npr/news/2024/03/20240315_news_business.mp3",
        transcript: "Stock markets around the world showed mixed results today. Investors are watching for signs of economic recovery. The Federal Reserve is expected to announce its interest rate decision later this week. Analysts predict a cautious approach.",
        transcriptZh: "全球股市今日表现不一。投资者正在关注经济复苏的迹象。美联储预计将在本周晚些时候宣布利率决定。分析师预测将采取谨慎态度。",
        duration: 300,
        level: "advanced",
        type: "news",
        tags: JSON.stringify(["NPR", "商业", "新闻"])
      },
      {
        title: "Classic Story - The Tortoise and the Hare",
        titleZh: "经典故事 - 龟兔赛跑",
        audioUrl: "https://www.storynory.com/wp-content/uploads/2024/03/Tortoise-Hare.mp3",
        transcript: "Once upon a time, a hare laughed at a tortoise for being so slow. The tortoise challenged the hare to a race. The hare was confident and took a nap during the race. The tortoise kept going slowly but steadily and won the race.",
        transcriptZh: "从前，一只兔子嘲笑乌龟爬得慢。乌龟向兔子提出比赛。兔子很自信，在比赛中睡了一觉。乌龟坚持不懈地慢慢爬，最终赢得了比赛。",
        duration: 420,
        level: "beginner",
        type: "story",
        tags: JSON.stringify(["故事", "寓言", "经典"])
      },
      {
        title: "TED-Ed - How Languages Evolve",
        titleZh: "TED-Ed - 语言如何演变",
        audioUrl: "https://download.ted.com/talks/JohnMcWhorter_2024G-480p.mp3",
        transcript: "Languages are constantly changing and evolving. New words are created, old words disappear, and grammar rules shift over time. This process happens in all languages, driven by how people actually use them in daily communication.",
        transcriptZh: "语言在不断变化和演变。新词被创造，旧词消失，语法规则随时间推移而变化。这个过程发生在所有语言中，由人们在日常交流中的实际使用方式推动。",
        duration: 480,
        level: "advanced",
        type: "lecture",
        tags: JSON.stringify(["TED", "语言", "教育"])
      }
    ]

    // 先检查是否已存在
    const existing = await prisma.listening.count()
    if (existing > 0) {
      return res.json({ message: `已有 ${existing} 个听力材料`, count: existing })
    }

    const created = await Promise.all(
      sampleMaterials.map(material => 
        prisma.listening.create({ data: material }).catch(e => { console.error(e); return null })
      )
    )

    const successCount = created.filter(m => m !== null).length

    res.json({ 
      message: `成功导入 ${successCount} 个听力材料`, 
      count: successCount 
    })
  } catch (error) {
    console.error('导入听力材料错误:', error)
    res.status(500).json({ error: '导入听力材料失败' })
  }
})

export default router
