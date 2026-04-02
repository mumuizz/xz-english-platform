import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

const listeningMaterials = [
  {
    title: 'Self-study Exam Dialogue: Registration Day',
    titleZh: '自考场景听力：报名日对话',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    transcript: `Good morning. I am here to confirm my registration for the English exam.
Certainly. May I have your ID card and your admission number?
Here they are. I also want to check the time of the listening section.
The listening section starts at nine o'clock sharp, so please arrive at least thirty minutes early.
Do I need to bring my own headphones?
No. The testing center will provide the listening equipment, but you should bring black pens and your identification documents.`,
    transcriptZh: `早上好，我来确认英语考试报名信息。
可以，请出示身份证和准考证号。
给您。我还想确认一下听力部分开始的时间。
听力部分九点整开始，所以你最好提前至少三十分钟到达。
我需要自带耳机吗？
不用，考点会提供听力设备，但你需要带黑色签字笔和身份证件。`,
    duration: 165,
    level: 'beginner',
    type: 'dialogue',
    tags: JSON.stringify(['exam-focus', 'self-study', 'dialogue'])
  },
  {
    title: 'Self-study Exam Passage: Study Schedule',
    titleZh: '自考篇章听力：学习计划',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    transcript: `Many self-study learners fail not because they are not intelligent, but because they study without a stable schedule. A practical plan should include three parts: short daily review, focused listening practice, and a weekly reading summary. The daily review keeps old material active. Focused listening trains attention to details such as numbers, time, and speaker intention. The weekly summary helps learners connect different topics and notice repeated mistakes. With a fixed routine, learners become more efficient and less anxious before an exam.`,
    transcriptZh: `很多自考学习者失败并不是因为不聪明，而是因为学习安排不稳定。一个务实的计划应包含三部分：每天短时复习、集中听力训练，以及每周一次阅读总结。每天复习能让旧内容保持活跃；集中听力能训练对数字、时间和说话者意图等细节的捕捉；每周总结则帮助学习者把不同主题联系起来，并发现反复出现的错误。有了固定节奏，备考效率会更高，考前焦虑也会下降。`,
    duration: 215,
    level: 'intermediate',
    type: 'lecture',
    tags: JSON.stringify(['exam-focus', 'self-study', 'passage'])
  },
  {
    title: 'Self-study Advanced Listening: Education Policy Talk',
    titleZh: '自考高级听力：教育政策讲解',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    transcript: `Education policy discussions often require listeners to track more than isolated facts. A speaker may compare old policy targets with new implementation strategies, then explain why the changes matter for adult learners. In this kind of listening task, the best approach is to identify the topic sentence of each section and note the relationship between cause, policy choice, and expected result. Advanced learners should also pay attention to contrast signals, because exam questions often test whether the listener can distinguish previous conditions from current reforms.`,
    transcriptZh: `教育政策类听力并不只是听零散事实。讲话者可能先比较旧政策目标和新执行策略，再说明这些变化为什么会影响成人学习者。面对这类材料，最有效的方法是先抓住每一部分的主题句，再记录原因、政策选择和预期结果之间的关系。高级学习者还要特别注意转折信号，因为考试题经常会考查你能否分清“过去状况”和“当前改革”。`,
    duration: 260,
    level: 'advanced',
    type: 'lecture',
    tags: JSON.stringify(['exam-focus', 'self-study', 'policy'])
  },
  {
    title: 'Easy Listening: Morning Commute English',
    titleZh: '磨耳朵：通勤场景英语',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    transcript: `I usually leave home at seven thirty and catch the subway at seven forty-five. During the ride, I listen to short English audio clips. I do not try to understand every word. I only focus on key ideas and repeated expressions. After a few weeks, I noticed that common phrases became much easier to recognize. This kind of light practice is useful for busy learners because it turns free time into steady listening exposure.`,
    transcriptZh: `我通常七点半出门，七点四十五坐上地铁。通勤时我会听一些简短英语音频。我不会要求自己每个词都听懂，只关注核心意思和反复出现的表达。几周之后，我发现常见短语更容易被识别出来了。对时间紧张的学习者来说，这种轻量练习很有价值，因为它能把碎片时间转成稳定的听力输入。`,
    duration: 180,
    level: 'beginner',
    type: 'story',
    tags: JSON.stringify(['easy-listening', 'free-time', 'daily-life'])
  },
  {
    title: 'Easy Listening: Health Podcast Summary',
    titleZh: '磨耳朵：健康播客摘要',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    transcript: `In today's short podcast, the host talks about sleep habits and mental focus. She explains that people often try to improve productivity by working longer hours, but better rest can be more effective. She recommends reducing screen time before bed, keeping a regular schedule, and taking brief walks during the day. The advice is simple, but the language is natural and useful for everyday listening practice.`,
    transcriptZh: `今天这段短播客讨论的是睡眠习惯和注意力。主持人解释说，很多人想通过延长工作时间来提高效率，但更好的休息往往更有效。她建议睡前减少看屏幕、保持固定作息、白天短暂散步。这些建议本身很简单，但语言自然，很适合做日常磨耳朵训练。`,
    duration: 210,
    level: 'intermediate',
    type: 'news',
    tags: JSON.stringify(['easy-listening', 'free-time', 'podcast'])
  },
  {
    title: 'Easy Listening Advanced: Workplace Communication',
    titleZh: '磨耳朵高级：职场沟通',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    transcript: `Workplace communication becomes difficult when people assume that being direct and being rude are the same thing. In reality, clear communication often prevents misunderstanding and saves time. Effective professionals explain expectations early, confirm decisions in writing, and raise concerns before small issues become expensive problems. For advanced listeners, this topic is useful because it combines common business vocabulary with clear argumentative structure.`,
    transcriptZh: `当人们把“直接表达”和“粗鲁”混为一谈时，职场沟通就会变得困难。实际上，清晰表达往往能减少误解并节省时间。高效的职场人士会尽早说明预期、把决定落到书面上，并在小问题演变成高成本问题之前提出风险。对高级学习者来说，这个话题很适合听力训练，因为它同时包含常见商务词汇和清晰的论证结构。`,
    duration: 230,
    level: 'advanced',
    type: 'lecture',
    tags: JSON.stringify(['easy-listening', 'free-time', 'workplace'])
  }
]

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { level, type, scene } = req.query
    const where: {
      level?: string
      type?: string
      tags?: { contains: string }
    } = {}

    if (typeof level === 'string' && level) {
      where.level = level
    }

    if (typeof type === 'string' && type) {
      where.type = type
    }

    if (typeof scene === 'string' && scene) {
      where.tags = { contains: scene }
    }

    const materials = await prisma.listening.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    res.json(materials)
  } catch (error) {
    console.error('Failed to load listening materials:', error)
    res.status(500).json({ error: '获取听力材料失败' })
  }
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const material = await prisma.listening.findUnique({
      where: { id: Number.parseInt(req.params.id, 10) }
    })

    if (!material) {
      return res.status(404).json({ error: '听力材料不存在' })
    }

    res.json(material)
  } catch (error) {
    console.error('Failed to load listening material:', error)
    res.status(500).json({ error: '获取听力材料失败' })
  }
})

router.post('/import', authMiddleware, async (_req: AuthRequest, res) => {
  try {
    await prisma.$transaction([
      prisma.listening.deleteMany(),
      prisma.listening.createMany({
        data: listeningMaterials
      })
    ])

    res.json({
      message: '已导入自考导向与磨耳朵听力材料',
      count: listeningMaterials.length
    })
  } catch (error) {
    console.error('Failed to import listening materials:', error)
    res.status(500).json({ error: '导入听力材料失败' })
  }
})

export default router
