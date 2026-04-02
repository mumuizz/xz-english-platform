import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

const fullLengthArticles = [
  {
    title: 'How Consistent Reading Builds Real English Ability',
    titleZh: '持续阅读如何真正提升英语能力',
    content: `Most English learners know that reading matters, but many still treat reading as a short exercise instead of a long-form habit. They memorize words, read isolated sentences, and finish test questions, yet they rarely stay with a complete article long enough to understand how ideas develop from beginning to end.

Real reading ability is not built only by recognizing vocabulary. It is built by following structure. A full article forces the learner to identify the topic, understand the writer's purpose, track transitions, and connect examples to the main argument. This process is close to what learners face in formal exams and in real-world English use.

When students read only fragments, they often depend on translation too early. They search for a single correct meaning for each sentence and lose the bigger picture. In contrast, a complete article trains them to tolerate uncertainty. Even when one paragraph is difficult, they can often infer the overall meaning from context, repetition, or contrast in later paragraphs.

Long-form reading also creates better memory conditions. Words seen in a complete article are connected to a theme, an argument, and a sequence of events. That kind of memory is stronger than isolated memorization because the brain stores the word with meaning, emotion, and logic. A learner who meets the same word in several full articles is far more likely to use it correctly later.

For self-study learners, the practical method is simple. Choose one complete article each session. Read the title first and predict the subject. Read the whole article once without stopping too often. On the second pass, mark unfamiliar words, useful sentence patterns, and transition signals such as however, therefore, and in addition. Finally, summarize the article in three to five English sentences. This last step turns passive input into active language production.

The goal is not to understand every single word. The goal is to build stable comprehension over a full text. Once this habit is established, exam reading becomes less intimidating, and everyday English materials become more accessible.`,
    contentZh: `很多学习者都知道阅读很重要，但仍然把阅读当成短句练习，而不是完整篇章训练。背单词、做句子题、刷阅读题都在做，可是真正把一篇文章从头读到尾、理解作者如何展开观点的人并不多。

真正的阅读能力不只是认出单词，而是能跟住文章结构。完整文章会逼着学习者判断主题、理解写作目的、追踪段落之间的衔接，并把例子和中心论点联系起来。这和正式考试以及真实英语场景中的阅读更接近。

只读碎片时，学生往往过早依赖翻译，执着于每句话的唯一意思，反而丢掉整体。读整篇文章则会训练“容忍不确定”的能力。即使某一段难，也能通过上下文、重复信息和后文转折推断主旨。

长篇阅读还有利于记忆。单词放在完整文章里，会和主题、论证、事件顺序一起进入记忆。这样的记忆比孤立背词更稳，因为大脑记住的是“词+意义+逻辑”。同一个词如果在多篇完整文章中反复出现，后续使用会更准确。

自学时可以用一个非常务实的方法：每次读一整篇。先看标题预测主题；第一遍尽量不停顿读完；第二遍标出不熟的词、好用的句型和转折词；最后用三到五句英文总结文章。这个总结动作会把被动输入转成主动输出。

目标不是每个词都看懂，而是建立对整篇文章的稳定理解。一旦这个习惯建立起来，考试阅读会更容易，日常英文材料也会更容易进入。`,
    source: 'Platform Reading Pack',
    date: '2026-04-02',
    level: 'beginner',
    tags: JSON.stringify(['reading', 'study-method', 'full-article'])
  },
  {
    title: 'Why Self-Taught Learners Need Article-Level Comprehension',
    titleZh: '为什么自学者必须训练整篇文章理解',
    content: `Self-taught learners often work very hard, but effort does not always produce balanced progress. A common pattern is that the learner spends months on vocabulary apps and grammar notes, yet still feels lost when reading a complete English article. The problem is not always lack of effort. The problem is often a mismatch between training materials and target ability.

Article-level comprehension requires several skills operating at the same time. The reader must recognize important vocabulary, follow sentence relationships, understand paragraph roles, and notice how the writer introduces evidence or opinion. These skills do not grow well if learning stays at the level of isolated drills only.

For examination purposes, complete articles are especially important. In many reading tasks, correct answers depend on understanding the writer's tone, the purpose of an example, or the logic of a comparison. A student may know almost every word in a paragraph and still choose the wrong answer because the article's larger structure is unclear.

Reading whole articles also makes review more efficient. After reading a full passage, the learner can collect vocabulary by topic instead of by random order. For example, an article about education reform may naturally group words related to policy, pressure, development, and evaluation. That grouping supports retention and later review much better than a flat word list.

Another advantage is confidence. Learners who finish full articles start to notice that English is not an endless wall of unknown words. They begin to predict structure. They expect introductions, examples, contrasts, and conclusions. This expectation reduces panic and increases reading speed because the text stops feeling chaotic.

Teachers often say that extensive reading matters, but extensive reading should not mean careless reading. It should mean enough length to carry a complete idea. Once learners can handle article-level texts, they are in a much stronger position to move into exam passages, news reports, and professional materials.`,
    contentZh: `很多自学者非常努力，但努力不一定带来均衡进步。常见情况是：背了很久单词、整理了很多语法笔记，可一到完整英文文章还是读不顺。问题不一定是努力不够，而往往是训练材料和目标能力不匹配。

整篇文章理解要求多种能力同时运行。读者既要认词，也要看懂句间关系、段落功能，还要识别作者如何提出观点、举例和推进论证。如果训练长期停留在零散题型层面，这些能力长不起来。

从考试角度看，完整文章尤为重要。很多题并不只是考单词，而是考语气、例子的作用、比较关系背后的逻辑。即使段落里大部分词都认识，如果看不清整篇结构，仍然会选错答案。

读整篇文章还有一个直接收益：复习更高效。文章会天然按主题组织词汇。比如教育改革类文章，会把政策、压力、发展、评价等词放在同一语境里，这比打散的词表更利于记忆和回顾。

另一个优势是信心。能读完完整文章的人，会逐渐发现英文不是一堵看不到尽头的词墙，而是有结构可预判的文本。读者会期待引入段、例证、对比和结论。这样的预期会降低慌张感，提高阅读速度。

所以，广泛阅读不等于随便刷几句，而是至少要有足够长度，能够承载一个完整观点。当学习者开始具备整篇文章理解能力，进入考试阅读、新闻材料甚至专业文本都会顺很多。`,
    source: 'Platform Reading Pack',
    date: '2026-04-01',
    level: 'intermediate',
    tags: JSON.stringify(['reading', 'exam-strategy', 'full-article'])
  },
  {
    title: 'The Discipline Behind Better Exam Reading Decisions',
    titleZh: '更好阅读判断背后的训练纪律',
    content: `In many English exams, the difference between an average score and a strong score is not grammar knowledge alone. It is decision quality under time pressure. The reader must decide what to skim, what to slow down for, and which details are actually linked to the question. This discipline does not appear automatically. It is trained through deliberate reading of complete texts.

A full article teaches pacing. The introduction usually gives direction, the middle paragraphs develop evidence, and the ending often signals the writer's final judgment. Students who train on full texts learn that not every sentence carries the same weight. They begin to separate background information from the author's central claim.

This distinction matters in multiple-choice tasks. Distractors often repeat visible facts while hiding the true logic of the passage. A learner with weak structural awareness may choose an option simply because it contains familiar words from the text. A learner with stronger article awareness asks a better question: does this option match the role of that information in the article?

The same principle applies to unknown vocabulary. In a short exercise, one unfamiliar word can interrupt the entire task. In a full article, the reader has more tools. Repetition, contrast markers, examples, and topic continuity help narrow the meaning. This is why article-level reading is not only harder than sentence practice. It is also more realistic and, in the long term, more forgiving.

Serious progress usually comes from a routine. Read one full article. Mark the thesis, transitions, and evidence. Write a short summary. Return the next day and read it again more quickly. Then compare your second reading with your first impression. This repeated contact builds both comprehension and judgment.

Exam reading rewards readers who can stay calm inside complexity. Complete articles are the most direct way to train that ability.`,
    contentZh: `很多英语考试中，平均分和高分的差距，不只是语法知识，而是在时间压力下做判断的质量。读者要决定哪些地方该略读，哪些地方该放慢，哪些细节真正和题目有关。这种阅读纪律不会自动出现，只能通过完整文本训练出来。

整篇文章会训练节奏感。引言通常负责定方向，中间段落展开证据，结尾常常给出作者最终判断。长期读整篇的人会慢慢知道：并不是每一句都同样重要，背景信息和中心观点要区分开。

这对选择题尤其关键。干扰项经常重复文中可见的事实，却悄悄偏离文章逻辑。结构感弱的学习者容易因为选项里出现了“熟悉原词”就选上；结构感强的人会先问一句：这个选项是否符合这条信息在文章中的角色？

同样的道理也适用于生词。短题里一个不认识的词就可能卡住全局；但在完整文章里，读者能借助重复、转折、例子和主题延续去缩小词义范围。所以整篇阅读不仅更难，也更真实，而且长期看反而更有容错空间。

真正有效的提升通常来自固定流程：读一整篇，标主旨、转折和证据；写一个小总结；隔一天再快速读一遍；对比第二遍和第一遍的理解差异。这样的重复接触，会同时提升理解和判断力。

考试阅读奖励的是能在复杂文本中保持冷静的人，而完整文章训练正是最直接的路径。`,
    source: 'Platform Reading Pack',
    date: '2026-03-31',
    level: 'advanced',
    tags: JSON.stringify(['reading', 'exam-strategy', 'full-article'])
  }
]

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { level, tag } = req.query
    const where: {
      level?: string
      tags?: { contains: string }
    } = {}

    if (typeof level === 'string' && level) {
      where.level = level
    }

    if (typeof tag === 'string' && tag) {
      where.tags = { contains: tag }
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    res.json(articles)
  } catch (error) {
    console.error('Failed to load articles:', error)
    res.status(500).json({ error: '获取文章失败' })
  }
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: Number.parseInt(req.params.id, 10) }
    })

    if (!article) {
      return res.status(404).json({ error: '文章不存在' })
    }

    res.json(article)
  } catch (error) {
    console.error('Failed to load article:', error)
    res.status(500).json({ error: '获取文章失败' })
  }
})

router.post('/import-people-daily', authMiddleware, async (_req: AuthRequest, res) => {
  try {
    await prisma.$transaction([
      prisma.article.deleteMany(),
      prisma.article.createMany({
        data: fullLengthArticles
      })
    ])

    res.json({
      message: '已导入整篇阅读文章',
      count: fullLengthArticles.length
    })
  } catch (error) {
    console.error('Failed to import articles:', error)
    res.status(500).json({ error: '导入文章失败' })
  }
})

export default router
