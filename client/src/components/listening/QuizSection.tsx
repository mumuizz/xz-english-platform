import { useState, useMemo } from 'react'
import type { QuizQuestion, WrongQuestion } from '../../types'

interface QuizSectionProps {
  questions: QuizQuestion[]
  materialTitle: string
  onWrongQuestions: (items: WrongQuestion[]) => void
  onScoreReady: (score: number, total: number) => void
}

export default function QuizSection({ questions, materialTitle, onWrongQuestions, onScoreReady }: QuizSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(
    () => questions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? 1 : 0), 0),
    [answers, questions]
  )

  const submitQuiz = () => {
    setSubmitted(true)
    const wrongItems = questions
      .filter((q) => answers[q.id] !== q.answer)
      .map((q) => ({
        materialTitle,
        questionId: q.id,
        question: q.question,
        selectedAnswer: answers[q.id] || '未作答',
        correctAnswer: q.answer,
        explanation: q.explanation,
      }))
    onWrongQuestions(wrongItems)
    onScoreReady(score, questions.length)
  }

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#2b2d42]">题目模式</h3>
        {submitted && (
          <span className="rounded-full bg-[#2b2d42] px-3 py-1 text-sm font-semibold text-white">
            得分 {score}/{questions.length}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl border border-[#e9ecef] bg-white p-5">
            <div className="font-semibold text-[#2b2d42]">{index + 1}. {question.question}</div>
            <div className="mt-4 space-y-2">
              {question.options.map((option) => {
                const selected = answers[question.id] === option
                const correct = submitted && question.answer === option
                const wrong = submitted && selected && question.answer !== option
                return (
                  <button
                    key={option}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                    disabled={submitted}
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
            {submitted && (
              <div className="mt-4 rounded-xl bg-[#f8f9fa] p-4 text-sm leading-6 text-[#4b5563]">
                {question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      {questions.length > 0 && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={submitQuiz}
            disabled={submitted || Object.keys(answers).length < questions.length}
            className={`flex-1 rounded-2xl px-5 py-3 font-semibold text-white ${
              submitted || Object.keys(answers).length < questions.length
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-gradient-to-r from-[#ef233c] to-[#d91e36]'
            }`}
          >
            提交答案
          </button>
          <button onClick={reset} className="rounded-2xl border border-[#d1d5db] px-5 py-3 font-semibold text-[#2b2d42]">
            重做
          </button>
        </div>
      )}
    </div>
  )
}
