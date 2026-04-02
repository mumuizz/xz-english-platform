import prisma from './db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 初始化词库数据
export async function initVocabData() {
  try {
    const vocabDir = path.resolve(__dirname, '../../data/vocab')
    const vocabFiles = ['cet4.json', 'ielts.json', 'business.json', 'selfstudy.json']
    
    for (const file of vocabFiles) {
      const filePath = path.join(vocabDir, file)
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ 词库文件不存在：${file}`)
        continue
      }
      
      const vocabData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const vocabCode = vocabData.code || file.replace('.json', '')
      
      // 检查是否已有数据
      const existingCount = await prisma.word.count({
        where: { vocabSet: vocabCode }
      })
      
      if (existingCount > 0) {
        console.log(`✅ 词库 ${vocabData.name} 已有 ${existingCount} 个单词`)
        continue
      }
      
      const words = vocabData.words || []
      if (words.length === 0) continue
      
      // 批量插入
      let successCount = 0
      for (const w of words) {
        try {
          await prisma.word.create({
            data: {
              userId: 1, // 默认给第一个用户
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
        } catch (e) {
          // 跳过已存在的单词
        }
      }
      
      console.log(`✅ 词库 ${vocabData.name} 已导入 ${successCount}/${words.length} 个单词`)
    }
  } catch (error) {
    console.error('❌ 初始化词库失败:', error)
  }
}

// 初始化文章数据
export async function initArticles() {
  try {
    const existingCount = await prisma.article.count()
    if (existingCount > 0) {
      console.log(`✅ 文章库已有 ${existingCount} 篇文章`)
      return
    }
    
    const articles = [
      {
        title: "China's Economy Shows Strong Recovery",
        titleZh: "中国经济展现强劲复苏",
        content: "China's economy demonstrated resilient growth in the first quarter, with GDP expanding by 5.3 percent year-on-year. The recovery was driven by strong domestic consumption and robust industrial production. Analysts say the positive momentum is expected to continue throughout the year as policy support remains in place.",
        contentZh: "中国经济在第一季度展现出韧性增长，GDP 同比增长 5.3%。复苏由强劲的内需和稳健的工业生产驱动。分析师表示，随着政策支持持续，全年有望保持积极势头。",
        source: "People's Daily",
        date: "2026-03-28",
        level: "intermediate",
        tags: JSON.stringify(["经济", "GDP"])
      },
      {
        title: "New Energy Vehicles Gain Popularity",
        titleZh: "新能源汽车日益普及",
        content: "Electric vehicle sales in China reached a new record high last month, accounting for over 30 percent of total auto sales. The government's continued support for green transportation and improved charging infrastructure have contributed to the surge. Industry experts predict NEVs will dominate the market within five years.",
        contentZh: "中国电动汽车销量上月创历史新高，占总销量的 30% 以上。政府对绿色交通的持续支持和充电设施的改善促成了这一增长。行业专家预测，新能源汽车将在五年内主导市场。",
        source: "People's Daily",
        date: "2026-03-27",
        level: "intermediate",
        tags: JSON.stringify(["科技", "新能源"])
      },
      {
        title: "Traditional Culture Finds New Life",
        titleZh: "传统文化焕发新生",
        content: "Young Chinese are increasingly embracing traditional culture through innovative approaches. From hanfu fashion to traditional music performances on social media, heritage is being reimagined for the digital age. Museums and cultural institutions report surging visitor numbers among the under-30 demographic.",
        contentZh: "中国年轻人正通过创新方式拥抱传统文化。从汉服时尚到社交媒体上的传统音乐表演，文化遗产正在数字时代被重新诠释。博物馆和文化机构报告称，30 岁以下游客数量激增。",
        source: "People's Daily",
        date: "2026-03-26",
        level: "advanced",
        tags: JSON.stringify(["文化", "传统"])
      },
      {
        title: "Rural Revitalization Progress",
        titleZh: "乡村振兴进展",
        content: "China's rural revitalization strategy has lifted millions out of poverty and transformed countryside communities. New infrastructure, e-commerce platforms, and tourism initiatives have created opportunities for rural residents. The government aims to achieve comprehensive rural modernization by 2035.",
        contentZh: "中国的乡村振兴战略使数百万人摆脱贫困，改变了乡村社区。新基础设施、电商平台和旅游项目为农村居民创造了机会。政府目标是在 2035 年前实现全面乡村振兴。",
        source: "People's Daily",
        date: "2026-03-25",
        level: "beginner",
        tags: JSON.stringify(["农村", "发展"])
      },
      {
        title: "Space Exploration Milestone",
        titleZh: "太空探索里程碑",
        content: "China's space program achieved another breakthrough with the successful launch of its latest crewed mission. The astronauts will conduct scientific experiments and technology demonstrations aboard the space station. This mission marks a significant step in China's ambitious space exploration plans.",
        contentZh: "中国航天项目取得新的突破，最新载人任务成功发射。宇航员将在空间站进行科学实验和技术演示。这次任务标志着中国雄心勃勃的太空探索计划迈出重要一步。",
        source: "People's Daily",
        date: "2026-03-24",
        level: "advanced",
        tags: JSON.stringify(["科技", "航天"])
      },
      {
        title: "Education Reform Advances",
        titleZh: "教育改革推进",
        content: "China's education system continues to evolve with new reforms aimed at reducing student burden and promoting holistic development. Schools are implementing innovative teaching methods and placing greater emphasis on creativity and critical thinking skills.",
        contentZh: "中国教育体系继续发展，新改革旨在减轻学生负担，促进全面发展。学校正在实施创新教学方法，更加重视创造力和批判性思维能力。",
        source: "People's Daily",
        date: "2026-03-23",
        level: "intermediate",
        tags: JSON.stringify(["教育", "改革"])
      },
      {
        title: "Healthcare Improvements Nationwide",
        titleZh: "全国医疗改善",
        content: "The national healthcare system has seen significant improvements with expanded coverage and better access to medical services. Rural areas particularly benefit from new clinics and telemedicine programs that connect patients with specialists in major cities.",
        contentZh: "国家医疗体系取得显著改善，覆盖范围扩大，医疗服务可及性提高。农村地区特别受益于新诊所和远程医疗项目，这些项目将患者与大城市的专家联系起来。",
        source: "People's Daily",
        date: "2026-03-22",
        level: "intermediate",
        tags: JSON.stringify(["医疗", "民生"])
      },
      {
        title: "Environmental Protection Efforts",
        titleZh: "环境保护努力",
        content: "China has intensified efforts to combat pollution and protect natural resources. Air quality in major cities has improved significantly, and renewable energy capacity continues to grow. The country aims to peak carbon emissions before 2030.",
        contentZh: "中国加大了治理污染和保护自然资源的力度。大城市空气质量显著改善，可再生能源容量持续增长。中国目标是在 2030 年前实现碳排放达峰。",
        source: "People's Daily",
        date: "2026-03-21",
        level: "advanced",
        tags: JSON.stringify(["环境", "环保"])
      }
    ]
    
    for (const article of articles) {
      try {
        await prisma.article.create({ data: article })
      } catch (e) {
        console.error('导入文章失败:', e)
      }
    }
    
    console.log(`✅ 文章库已导入 ${articles.length} 篇文章`)
  } catch (error) {
    console.error('❌ 初始化文章失败:', error)
  }
}

// 初始化听力数据
export async function initListening() {
  try {
    const existingCount = await prisma.listening.count()
    if (existingCount > 0) {
      console.log(`✅ 听力库已有 ${existingCount} 个材料`)
      return
    }
    
    const materials = [
      {
        title: "VOA Learning English - Science Report",
        titleZh: "VOA 慢速英语 - 科学报道",
        audioUrl: "https://voa-11.akacast.akamaistream.net/7/597/238986/v1/ibb.akamaized.net/media/element/2024/03/15/20240315_st_tech.mp3",
        transcript: "Scientists have made a new discovery about how the brain processes information. The research could lead to better treatments for memory-related diseases. The study was published in a leading science journal.",
        transcriptZh: "科学家在大脑如何处理信息方面有了新发现。这项研究可能带来治疗记忆相关疾病的更好方法。这项研究发表在一家领先的科学期刊上。",
        duration: 180,
        level: "beginner",
        type: "news",
        tags: JSON.stringify(["VOA", "慢速", "科学"])
      },
      {
        title: "Daily Conversation - At the Cafe",
        titleZh: "日常对话 - 在咖啡馆",
        audioUrl: "https://media.blubrry.com/eslpod/eslpod.com/episodes/2024/ESL_Podcast_2024.mp3",
        transcript: "A: What would you like to order? B: I'll have a latte, please. A: What size? B: Medium, please. A: Anything else? B: No, that's all. Thank you.",
        transcriptZh: "A: 您想点什么？B: 我要一杯拿铁。A: 什么尺寸？B: 中杯。A: 还要别的吗？B: 不用了，就这些。谢谢。",
        duration: 120,
        level: "beginner",
        type: "dialogue",
        tags: JSON.stringify(["对话", "日常", "咖啡"])
      },
      {
        title: "BBC 6 Minute English - Sleep",
        titleZh: "BBC 6 分钟英语 - 睡眠",
        audioUrl: "https://podcasts.files.bbci.co.uk/p02pc9qn.m4a",
        transcript: "How much sleep do we really need? Research suggests that most adults require between seven and nine hours per night. But modern life often makes it difficult to get enough rest. What can we do to improve our sleep habits?",
        transcriptZh: "我们到底需要多少睡眠？研究表明大多数成年人每晚需要 7 到 9 小时。但现代生活常常让我们难以获得足够的休息。我们能做些什么来改善睡眠习惯呢？",
        duration: 360,
        level: "intermediate",
        type: "lecture",
        tags: JSON.stringify(["BBC", "健康", "睡眠"])
      },
      {
        title: "NPR News - Technology Update",
        titleZh: "NPR 新闻 - 科技更新",
        audioUrl: "https://play.podtrac.com/npr-510019/edge1.pod.npr.org/anon.npr-mp3/npr/news/2024/03/20240315_news_tech.mp3",
        transcript: "Technology companies are investing heavily in artificial intelligence. New applications are being developed for healthcare, education, and transportation. Experts say AI will transform many industries in the coming years.",
        transcriptZh: "科技公司正在大力投资人工智能。新的应用正在医疗、教育和交通领域开发。专家表示，人工智能将在未来几年改变许多行业。",
        duration: 240,
        level: "advanced",
        type: "news",
        tags: JSON.stringify(["NPR", "科技", "AI"])
      },
      {
        title: "English Story - The Little Red Hen",
        titleZh: "英语故事 - 小红母鸡",
        audioUrl: "https://www.storynory.com/wp-content/uploads/2024/03/Little-Red-Hen.mp3",
        transcript: "Once upon a time, there was a little red hen who found some grains of wheat. She asked her friends to help her plant them, but they all said no. So she planted them herself. When the wheat was ready, she made bread.",
        transcriptZh: "从前，有一只小红母鸡发现了一些麦粒。她请朋友们帮她种植，但他们都说不。所以她自己种了。小麦成熟后，她做了面包。",
        duration: 300,
        level: "beginner",
        type: "story",
        tags: JSON.stringify(["故事", "寓言", "经典"])
      },
      {
        title: "Business English - Job Interview",
        titleZh: "商务英语 - 求职面试",
        audioUrl: "https://media.englishclass101.com/lessons/audio/business/interview-basics.mp3",
        transcript: "Interviewer: Tell me about yourself. Candidate: I have five years of experience in marketing. I'm skilled in digital marketing and social media management. Interviewer: Why do you want to work here? Candidate: I admire your company's innovation.",
        transcriptZh: "面试官：介绍一下你自己。候选人：我有五年的市场营销经验。我擅长数字营销和社交媒体管理。面试官：你为什么想在这里工作？候选人：我钦佩贵公司的创新。",
        duration: 200,
        level: "intermediate",
        type: "dialogue",
        tags: JSON.stringify(["商务", "面试", "工作"])
      }
    ]
    
    for (const material of materials) {
      try {
        await prisma.listening.create({ data: material })
      } catch (e) {
        console.error('导入听力失败:', e)
      }
    }
    
    console.log(`✅ 听力库已导入 ${materials.length} 个材料`)
  } catch (error) {
    console.error('❌ 初始化听力失败:', error)
  }
}

// 主初始化函数
export async function initializeData() {
  console.log('🔄 开始初始化数据...')
  await initVocabData()
  await initArticles()
  await initListening()
  console.log('✅ 数据初始化完成！')
}
