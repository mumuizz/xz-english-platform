import { useRef, useState } from 'react'

interface WordCardProps {
  word: string
  phonetic: string
  meanings: {
    pos: string
    definitions: string[]
  }[]
  examples: {
    en: string
    zh: string
    speaker?: string
  }[]
  backgroundImage?: string
  onImageChange?: (url: string) => void
}

const posColors: Record<string, string> = {
  noun: 'bg-red-50 text-red-700 border-red-200',
  verb: 'bg-blue-50 text-blue-700 border-blue-200',
  adjective: 'bg-green-50 text-green-700 border-green-200',
  adverb: 'bg-purple-50 text-purple-700 border-purple-200',
  prep: 'bg-orange-50 text-orange-700 border-orange-200',
  conjunction: 'bg-pink-50 text-pink-700 border-pink-200'
}

const posLabels: Record<string, string> = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  prep: 'prep.',
  conjunction: 'conj.'
}

const normalizePos = (value: string) => {
  const lower = value.toLowerCase()

  if (lower.includes('noun') || lower === 'n' || lower === 'n.') return 'noun'
  if (lower.includes('verb') || lower === 'v' || lower === 'v.') return 'verb'
  if (lower.includes('adj')) return 'adjective'
  if (lower.includes('adv')) return 'adverb'
  if (lower.includes('prep')) return 'prep'
  if (lower.includes('conj')) return 'conjunction'

  return lower
}

export default function WordCard({
  word,
  phonetic,
  meanings,
  examples,
  backgroundImage = 'https://images.unsplash.com/photo-1513382160661-6ea8083f0a3a?w=800&h=600&fit=crop',
  onImageChange
}: WordCardProps) {
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const presetImages = [
    'https://images.unsplash.com/photo-1513382160661-6ea8083f0a3a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507842217121-9e9f1479fb48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
  ]

  const handleSpeak = (text: string) => {
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.onend = () => setIsPlaying(false)
    speechSynthesis.speak(utterance)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImageChange) {
      setShowImagePicker(false)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      onImageChange(reader.result as string)
    }
    reader.readAsDataURL(file)
    setShowImagePicker(false)
  }

  return (
    <div className="max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="grid gap-0 md:grid-cols-5">
        <div className="p-8 md:col-span-3">
          <div className="mb-6">
            <div className="mb-2 flex items-baseline gap-3">
              <h1 className="text-5xl font-bold text-gray-800">{word}</h1>
              <button
                onClick={() => handleSpeak(word)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isPlaying ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                }`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </button>
            </div>
            <p className="font-mono text-lg text-gray-500">/{phonetic}/</p>
          </div>

          <div className="mb-6 space-y-4">
            {meanings.map((meaning, index) => {
              const normalizedPos = normalizePos(meaning.pos)
              return (
                <div key={`${normalizedPos}-${index}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        posColors[normalizedPos] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {posLabels[normalizedPos] || meaning.pos}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {meaning.definitions.map((definition, definitionIndex) => (
                      <li key={definitionIndex} className="flex items-start gap-2">
                        <span className="mt-1 text-gray-400">•</span>
                        <span className="text-lg text-gray-700">{definition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {examples.length > 0 && (
            <div className="rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-gray-50 to-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">例</span>
                <span className="font-bold text-gray-700">例句</span>
                {examples[0].speaker && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{examples[0].speaker}</span>
                )}
              </div>
              {examples.map((example, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="mb-1 flex items-start gap-2">
                    <p className="flex-1 text-lg text-gray-800">{example.en}</p>
                    <button
                      onClick={() => handleSpeak(example.en)}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition hover:bg-red-500 hover:text-white"
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="ml-1 text-sm text-gray-500">{example.zh}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative bg-gray-100 md:col-span-2">
          <div className="absolute inset-0">
            <img src={backgroundImage} alt="单词配图" className="h-full w-full object-cover" />
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setShowImagePicker((value) => !value)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/95 py-3 font-medium text-gray-700 shadow-lg backdrop-blur-sm transition hover:bg-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              更换图片
            </button>

            {showImagePicker && (
              <div className="mt-2 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                <p className="mb-3 text-sm text-gray-600">选择预设图片</p>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {presetImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onImageChange?.(image)
                        setShowImagePicker(false)
                      }}
                      className="aspect-video overflow-hidden rounded-lg transition hover:ring-2 hover:ring-red-500"
                    >
                      <img src={image} alt={`预设图 ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    上传自己的图片
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
