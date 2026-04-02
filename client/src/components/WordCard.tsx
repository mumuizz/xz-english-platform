import { useState, useRef } from 'react'

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

export default function WordCard({
  word,
  phonetic,
  meanings,
  examples,
  backgroundImage = 'https://images.unsplash.com/photo-1513382160661-6ea8083f0a3a?w=800&h=600&fit=crop',
  onImageChange
}: WordCardProps) {
  const [showImagePicker, setShowImagePicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleSpeak = (text: string) => {
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.onend = () => setIsPlaying(false)
    speechSynthesis.speak(utterance)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageChange) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    setShowImagePicker(false)
  }

  const presetImages = [
    'https://images.unsplash.com/photo-1513382160661-6ea8083f0a3a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507842217121-9e9f1479fb48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
  ]

  const posColors: Record<string, string> = {
    '名词': 'bg-red-50 text-red-700 border-red-200',
    '动词': 'bg-blue-50 text-blue-700 border-blue-200',
    '形容词': 'bg-green-50 text-green-700 border-green-200',
    '副词': 'bg-purple-50 text-purple-700 border-purple-200',
    '介词': 'bg-orange-50 text-orange-700 border-orange-200',
    '连词': 'bg-pink-50 text-pink-700 border-pink-200',
  }

  const posLabels: Record<string, string> = {
    '名词': 'n.',
    '动词': 'v.',
    '形容词': 'adj.',
    '副词': 'adv.',
    '介词': 'prep.',
    '连词': 'conj.',
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl">
      <div className="grid md:grid-cols-5 gap-0">
        {/* 左侧内容区 - 占 3/5 */}
        <div className="md:col-span-3 p-8">
          {/* 单词标题 */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-5xl font-bold text-gray-800">{word}</h1>
              <button
                onClick={() => handleSpeak(word)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  isPlaying ? 'bg-xz-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-xz-red hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </button>
            </div>
            <p className="text-gray-500 text-lg font-mono">/{phonetic}/</p>
          </div>

          {/* 词义区 */}
          <div className="space-y-4 mb-6">
            {meanings.map((meaning, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${posColors[meaning.pos] || 'bg-gray-100 text-gray-700'}`}>
                    {posLabels[meaning.pos] || meaning.pos}
                  </span>
                </div>
                <ul className="space-y-2">
                  {meaning.definitions.map((def, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1.5">•</span>
                      <span className="text-gray-700 text-lg">{def}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 例句区 */}
          {examples.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border-l-4 border-xz-red">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📝</span>
                <span className="font-bold text-gray-700">例句</span>
                {examples[0].speaker && (
                  <span className="px-2 py-0.5 bg-xz-red text-white text-xs rounded-full">{examples[0].speaker}</span>
                )}
              </div>
              {examples.map((example, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <div className="flex items-start gap-2 mb-1">
                    <p className="text-gray-800 text-lg flex-1">{example.en}</p>
                    <button
                      onClick={() => handleSpeak(example.en)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-xz-red hover:text-white flex items-center justify-center transition flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm ml-1">{example.zh}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧图片区 - 占 2/5 */}
        <div className="md:col-span-2 relative bg-gray-100">
          <div className="absolute inset-0">
            <img
              src={backgroundImage}
              alt="单词配图"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 更换图片按钮 */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="w-full bg-white/95 hover:bg-white backdrop-blur-sm text-gray-700 font-medium py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              更换图片
            </button>

            {/* 图片选择器 */}
            {showImagePicker && (
              <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <p className="text-sm text-gray-600 mb-3">选择预设图片</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {presetImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onImageChange?.(img)
                        setShowImagePicker(false)
                      }}
                      className="aspect-video rounded-lg overflow-hidden hover:ring-2 ring-xz-red transition"
                    >
                      <img src={img} alt={`预设${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
