import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

const MIN_ARTICLE_WORDS = 500

const joinParagraphs = (paragraphs: string[]) => paragraphs.join('\n\n')

const countEnglishWords = (text: string) => (text.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) || []).length

const ensureMinEnglishWords = (title: string, text: string, minWords: number) => {
  const wordCount = countEnglishWords(text)
  if (wordCount < minWords) {
    throw new Error(`${title} only has ${wordCount} words, below minimum ${minWords}`)
  }
  return text
}

const fullLengthArticles = [
  {
    title: 'How Consistent Reading Builds Real English Ability',
    titleZh: '持续整篇阅读如何真正提升英语能力',
    content: ensureMinEnglishWords(
      'How Consistent Reading Builds Real English Ability',
      joinParagraphs([
        `Most English learners agree that reading matters, yet many still train in a fragmented way. They memorize separate words, practice isolated sentences, and complete short question sets, but they do not spend enough time inside complete articles. As a result, they improve at recognition without improving at sustained understanding. When the text becomes longer, they lose the thread of the argument, forget what the previous paragraph was doing, and start depending too early on translation. This gap between short practice and long comprehension is one of the main reasons learners feel that they study hard but still read slowly.`,
        `A full article trains several layers of ability at the same time. The reader has to notice the topic, predict the direction of the discussion, identify the main claim, and understand how each paragraph supports that claim. Some paragraphs define a problem, some provide evidence, some introduce a contrast, and some push the writer toward a conclusion. If learners only practice short extracts, they rarely need to follow that movement from beginning to end. Complete reading is valuable because it forces them to see structure, and structure is exactly what supports comprehension under exam conditions.`,
        `Longer reading also builds tolerance for partial uncertainty. In real English use, nobody understands every word immediately. Good readers move forward with incomplete information, gather clues, and refine their understanding as the text develops. A complete article gives them room to do that. An unknown word in one paragraph may become clearer after an example appears later, or after a contrast marker reveals how the writer is using the idea. Learners who only train with short items often panic as soon as they meet one obstacle. Learners who train with whole texts learn to keep their balance and let context do more of the work.`,
        `Another reason complete articles matter is memory. Vocabulary remembered in isolation is easy to forget because it has weak connections. Vocabulary seen inside a developed argument is linked to topic, logic, and emotion. A learner may remember a word because it appeared in a paragraph about educational pressure, public policy, or workplace conflict. Those thematic links strengthen recall and make later review more efficient. When the same word appears across several full texts, the learner begins to understand not only its meaning, but also its common partners, tone, and range of use.`,
        `For self-study learners, the method does not need to be complicated. Start with one full article instead of five short fragments. Read the title and predict what the writer will discuss. Read once for general understanding without stopping at every difficult point. On the second pass, mark transition signals, key claims, and words that seem important to the writer's purpose. Then write a short summary in English. That summary step matters because it checks whether the reader followed the article as a whole instead of collecting only scattered facts. Over time, this routine turns reading from a passive exposure task into an active thinking exercise.`,
        `The same habit supports exam performance. In many reading questions, correct answers depend on the role of a detail rather than the detail itself. Students may recognize every sentence and still choose the wrong option because they missed the writer's tone, the purpose of an example, or the logic of a comparison. Full articles train readers to ask better questions. Why is this paragraph here? What problem is the writer solving? Which sentence carries the central claim? Once those questions become natural, comprehension becomes more stable and decision making becomes less random.`,
        `Consistent article-level reading is not about chasing perfection. The goal is not to understand every line like a dictionary. The goal is to stay with a complete text long enough to follow an argument, tolerate confusion, and rebuild meaning from context. When that ability becomes habitual, exam passages feel less intimidating, news reports become more accessible, and vocabulary review gains a much stronger foundation. In other words, complete reading does not only improve reading. It changes the quality of the learner's entire language system.`
      ]),
      MIN_ARTICLE_WORDS
    ),
    contentZh: '本文强调整篇阅读对结构理解、上下文推断、词汇记忆和考试判断的重要性，并给出适合自学考生的整篇阅读方法。',
    source: 'Platform Reading Pack',
    date: '2026-04-03',
    level: 'beginner',
    tags: JSON.stringify(['reading', 'study-method', 'full-article', '500-plus'])
  },
  {
    title: 'Why Self-Taught Learners Need Article-Level Comprehension',
    titleZh: '为什么自学者必须训练整篇文章理解',
    content: ensureMinEnglishWords(
      'Why Self-Taught Learners Need Article-Level Comprehension',
      joinParagraphs([
        `Self-taught learners are often disciplined, but discipline alone does not guarantee balanced progress. Many spend months on vocabulary lists and grammar notes, yet still feel uncomfortable when they meet a complete article. They may know many words individually, but they cannot quickly see how the writer builds an argument across several paragraphs. This mismatch happens because much self-study practice is designed around fragments. Fragments are efficient for drills, but they are not enough for the kind of comprehension required in formal reading tasks or real information intake.`,
        `Article-level comprehension is a combined skill. The reader must identify the topic, monitor the writer's purpose, distinguish main points from supporting detail, and track changes in tone or direction. None of these abilities grows well if practice stops at sentence level. A learner can become very good at translating lines one by one and still struggle to answer a simple question about the overall message of a text. That is why article training should not be treated as an advanced luxury. It is a basic requirement for anyone who wants stable reading ability.`,
        `Examination reading makes this issue especially clear. Many questions are not testing whether the learner understands a single sentence. They are testing whether the learner understands why a sentence appears where it does. A detail may function as an example, a warning, a concession, or a conclusion. If the reader cannot place that detail inside the larger structure, familiar vocabulary does not help much. Students often feel confused by this because they remember many words from the passage, but their answer still turns out to be wrong. The missing element is usually structural understanding, not word recognition.`,
        `Whole articles also make review more intelligent. Instead of storing words in a flat and disconnected list, the learner stores them inside themes. An article about education reform naturally groups language related to policy, pressure, fairness, standards, evaluation, and opportunity. An article about digital work habits may group expressions about attention, interruption, deadlines, and communication. This clustering supports memory because the vocabulary is not floating alone. It belongs to a situation. Later, when the learner meets one of those words again, the earlier article helps reactivate meaning and usage.`,
        `Another benefit is psychological. Learners who finish full articles stop seeing English as an endless wall of random difficulty. They start expecting shape. They know an introduction often frames the topic, middle paragraphs develop evidence, and an ending usually clarifies the writer's final position. That expectation reduces anxiety. It also improves speed, because the learner is no longer treating every sentence as equally mysterious. Instead, the learner reads with purpose, looking for how each part contributes to the whole.`,
        `For self-study use, article training should be deliberate. One useful routine is to read a full passage once for general meaning, then again to label paragraph roles. The learner can note where the writer introduces the problem, where evidence appears, where contrast is signaled, and where the conclusion becomes clear. After that, a short retelling in English helps consolidate understanding. This method does not require expensive resources. It only requires materials that are long enough to carry a complete idea and a study habit that values depth over rapid but shallow completion.`,
        `When self-taught learners build article-level comprehension, everything else becomes easier to organize. Vocabulary review becomes more meaningful, grammar stops feeling abstract, and exam reading becomes more predictable. The learner begins to think in larger units than individual lines. That shift is one of the clearest signs that study is moving from mechanical effort to genuine language ability.`
      ]),
      MIN_ARTICLE_WORDS
    ),
    contentZh: '本文解释自学者为什么不能只停留在单词和句子训练，而必须进入整篇文章理解，并说明这种能力如何直接影响考试阅读与长期记忆。',
    source: 'Platform Reading Pack',
    date: '2026-04-02',
    level: 'intermediate',
    tags: JSON.stringify(['reading', 'exam-strategy', 'full-article', '500-plus'])
  },
  {
    title: 'The Discipline Behind Better Exam Reading Decisions',
    titleZh: '更好的考试阅读判断背后需要什么训练',
    content: ensureMinEnglishWords(
      'The Discipline Behind Better Exam Reading Decisions',
      joinParagraphs([
        `In many English exams, the gap between an average score and a strong score is not explained by grammar knowledge alone. It is often explained by decision quality under time pressure. Readers have to decide which paragraph deserves careful attention, which sentence can be skimmed, and which detail is actually relevant to the question. Those decisions look quick from the outside, but they are built on disciplined reading habits. Without article-level practice, learners often make choices based on surface familiarity rather than textual logic.`,
        `A complete article teaches pacing. Introductions usually frame the issue, middle paragraphs expand it, and conclusions signal what the writer finally wants the reader to accept. When students repeatedly read full passages, they learn that not every sentence has the same function. Some lines provide background, some deliver evidence, some present an objection, and some reveal the author's position. This functional awareness is essential in exams because answer choices are often designed to tempt students toward visible but non-central information.`,
        `Distractors work precisely because they borrow language from the text. A weak reader sees familiar words and feels immediate confidence. A stronger reader asks a more disciplined question: does this option match the role of the information in the article? That difference in thinking matters more than many learners realize. Two students may both understand the literal meaning of a sentence, but the one who understands why the sentence was included is far more likely to choose correctly. Article training develops that second layer of judgment.`,
        `The same principle applies when vocabulary is unfamiliar. In short exercises, one difficult word can disrupt the whole task because there is not enough surrounding information to restore meaning. In a full article, readers have more tools. Repetition, examples, contrast markers, paragraph themes, and the writer's general purpose all narrow the range of possible meanings. This is why article-level reading is not simply harder than sentence practice. In the long run, it is also more realistic and more forgiving, because it reflects how meaning is recovered in actual reading situations.`,
        `Good exam readers also learn to separate information according to weight. They notice when a paragraph mainly provides context and when it introduces the thesis. They notice when a writer is describing a common view and when the writer is quietly disagreeing with it. They recognize that examples support a point rather than replace it. These distinctions create calm. Under timed conditions, calm is valuable because panic makes learners reread without purpose. Clear structure reduces unnecessary rereading and improves both speed and accuracy.`,
        `A practical training routine can be simple and demanding at the same time. Read one complete article and label the function of each paragraph in a few words. Mark transitions such as however, for example, in contrast, and therefore. Write a short summary of the writer's claim. The next day, return to the same article and read it again more quickly. Compare your second understanding with your first summary. This repeated contact builds both comprehension and judgment. The learner is not just reading more. The learner is learning how to think inside a passage.`,
        `Exams reward readers who stay organized inside complexity. They do not reward panic, and they do not reward isolated sentence translation as much as many students expect. Complete articles are the best training ground because they force the learner to manage meaning across a full structure. When that discipline becomes a habit, reading choices become faster, more accurate, and more defensible.`
      ]),
      MIN_ARTICLE_WORDS
    ),
    contentZh: '本文聚焦考试阅读中的判断能力，解释为什么整篇文章训练能帮助考生在时间压力下更稳定地做出正确选择。',
    source: 'Platform Reading Pack',
    date: '2026-04-01',
    level: 'advanced',
    tags: JSON.stringify(['reading', 'exam-strategy', 'full-article', '500-plus'])
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
      message: `已导入整篇阅读文章（每篇不少于 ${MIN_ARTICLE_WORDS} 词）`,
      count: fullLengthArticles.length
    })
  } catch (error) {
    console.error('Failed to import articles:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : '导入文章失败' })
  }
})

export default router
