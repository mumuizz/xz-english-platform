import { useState, useMemo } from 'react'
import type { WrongQuestion } from '../../types'

interface WrongNotebookProps {
  items: WrongQuestion[]
}

export default function WrongNotebook({ items }: WrongNotebookProps) {
  const [retryMode, setRetryMode] = useState(false)
  const [retryAnswers, setRetryAnswers] = useState<Record<string, string>>({})
  const [retrySubmitted, setRetrySubmitted] = useState(false)

  const retryQuestions = useMemo(() => items.slice(0, 5), [items])
  const retryScore = useMemo(
    () => retryQuestions.reduce((sum, q) => sum + (retryAnswers[q.questionId] === q.correctAnswer ? 1 : 0), 0),
    [retryAnswers, retryQuestions]
  )

  const toggleRetry = () => {
    setRetryMode((v) => !v)
    setRetryAnswers({})
    setRetrySubmitted(false)
  }

  return (
    <section className="rounded-3xl bg-white p-8 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2b2d42]">错题本</h2>
          <p className="mt-2 text-sm text-[#8d99ae]">错题自动沉淀，并支持再练。</p>
        </div>
        <div className="flex gap-3">
          <button onClick={toggleRetry} className="rounded-2xl bg-[#2b2d42] px-5 py-3 font-semibold text-white">
            {retryMode ? '收起再练' : '错题再练'}
          </button>
          <div className="rounded-full bg-[#ef233c] px-4 py-2 text-sm font-semibold text-white">{items.length} 题</div>
        </div>
      </div>

      {retryMode && (
        <div className="mb-6 rounded-2xl border border-[#e9ecef] bg-[#f8f9fa] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#2b2d42]">错题再练</h3>
            {retrySubmitted && <span className="rounded-full bg-[#2b2d42] px-3 py-1 text-sm font-semibold text-white">得分 {retryScore}/{retryQuestions.length}</span>}
          </div>
          <div className="space-y-4">
            {retryQuestions.map((item, index) => (
              <div key={`${item.materialTitle}-${item.questionId}`} className="rounded-2xl bg-white p-5">
                <div className="text-sm text-[#8d99ae]">{item.materialTitle}</div>
                <div className="mt-2 font-semibold text-[#2b2d42]">{index + 1}. {item.question}</div>
                <div className="mt-4 space-y-2">
                  {[item.correctAnswer, item.selectedAnswer, '跳过本题', '重新判断']
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .map((option) => {
                      const selected = retryAnswers[item.questionId] === option
                      const correct = retrySubmitted && option === item.correctAnswer
                      const wrong = retrySubmitted && selected && option !== item.correctAnswer
                      return (
                        <button
                          key={option}
                          onClick={() => setRetryAnswers((prev) => ({ ...prev, [item.questionId]: option }))}
                          disabled={retrySubmitted}
                          className={`block w-full rounded-xl border px-4 py-3 text-left text-sm ${
                            correct ? 'border-[#10b981] bg-[#10b981]/10 text-[#065f46]'
                            : wrong ? 'border-[#ef233c] bg-[#ef233c]/10 text-[#991b1b]'
                            : selected ? 'border-[#2b2d42] bg-[#2b2d42]/5 text-[#2b2d42]'
                            : 'border-[#e5e7eb] bg-[#f8f9fa] text-[#374151]'
                          }`}
                        >
                          {option}
                        </button>
                      )
                    })}
                </div>
                {retrySubmitted && <div className="mt-4 rounded-xl bg-[#f8f9fa] p-4 text-sm leading-6 text-[#4b5563]">{item.explanation}</div>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setRetrySubmitted(true)}
              disabled={retrySubmitted || Object.keys(retryAnswers).length < retryQuestions.length}
              className={`flex-1 rounded-2xl px-5 py-3 font-semibold text-white ${
                retrySubmitted || Object.keys(retryAnswers).length < retryQuestions.length
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36]'
              }`}
            >
              提交再练
            </button>
            <button onClick={() => { setRetryAnswers({}); setRetrySubmitted(false) }} className="rounded-2xl border border-[#d1d5db] px-5 py-3 font-semibold text-[#2b2d42]">
              重做
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.materialTitle}-${item.questionId}`} className="rounded-2xl border border-[#e9ecef] bg-[#f8f9fa] p-5">
            <div className="text-sm text-[#8d99ae]">{item.materialTitle}</div>
            <div className="mt-2 font-semibold text-[#2b2d42]">{item.question}</div>
            <div className="mt-3 text-sm text-[#991b1b]">你的答案：{item.selectedAnswer}</div>
            <div className="mt-1 text-sm text-[#065f46]">正确答案：{item.correctAnswer}</div>
            <div className="mt-3 rounded-xl bg-white p-4 text-sm leading-6 text-[#4b5563]">{item.explanation}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
