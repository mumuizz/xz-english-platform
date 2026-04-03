import type { StudyRecord } from '../../types'

interface StudyRecordsProps {
  records: StudyRecord[]
}

export default function StudyRecords({ records }: StudyRecordsProps) {
  const totalStudyCount = records.length
  const averageQuizScore = totalStudyCount
    ? records.reduce((sum, item) => {
        const [num, den] = item.quizScore.split('/')
        return sum + Number(num) / Number(den)
      }, 0) / totalStudyCount
    : 0
  const averageDictationScore = totalStudyCount
    ? records.reduce((sum, item) => {
        const [num, den] = item.dictationScore.split('/')
        return sum + Number(num) / Number(den)
      }, 0) / totalStudyCount
    : 0

  return (
    <section className="rounded-3xl bg-white p-8 shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#2b2d42]">学习记录</h2>
        <p className="mt-2 text-sm text-[#8d99ae]">记录每次练习的题目得分和听写得分，用于后续统计。</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-[#f8f9fa] p-5">
          <div className="text-sm text-[#8d99ae]">练习次数</div>
          <div className="mt-2 text-3xl font-bold text-[#2b2d42]">{totalStudyCount}</div>
        </div>
        <div className="rounded-2xl bg-[#f8f9fa] p-5">
          <div className="text-sm text-[#8d99ae]">题目平均正确率</div>
          <div className="mt-2 text-3xl font-bold text-[#2b2d42]">{Math.round(averageQuizScore * 100)}%</div>
        </div>
        <div className="rounded-2xl bg-[#f8f9fa] p-5">
          <div className="text-sm text-[#8d99ae]">听写平均正确率</div>
          <div className="mt-2 text-3xl font-bold text-[#2b2d42]">{Math.round(averageDictationScore * 100)}%</div>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        {records.map((record, index) => (
          <div key={index} className="rounded-2xl border border-[#e9ecef] bg-[#f8f9fa] p-5">
            <div className="font-semibold text-[#2b2d42]">{record.materialTitle}</div>
            <div className="mt-2 text-sm text-[#8d99ae]">{record.createdAt}</div>
            <div className="mt-3 flex gap-4 text-sm">
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-[#2b2d42]">题目：{record.quizScore}</span>
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-[#2b2d42]">听写：{record.dictationScore}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
