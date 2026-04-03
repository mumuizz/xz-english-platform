import type { QuizQuestion, DictationSegment } from '../types'

export const quizBank: Record<string, QuizQuestion[]> = {
  'Self-study Exam Dialogue: Registration Day': [
    { id: 'q1', question: '考生最晚应几点前到达？', options: ['8:00', '8:30', '9:00', '9:30'], answer: '8:30', explanation: '九点开始，需提前三十分钟。' },
    { id: 'q2', question: '考生需要自带什么？', options: ['耳机', '身份证件和黑色签字笔', '录音机', '电脑'], answer: '身份证件和黑色签字笔', explanation: '设备由考点提供。' }
  ],
  'Self-study Exam Passage: Study Schedule': [
    { id: 'q1', question: '学习计划包含几部分？', options: ['两部分', '三部分', '四部分', '五部分'], answer: '三部分', explanation: '原文直接提到 three parts。' },
    { id: 'q2', question: '哪项有助于发现反复错误？', options: ['短时复习', '集中听力', '每周阅读总结', '口语模仿'], answer: '每周阅读总结', explanation: 'weekly summary 用于发现 repeated mistakes。' }
  ],
  'Self-study Advanced Listening: Education Policy Talk': [
    { id: 'q1', question: '应重点注意哪类信号？', options: ['时间信号', '数字信号', '转折信号', '情绪信号'], answer: '转折信号', explanation: '原文强调 contrast signals。' },
    { id: 'q2', question: '主要考查什么能力？', options: ['拼写速度', '区分过去与当前改革', '背诵全文', '写作结构'], answer: '区分过去与当前改革', explanation: '原文最后说明这一点。' }
  ],
  'Easy Listening: Morning Commute English': [
    { id: 'q1', question: '通勤练习优先关注什么？', options: ['每个单词', '核心意思和重复表达', '语法术语', '标题'], answer: '核心意思和重复表达', explanation: '原文直接这样说。' },
    { id: 'q2', question: '这种练习的价值是什么？', options: ['提高写作速度', '把碎片时间变成稳定输入', '快速通过考试', '记住词根'], answer: '把碎片时间变成稳定输入', explanation: 'free time 转成 steady exposure。' }
  ],
  'Easy Listening: Health Podcast Summary': [
    { id: 'q1', question: '更有效的方法是什么？', options: ['工作更久', '减少交流', '更好地休息', '多喝咖啡'], answer: '更好地休息', explanation: '原文强调 better rest。' },
    { id: 'q2', question: '哪项没有被建议？', options: ['睡前减少看屏幕', '保持固定作息', '白天散步', '凌晨学到很晚'], answer: '凌晨学到很晚', explanation: '与原文建议相反。' }
  ],
  'Easy Listening Advanced: Workplace Communication': [
    { id: 'q1', question: '清晰沟通的价值是什么？', options: ['更强硬', '避免误解并节省时间', '减少会议', '提升口音'], answer: '避免误解并节省时间', explanation: '原文直接给出。' },
    { id: 'q2', question: '高效职场人士不会怎样做？', options: ['尽早说明预期', '写下决定', '等小问题变大再处理', '提前提风险'], answer: '等小问题变大再处理', explanation: '原文强调提前处理。' }
  ]
}

export const dictationBank: Record<string, DictationSegment[]> = {
  'Self-study Exam Dialogue: Registration Day': [
    { id: 'd1', prompt: 'listening ___ starts at nine o\u2019clock sharp', answer: 'section' },
    { id: 'd2', prompt: 'arrive at least ___ minutes early', answer: 'thirty' }
  ],
  'Self-study Exam Passage: Study Schedule': [
    { id: 'd1', prompt: 'include ___ parts', answer: 'three' },
    { id: 'd2', prompt: 'attention to ___', answer: 'details' }
  ],
  'Self-study Advanced Listening: Education Policy Talk': [
    { id: 'd1', prompt: 'topic ___ of each section', answer: 'sentence' },
    { id: 'd2', prompt: 'contrast ___', answer: 'signals' }
  ],
  'Easy Listening: Morning Commute English': [
    { id: 'd1', prompt: 'catch the ___', answer: 'subway' },
    { id: 'd2', prompt: 'repeated ___', answer: 'expressions' }
  ],
  'Easy Listening: Health Podcast Summary': [
    { id: 'd1', prompt: 'better ___ can be more effective', answer: 'rest' },
    { id: 'd2', prompt: 'before ___', answer: 'bed' }
  ],
  'Easy Listening Advanced: Workplace Communication': [
    { id: 'd1', prompt: 'prevents ___', answer: 'misunderstanding' },
    { id: 'd2', prompt: 'in ___', answer: 'writing' }
  ]
}
