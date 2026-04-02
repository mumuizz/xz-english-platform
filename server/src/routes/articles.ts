import { Router } from 'express'
import prisma from '../db.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// 获取文章列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { level, tag } = req.query
    const where: any = {}
    
    if (level) {
      where.level = level
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    res.json(articles)
  } catch (error) {
    console.error('获取文章错误:', error)
    res.status(500).json({ error: '获取文章失败' })
  }
})

// 获取单篇文章
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    })

    if (!article) {
      return res.status(404).json({ error: '文章不存在' })
    }

    res.json(article)
  } catch (error) {
    console.error('获取文章错误:', error)
    res.status(500).json({ error: '获取文章失败' })
  }
})

// 导入人民日报文章（增加更多文章）
router.post('/import-people-daily', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // 更多文章数据
    const sampleArticles = [
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
        content: "China's education system is undergoing comprehensive reforms to reduce student burden and promote holistic development. New policies limit homework assignments and after-school tutoring. The goal is to foster creativity and critical thinking rather than rote memorization.",
        contentZh: "中国教育体系正在进行全面改革，以减轻学生负担并促进全面发展。新政策限制了家庭作业和课外辅导。目标是培养创造力和批判性思维，而非死记硬背。",
        source: "People's Daily",
        date: "2026-03-23",
        level: "intermediate",
        tags: JSON.stringify(["教育", "改革"])
      },
      {
        title: "Green Energy Investment Grows",
        titleZh: "绿色能源投资增长",
        content: "Investment in renewable energy sources reached record levels last year. Solar and wind power capacity expanded rapidly, contributing to carbon reduction goals. China aims to peak carbon emissions before 2030 and achieve carbon neutrality by 2060.",
        contentZh: "去年可再生能源投资达到创纪录水平。太阳能和风能装机容量迅速扩大，有助于碳减排目标的实现。中国目标是在 2030 年前实现碳达峰，2060 年前实现碳中和。",
        source: "People's Daily",
        date: "2026-03-22",
        level: "intermediate",
        tags: JSON.stringify(["环保", "能源"])
      },
      {
        title: "Digital Payment Revolution",
        titleZh: "数字支付革命",
        content: "Mobile payment has become the dominant method of transaction in China. From street vendors to luxury stores, digital wallets are accepted everywhere. The convenience has transformed consumer behavior and boosted the digital economy.",
        contentZh: "移动支付已成为中国主要的交易方式。从街头小贩到奢侈品店，数字钱包无处不在。这种便利性改变了消费者行为，推动了数字经济发展。",
        source: "People's Daily",
        date: "2026-03-21",
        level: "beginner",
        tags: JSON.stringify(["科技", "金融"])
      },
      {
        title: "Healthcare System Improvements",
        titleZh: "医疗体系改善",
        content: "China's healthcare coverage has expanded to include over 95 percent of the population. New medical insurance policies reduce out-of-pocket expenses for patients. Telemedicine services are making healthcare more accessible in rural areas.",
        contentZh: "中国医保覆盖已扩大到 95% 以上的人口。新的医疗保险政策减少了患者自付费用。远程医疗服务使农村地区更容易获得医疗保健。",
        source: "People's Daily",
        date: "2026-03-20",
        level: "intermediate",
        tags: JSON.stringify(["医疗", "民生"])
      },
      {
        title: "Sports Development Achievements",
        titleZh: "体育发展成就",
        content: "China's athletes continue to excel in international competitions. Investment in sports infrastructure and training programs has yielded impressive results. The government encourages mass participation in fitness activities to improve public health.",
        contentZh: "中国运动员在国际比赛中继续表现出色。对体育基础设施和训练项目的投资取得了令人瞩目的成果。政府鼓励大众参与健身活动以改善公共健康。",
        source: "People's Daily",
        date: "2026-03-19",
        level: "beginner",
        tags: JSON.stringify(["体育", "健康"])
      },
      {
        title: "Innovation Hub Expansion",
        titleZh: "创新中心扩张",
        content: "Technology hubs in major cities are attracting startups and talent from around the world. Government support for innovation includes tax incentives and research funding. These centers are becoming engines of economic growth and technological advancement.",
        contentZh: "主要城市的科技中心正在吸引来自世界各地的初创企业和人才。政府对创新的支持包括税收优惠和研究资金。这些中心正在成为经济增长和技术进步的引擎。",
        source: "People's Daily",
        date: "2026-03-18",
        level: "advanced",
        tags: JSON.stringify(["科技", "创新"])
      },
      {
        title: "Cultural Exchange Programs",
        titleZh: "文化交流项目",
        content: "International cultural exchange programs are fostering mutual understanding between China and other countries. Art exhibitions, music performances, and academic collaborations are building bridges. People-to-people exchanges are strengthening global friendships.",
        contentZh: "国际文化交流项目正在促进中国与其他国家之间的相互理解。艺术展览、音乐表演和学术合作正在搭建桥梁。人文交流正在加强全球友谊。",
        source: "People's Daily",
        date: "2026-03-17",
        level: "intermediate",
        tags: JSON.stringify(["文化", "国际"])
      },
      {
        title: "Smart City Initiatives",
        titleZh: "智慧城市倡议",
        content: "Cities across China are implementing smart technologies to improve urban living. IoT sensors monitor traffic, air quality, and energy usage. Data-driven decision making is making cities more efficient and sustainable.",
        contentZh: "中国各地城市正在实施智能技术以改善城市生活。物联网传感器监测交通、空气质量和使用情况。数据驱动的决策使城市更加高效和可持续。",
        source: "People's Daily",
        date: "2026-03-16",
        level: "advanced",
        tags: JSON.stringify(["科技", "城市"])
      },
      {
        title: "Food Security Measures",
        titleZh: "粮食安全措施",
        content: "China is strengthening food security through agricultural modernization and technology adoption. High-yield crop varieties and precision farming techniques are increasing production. Strategic reserves ensure stable food supplies for the population.",
        contentZh: "中国正在通过农业现代化和技术采用加强粮食安全。高产品种和精准农业技术正在提高产量。战略储备确保人口的粮食供应稳定。",
        source: "People's Daily",
        date: "2026-03-15",
        level: "intermediate",
        tags: JSON.stringify(["农业", "民生"])
      },
      {
        title: "Youth Entrepreneurship Support",
        titleZh: "青年创业支持",
        content: "Government programs are supporting young entrepreneurs with funding and mentorship. Incubators and accelerators provide resources for startups. The entrepreneurial spirit among youth is driving innovation and job creation.",
        contentZh: "政府项目正在为年轻创业者提供资金和指导。孵化器和加速器为初创企业提供资源。青年创业精神正在推动创新和就业创造。",
        source: "People's Daily",
        date: "2026-03-14",
        level: "beginner",
        tags: JSON.stringify(["创业", "青年"])
      }
    ]

    // 先检查是否已存在
    const existing = await prisma.article.count()
    if (existing > 0) {
      return res.json({ message: `已有 ${existing} 篇文章`, count: existing })
    }

    const created = await Promise.all(
      sampleArticles.map(article => 
        prisma.article.create({ data: article }).catch(e => { console.error(e); return null })
      )
    )

    const successCount = created.filter(a => a !== null).length

    res.json({ 
      message: `成功导入 ${successCount} 篇文章`, 
      count: successCount 
    })
  } catch (error) {
    console.error('导入文章错误:', error)
    res.status(500).json({ error: '导入文章失败' })
  }
})

export default router
