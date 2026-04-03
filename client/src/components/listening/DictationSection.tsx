import { useState, useMemo } from 'react'
import type { DictationSegment } from '../../types'

const normalize = (value: string) => value.trim().toLowerCase()

interface DictationSectionProps {
  segments: DictationSegment[]
  onScoreReady: (score: number, total: number) => void
}

export default function DictationSection({ segments, onScoreReady }: DictationSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(
    () => segments.reduce((sum, s) => sum + (normalize(answers[s.id] || '') === normalize(s.answer) ? 1 : 0), 0),
    [answers, segments]
  )

  const submit = () => {
    setSubmitted(true)
    onScoreReady(score, segments.length)
  }

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#2b2d42]">听写模式</h3>
        {submitted && (
          <span className="rounded-full bg-[#2b2d42] px-3 py-1 text-sm font-semibold text-white">
            得分 {score}/{segments.length}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {segments.map((segment, index) => {
          const correct = normalize(answers[segment.id] || '') === normalize(segment.answer)
          return (
            <div key={segment.id} className="rounded-2xl border border-[#e9ecef] bg-white p-5">
              <div className="font-semibold text-[#2b2d42]">{index + 1}. {segment.prompt}</div>
              <input
                value={answers[segment.id] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [segment.id]: e.target.value }))}
                disabled={submitted}
                placeholder="输入听写结果"
                className="mt-4 w-full rounded-xl border border-[#d1d5db] px-4 py-3 outline-none"
              />
              {submitted && (
                <div className={`mt-4 rounded-xl p-4 text-sm ${correct ? 'bg-[#10b981]/10 text-[#065f46]' : 'bg-[#ef233c]/10 text-[#991b1b]'}`}>
                  {correct ? '听写正确' : `正确答案：${segment.answer}`}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {segments.length > 0 && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={submit}
            disabled={submitted || Object.keys(answers).length < segments.length}
            className={`flex-1 rounded-2xl px-5 py-3 font-semibold text-white ${
              submitted || Object.keys(answers).length < segments.length
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-gradient-to-r from-[#2b2d42] to-[#3f4564]'
            }`}
          >
            提交听写
          </button>
          <button onClick={reset} className="rounded-2xl border border-[#d1d5db] px-5 py-3 font-semibold text-[#2b2d42]">
            重做
          </button>
        </div>
      )}
    </div>
  )
}
