import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

const MIN_LISTENING_WORDS = 500

const joinParagraphs = (paragraphs: string[]) => paragraphs.join('\n\n')

const countEnglishWords = (text: string) => (text.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) || []).length

const ensureMinEnglishWords = (title: string, text: string, minWords: number) => {
  const wordCount = countEnglishWords(text)
  if (wordCount < minWords) {
    throw new Error(`${title} only has ${wordCount} words, below minimum ${minWords}`)
  }
  return text
}

const listeningMaterials = [
  {
    title: 'Self-study Exam Dialogue: Registration Day',
    titleZh: '自考听力对话：报名与考试日确认',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    transcript: ensureMinEnglishWords(
      'Self-study Exam Dialogue: Registration Day',
      joinParagraphs([
        `Good morning. I am here to confirm my registration for the English exam. Certainly. May I have your ID card and admission number? Here they are. Thank you. I can see your application in the system, but let me verify your exam center, your seat number, and the schedule for the listening section. The exam center is West Lake Adult Education Campus, and your room number is 302. The listening section begins at nine o'clock sharp, so we strongly recommend that candidates arrive at least thirty minutes early. If you arrive after the audio instructions have started, the staff may not be able to admit you on time.`,
        `I understand. I also want to confirm whether the listening section uses shared speakers or individual headsets. The center will provide the listening equipment, but candidates should still test the sound during the trial playback. If the volume is too low, or if you hear static noise, raise your hand immediately. Do not wait until the formal recording begins. Many candidates lose marks not because they cannot understand the material, but because they spend the first minute adjusting to technical problems that should have been reported earlier. That first minute matters because the questions often contain numbers, names, and instructions that are difficult to recover later.`,
        `Should I bring any special stationery for the listening section? Bring your identification documents, your admission slip, two black pens, and, if the exam notice permits it, a pencil for quick note taking. Some candidates also bring a transparent bottle of water, but you should check the local rules before entering the room. More importantly, you should bring a clear listening routine. Before the audio starts, read the answer sheet carefully, look at the question order, and predict what kinds of information you may hear. If the options contain times, places, or speaker relationships, pay special attention to those categories while listening.`,
        `That makes sense. I often feel nervous before listening tasks. Is there any practical advice for staying calm? Yes. First, do not try to understand every single word. Focus on the task. If the question asks where the speakers will meet, you do not need to remember every adjective in the conversation. Second, use the pauses between sections. Those pauses are not empty time. They are your chance to confirm what you heard, eliminate impossible answers, and prepare for the next part. Third, if you miss one answer, do not keep chasing it. Continue listening. Candidates often lose more points by mentally staying with the previous question than by guessing and moving on.`,
        `I see. What about after the listening section? After the recording ends, check whether your answers are in the correct positions on the answer sheet. Many errors come from misalignment rather than misunderstanding. If the exam includes a transfer stage, use it carefully. Count the question numbers, and make sure each mark matches the intended item. For longer passages, it can also help to remember the broad structure. Was the speaker explaining a problem, giving advice, or comparing two choices? Structural awareness improves listening because it helps you predict what kind of detail is likely to come next. That is true for both everyday listening and formal testing.`,
        `Thank you. This is more detailed than I expected, but it is very useful. You are welcome. The goal is not only to arrive at the right room. The goal is to arrive with the right method. Candidates who prepare their documents, test the equipment early, predict the task, and recover quickly from missed information usually perform much better than candidates who only rely on last-minute concentration. Good preparation reduces anxiety, and reduced anxiety gives you a better chance of hearing what is actually there.`
      ]),
      MIN_LISTENING_WORDS
    ),
    transcriptZh: '围绕自考英语听力考试当天的报名确认、设备检查、答题节奏和应试方法展开的长对话材料。',
    duration: 420,
    level: 'beginner',
    type: 'dialogue',
    tags: JSON.stringify(['exam-focus', 'self-study', 'dialogue', '500-plus'])
  },
  {
    title: 'Self-study Exam Passage: Study Schedule',
    titleZh: '自考听力篇章：高效备考时间安排',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    transcript: ensureMinEnglishWords(
      'Self-study Exam Passage: Study Schedule',
      joinParagraphs([
        `Many self-study learners fail not because they lack intelligence, but because they study without a stable schedule. When study decisions are made only according to mood, urgent tasks replace important tasks, and listening practice is often the first thing to disappear. A practical exam plan should therefore be built around repetition and predictability. The learner needs short daily review, focused listening training, weekly reading consolidation, and regular time for checking progress. These elements may sound simple, but together they create the steady rhythm that most adult learners need.`,
        `The daily review does not need to be long. Twenty to thirty minutes can be enough if the work is specific. The learner can quickly revisit high-frequency words, review previous dictation errors, or listen again to a short section from an earlier material. The purpose of daily review is not to feel productive through quantity. The purpose is to keep old material active, so that each new study session does not begin from zero. Without that maintenance, vocabulary fades, patterns become unfamiliar again, and the learner experiences the frustrating feeling of always studying but never accumulating.`,
        `Focused listening training should appear several times each week. During these sessions, the learner chooses one material and works with clear goals. One day the goal may be numbers and dates. Another day it may be speaker attitude, contrast signals, or reasons and results. Targeted practice is important because exam listening is not random. Questions usually test a limited range of skills, and the learner improves faster when those skills are named and trained deliberately. After the first full listen, the learner should replay difficult sections, compare what was heard with the transcript, and note what kind of mistake occurred. Was the problem vocabulary, speed, connected speech, or attention drift?`,
        `Weekly reading consolidation supports listening more than many students expect. Reading and listening are not separate worlds. When learners read article-level texts on education, health, communication, or exam preparation, they become familiar with the vocabulary and logic that later appear in listening passages. A weekly summary also helps connect topics. For example, a week of study might include an article about work habits, a listening passage about productivity, and vocabulary about routines and planning. When those pieces are reviewed together, memory becomes much stronger because the material is organized by meaning rather than by isolated task type.`,
        `Another essential part of a schedule is recovery time. Adult learners often believe that a good plan must feel heavy, but a plan that cannot continue is not a good plan. One light session each week can be used for easy listening during commuting, walking, or housework. The goal of that session is not full comprehension. It is exposure. Repeated contact with natural rhythm, common phrases, and familiar topics reduces stress and increases listening tolerance. This lighter training is especially useful for people preparing for self-study exams while working or managing family responsibilities.`,
        `The final part of a useful schedule is reflection. At the end of each week, the learner should ask three questions. What improved this week? What still breaks down under speed? What should be the main listening focus next week? These questions prevent passive repetition. They turn the study plan into a feedback system. Over several months, the effect becomes visible. Learners become less anxious before an exam, more accurate with detail questions, and more realistic about how to distribute their effort. Stable progress usually comes from stable scheduling, and stable scheduling is a skill that can be learned.`
      ]),
      MIN_LISTENING_WORDS
    ),
    transcriptZh: '围绕自考备考节奏、每日复习、专项听力训练、每周总结与轻量磨耳朵安排展开的长篇听力材料。',
    duration: 430,
    level: 'intermediate',
    type: 'lecture',
    tags: JSON.stringify(['exam-focus', 'self-study', 'passage', '500-plus'])
  },
  {
    title: 'Self-study Advanced Listening: Education Policy Talk',
    titleZh: '自考高级听力：教育政策与成人学习者',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    transcript: ensureMinEnglishWords(
      'Self-study Advanced Listening: Education Policy Talk',
      joinParagraphs([
        `Education policy discussions often require listeners to track more than isolated facts. A speaker may compare old policy targets with new implementation strategies, then explain why those changes matter for adult learners, working students, and regional education systems. In advanced listening, the challenge is not only vocabulary. It is the ability to hear structure while information is moving quickly. Listeners need to notice when the speaker is defining the problem, when evidence is introduced, when a contrast appears, and when a policy recommendation is finally stated.`,
        `Consider a typical policy lecture on adult education reform. The speaker may begin by describing an earlier model that focused heavily on enrollment numbers. That model might have looked successful because access increased, but the lecturer then introduces a second concern: access without completion does not solve the deeper problem. Adults who register for courses still face time pressure, work obligations, family responsibilities, and uneven preparation. At this point, the lecture shifts from description to evaluation. A strong listener notices that the lecture is no longer just reporting history. It is preparing to argue for a different standard of success.`,
        `The next stage often introduces specific reforms. These may include modular course design, flexible examination windows, blended learning support, and stronger guidance services for learners who have been away from school for many years. When the speaker lists these reforms, advanced listeners should not treat the list as a flat series of details. They should ask how each measure answers a previously stated problem. Flexible scheduling answers time pressure. Guidance services answer uncertainty and dropout risk. Modular design answers the difficulty of returning to long programs after years outside formal education. Understanding those links makes the lecture far easier to follow.`,
        `Policy lectures also rely heavily on contrast signals. Words such as however, by contrast, instead, nevertheless, and at the same time often mark moments where the speaker adjusts the argument. In exams, those signals are especially important because questions frequently test whether the listener can distinguish a rejected view from the speaker's final position. Many learners lose marks because they remember a striking fact from the beginning of a lecture and assume it reflects the speaker's conclusion. In reality, the speaker may have introduced that fact only to criticize it later. Advanced listening requires patience long enough to hear the full movement of the reasoning.`,
        `Another useful strategy is to group information into categories while listening. One category may describe causes, another may describe reforms, and a third may describe expected results. If the listener mentally separates those layers, the lecture becomes easier to reconstruct afterward. For example, causes may include dropout pressure, weak preparation, or inflexible schedules. Reforms may include online support, staged assessment, and mentoring. Expected results may include improved completion rates, fairer access, and better long-term skill development. Even if some vocabulary is missed, the larger frame remains stable.`,
        `This kind of listening is valuable for self-study exam candidates because it develops precisely the habits they need under pressure. They learn to stay calm when ideas become dense, to listen for structure rather than chase every word, and to recover meaning through logical relationships. Those habits matter in policy lectures, but they also transfer to academic talks, news analysis, and professional communication. Advanced listening is demanding, but it becomes manageable when the learner stops treating spoken English as a stream of separate sentences and starts hearing it as organized thought.`
      ]),
      MIN_LISTENING_WORDS
    ),
    transcriptZh: '围绕教育政策讲座中的结构识别、对比信号、因果关系和应试听法展开的高级长篇材料。',
    duration: 440,
    level: 'advanced',
    type: 'lecture',
    tags: JSON.stringify(['exam-focus', 'self-study', 'policy', '500-plus'])
  },
  {
    title: 'Easy Listening: Morning Commute English',
    titleZh: '磨耳朵：通勤场景英语输入',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    transcript: ensureMinEnglishWords(
      'Easy Listening: Morning Commute English',
      joinParagraphs([
        `I usually leave home at seven thirty and catch the subway at seven forty-five. During the ride, I listen to English audio. At first I thought this habit would not matter because commuting time feels scattered and noisy. However, after several months I learned that short and repeated contact with spoken English can be surprisingly powerful. The key is to lower the pressure. I do not expect perfect understanding. I simply try to stay in contact with natural rhythm, familiar expressions, and a few repeated ideas.`,
        `In the beginning, I chose audio that was too difficult. I believed that harder material would produce faster improvement. Instead, it produced frustration. I kept replaying the same thirty seconds, and I finished the commute feeling tired rather than encouraged. Later I changed my method. I started choosing material with clear pronunciation, familiar topics, and moderate speed. I listened once without pausing, then let the rest of the ride pass without forcing myself to analyze every sentence. That lighter approach made the habit sustainable, and sustainability mattered more than intensity.`,
        `Commuting is useful because it happens almost every day. A habit attached to a fixed part of the day is easier to maintain than a habit that depends on ideal study conditions. I do not need a desk, a notebook, or a special plan. I only need headphones and a prepared playlist. Some days I listen to everyday conversation about work, meals, travel, or scheduling. Other days I choose short podcasts about health, learning, or daily routines. Because the topics repeat across weeks, I begin to notice how certain phrases return in slightly different forms. That repetition builds familiarity even when my attention is not perfect.`,
        `Another advantage of commute listening is emotional. Many learners associate English with tests, mistakes, and pressure. During a commute, the task can feel lighter. I am not being examined. I am simply spending time with the language. This lower pressure changes the way I listen. I notice intonation, speaker energy, and useful chunks of language. Some expressions stay in my mind because I hear them many times, not because I deliberately memorized them. Over time, this kind of contact reduces the shock of faster speech because the ear becomes more used to connected sounds.`,
        `Of course, commute listening works best when it is paired with simple review. If a sentence or phrase catches my attention, I save it and revisit it later in the evening. I may write down a useful expression such as make time for, run out of, or keep track of. I may also notice how speakers soften opinions, give reasons, or correct themselves. These are small details, but together they make spoken English feel more natural. The goal is not to turn every commute into a formal lesson. The goal is to create steady exposure that supports more focused study later.`,
        `Busy learners often believe they need large blocks of free time before listening practice can be meaningful. In reality, small and repeated sessions can change listening ability if the material is appropriate and the expectation is realistic. A commute may only last twenty or thirty minutes, but it happens again and again. When that time becomes consistent English input, free time stops being wasted. It becomes part of a larger learning system.`
      ]),
      MIN_LISTENING_WORDS
    ),
    transcriptZh: '面向碎片时间磨耳朵的长篇材料，重点讲通勤听英语的选材、节奏和长期收益。',
    duration: 410,
    level: 'beginner',
    type: 'story',
    tags: JSON.stringify(['easy-listening', 'free-time', 'daily-life', '500-plus'])
  },
  {
    title: 'Easy Listening: Health Podcast Summary',
    titleZh: '磨耳朵：健康播客摘要',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    transcript: ensureMinEnglishWords(
      'Easy Listening: Health Podcast Summary',
      joinParagraphs([
        `In today's podcast summary, the host talks about sleep habits, mental focus, and the way small daily choices affect long-term energy. She begins by challenging a familiar idea. Many people believe productivity improves when they simply work longer hours, but the host argues that rest, routine, and recovery often matter more. A tired mind may stay busy, yet still make poor decisions, miss simple details, and lose patience quickly. For listeners, this topic is useful because it combines practical advice with natural spoken English about everyday life.`,
        `The host first discusses sleep timing. She explains that the body responds well to regularity, even more than people often realize. Going to bed at a different hour every night creates instability, and instability weakens concentration the next day. She is not demanding perfection. Instead, she recommends choosing a realistic bedtime and protecting it most days of the week. For learners listening in English, this section offers common phrases about routines, habits, and personal discipline, all spoken in a calm and accessible style.`,
        `Next, the host turns to screen use. Many listeners already know that staring at a phone late at night is not ideal, but she explains why. Bright screens keep the mind alert, and fast streams of information make it harder to settle into rest. She suggests replacing the final fifteen or twenty minutes before sleep with quieter habits such as light reading, stretching, or preparing for the next morning. What matters here is not only the advice itself. It is the structure of the explanation. The host presents the problem, explains the mechanism, and then offers practical alternatives. That pattern is useful for listening practice because it helps learners predict what comes next.`,
        `The podcast then moves to daytime energy. The host says that focus is not built only at the desk. Short walks, regular water intake, and small pauses between tasks can improve mental clarity. She warns against the habit of moving from one screen directly to another with no reset at all. According to her, many people confuse constant stimulation with effectiveness. In fact, a brief pause can increase output because it restores attention. This section is helpful for easy listening because the language is repetitive in a good way. Key words such as energy, routine, break, focus, and recovery appear several times in slightly different contexts.`,
        `Toward the end, the host addresses a common mistake: waiting for motivation before making a healthy change. She argues that motivation is unreliable, while simple systems are dependable. If someone prepares water before bed, lays out exercise clothes, or blocks ten minutes for a walk after lunch, the desired action becomes easier. This idea also applies to language study. Small systems often outperform large intentions. The host never turns the episode into a lecture about perfection. Instead, she keeps returning to a practical message: make healthy choices easy enough to repeat.`,
        `For learners using podcasts as listening practice, this kind of episode is ideal for free time. The topic is familiar, the structure is clear, and the speaker repeats important ideas without sounding unnatural. You can listen once for general meaning, then again to catch useful phrases. Over time, episodes like this improve listening not because they are dramatic, but because they are understandable, reusable, and easy to fit into daily life.`
      ]),
      MIN_LISTENING_WORDS
    ),
    transcriptZh: '以健康播客摘要为载体，讲解睡眠、专注与日常习惯，适合碎片时间反复听。',
    duration: 405,
    level: 'intermediate',
    type: 'news',
    tags: JSON.stringify(['easy-listening', 'free-time', 'podcast', '500-plus'])
  },
  {
    title: 'Easy Listening Advanced: Workplace Communication',
    titleZh: '磨耳朵高级：职场沟通与表达',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    transcript: ensureMinEnglishWords(
      'Easy Listening Advanced: Workplace Communication',
      joinParagraphs([
        `Workplace communication becomes difficult when people assume that being direct and being rude are the same thing. In reality, clear communication often prevents misunderstanding, reduces repeated work, and protects relationships better than vague politeness. In today's advanced easy-listening passage, we look at how professionals explain expectations, raise concerns, and confirm decisions in ways that sound firm without sounding hostile. This topic is useful because it includes common business vocabulary, realistic reasoning, and a structure that advanced learners can follow with repeated listening.`,
        `The first principle is clarity about expectations. Many workplace problems begin because responsibilities were implied rather than stated. A manager may believe a deadline was obvious, while a team member believed the task was still flexible. Later, both sides feel frustrated. Strong communicators reduce this risk by naming the deadline, the standard, and the next step. They do not assume shared understanding where none has been checked. In spoken English, this often means using clear markers such as by Friday, the final version, our next step, and just to confirm. These phrases appear frequently in professional contexts and are worth hearing repeatedly.`,
        `The second principle is written confirmation after spoken discussion. In meetings, people may nod and still remember different conclusions. A short follow-up message can prevent that problem. It does not need to be long. It may simply restate the decision, assign ownership, and mention the timeline. This habit matters because memory is selective, especially when work is busy. For advanced listeners, this section shows how spoken reasoning leads to practical action. The speaker is not only describing a good habit. The speaker is explaining the cost of not using it: duplicated effort, missed deadlines, and conflict that could have been avoided.`,
        `The third principle is early escalation. Many professionals wait too long before raising a concern because they fear sounding negative. However, silence is often more expensive than discomfort. A small risk discussed early may stay small. A small risk ignored for two weeks may become a crisis. Good communicators therefore raise concerns with evidence and context. They explain what they noticed, why it matters, and what kind of response would help. This approach is different from vague complaint. It turns concern into usable information. In listening practice, this distinction is useful because the speaker often contrasts emotional reactions with structured reporting.`,
        `Another important idea is tone control. Clear communication is easier to accept when the speaker respects the other person's workload and perspective. A direct message can still sound cooperative if it includes context, a shared goal, and a workable request. For example, saying we need to decide today because the client review starts tomorrow sounds more constructive than saying this delay is unacceptable. The information may be similar, but the framing changes how the message is received. Advanced learners benefit from hearing these differences because professional English often depends as much on tone management as on vocabulary choice.`,
        `In the end, effective workplace communication is not a talent reserved for naturally confident people. It is a repeatable set of habits: clarify expectations, confirm decisions, raise concerns early, and manage tone without hiding the message. Materials like this are useful for easy listening because they reward repeated exposure. The first listen may focus on topic and structure. The second may focus on phrases for meetings and follow-up. The third may focus on how the speaker balances firmness and cooperation. That layered practice makes the material valuable both for listening development and for real professional use.`
      ]),
      MIN_LISTENING_WORDS
    ),
    transcriptZh: '围绕职场沟通中的清晰表达、确认决策、提前预警与语气控制展开，适合高级磨耳朵训练。',
    duration: 425,
    level: 'advanced',
    type: 'lecture',
    tags: JSON.stringify(['easy-listening', 'free-time', 'workplace', '500-plus'])
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
      message: `已导入听力材料（每篇不少于 ${MIN_LISTENING_WORDS} 词）`,
      count: listeningMaterials.length
    })
  } catch (error) {
    console.error('Failed to import listening materials:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : '导入听力材料失败' })
  }
})

export default router
